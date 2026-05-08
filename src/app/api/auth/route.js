import { NextResponse } from 'next/server';
import { openDb, hashPassword, dbGet } from '@/lib/db';
import { cookies } from 'next/headers';

// In-memory session store
const sessions = new Map();

function createSession(userId, role, name) {
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);
  sessions.set(token, { userId, role, name, createdAt: Date.now() });
  return token;
}

function getSession(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() - session.createdAt > 7 * 24 * 60 * 60 * 1000) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;
    const db = await openDb();

    // ── REGISTER ──
    if (action === 'register') {
      const { name, email, password, phone, role, city, pincode } = body;
      if (!name || !email || !password) {
        return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
      }
      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
      }
      const existing = await db.get('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
      }
      const hashed = hashPassword(password);
      const newUser = await dbGet(
        'INSERT INTO users (name, email, password, phone, role, city, pincode) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
        [name.trim(), email.toLowerCase().trim(), hashed, phone || null, role || 'customer', city || null, pincode || null]
      );
      const userId = newUser.id;

      if (role === 'provider' && body.category) {
        const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + userId;
        await db.run(
          'INSERT INTO providers (user_id, business_name, slug, category, city, pincode, status) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          [userId, name, slug, body.category, city || '', pincode || '', 'pending']
        );
      }

      const token = createSession(userId, role || 'customer', name);
      const response = NextResponse.json({
        success: true,
        user: { id: userId, name, email, role: role || 'customer' }
      }, { status: 201 });
      response.cookies.set('helpzy_session', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' });
      return response;
    }

    // ── LOGIN ──
    if (action === 'login') {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
      }
      const user = await db.get('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
      }
      if (user.is_blocked) {
        return NextResponse.json({ error: 'Your account has been blocked. Please contact support.' }, { status: 403 });
      }
      const hashed = hashPassword(password);
      if (user.password !== hashed && user.password !== password) {
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
      }
      const token = createSession(user.id, user.role, user.name);
      const response = NextResponse.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
      response.cookies.set('helpzy_session', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' });
      return response;
    }

    // ── LOGOUT ──
    if (action === 'logout') {
      const cookieStore = await cookies();
      const token = cookieStore.get('helpzy_session')?.value;
      if (token) sessions.delete(token);
      const response = NextResponse.json({ success: true });
      response.cookies.delete('helpzy_session');
      return response;
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('helpzy_session')?.value;
    const session = getSession(token);
    if (!session) return NextResponse.json({ user: null });
    const db = await openDb();
    const user = await db.get('SELECT id, name, email, phone, role, city, pincode, address, state FROM users WHERE id = $1', [session.userId]);
    if (!user) return NextResponse.json({ user: null });

    if (user.role === 'provider') {
      const provider = await db.get('SELECT id, status, is_verified, category FROM providers WHERE user_id = $1', [user.id]);
      return NextResponse.json({ user: { ...user, provider } });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth GET error:', error);
    return NextResponse.json({ user: null });
  }
}

export { getSession };
