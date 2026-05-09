import { NextResponse } from 'next/server';
import { run, get, hashPassword, verifyPassword } from '@/lib/db';
import { clearSessionCookie, getCurrentUser, setSessionCookie } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}

export async function POST(req) {
  try {
    const { action, email, password, name, phone, role } = await req.json();

    if (action === 'signup') {
      const normalizedEmail = email?.toLowerCase().trim();
      if (!normalizedEmail || !password || !name) {
        return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
      }

      const existingUser = await get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 });
      }

      const safeRole = ['customer', 'provider'].includes(role) ? role : 'customer';
      const result = await run(
        'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
        [name.trim(), normalizedEmail, hashPassword(password), phone || null, safeRole]
      );

      return NextResponse.json({ 
        message: 'User created', 
        user: { id: result.lastID, name: name.trim(), email: normalizedEmail, role: safeRole }
      });
    }

    if (action === 'login') {
      const normalizedEmail = email?.toLowerCase().trim();
      const user = await get('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
      if (!user || !verifyPassword(password || '', user.password)) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      if (user.is_blocked) {
        return NextResponse.json({ error: 'Your account has been blocked. Contact support.' }, { status: 403 });
      }

      if (!user.password?.startsWith('scrypt:')) {
        await run('UPDATE users SET password = ? WHERE id = ?', [hashPassword(password), user.id]);
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

      setSessionCookie(response, user);

      return response;
    }

    if (action === 'logout') {
      const response = NextResponse.json({ message: 'Logged out' });
      clearSessionCookie(response);
      return response;
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
