import { NextResponse } from 'next/server';
import { run, get } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('helpzy_user');

    if (!userCookie) {
      return NextResponse.json({ user: null });
    }

    const userData = JSON.parse(userCookie.value);
    return NextResponse.json({ user: userData });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}

export async function POST(req) {
  try {
    const { action, email, password, name, phone, role } = await req.json();

    if (action === 'signup') {
      const existingUser = await get('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 });
      }

      const result = await run(
        'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, password, phone, role || 'user']
      );

      return NextResponse.json({ 
        message: 'User created', 
        user: { id: result.lastID, name, email, role: role || 'user' } 
      });
    }

    if (action === 'login') {
      const user = await get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      // If user is provider, get provider details
      let providerData = null;
      if (user.role === 'provider') {
        providerData = await get('SELECT * FROM providers WHERE user_id = ?', [user.id]);
      }

      const response = NextResponse.json({ 
        message: 'Login successful', 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          phone: user.phone,
          provider_id: providerData?.id 
        } 
      });

      // Set a simple session cookie for dashboard access
      response.cookies.set('helpzy_user', JSON.stringify({
        id: user.id,
        role: user.role,
        name: user.name
      }), { path: '/', maxAge: 60 * 60 * 24 });

      return response;
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
