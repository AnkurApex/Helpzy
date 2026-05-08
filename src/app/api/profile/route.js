import { openDb, hashPassword } from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('helpzy_session')?.value;
    if (!token) return null;
    const resp = await fetch(`http://localhost:3000/api/auth`, { headers: { cookie: `helpzy_session=${token}` }, cache: 'no-store' });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.user;
  } catch { return null; }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = await openDb();
    const profile = await db.get('SELECT id, name, email, phone, role, address, city, state, pincode FROM users WHERE id = ?', [user.id]);
    if (user.role === 'provider') {
      const provider = await db.get('SELECT * FROM providers WHERE user_id = ?', [user.id]);
      return NextResponse.json({ ...profile, provider });
    }
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const { name, phone, address, city, state, pincode, password, new_password } = body;
    const db = await openDb();

    // Password change
    if (new_password) {
      const current = await db.get('SELECT password FROM users WHERE id = ?', [user.id]);
      if (current.password !== hashPassword(password || '') && current.password !== password) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
      }
      if (new_password.length < 6) return NextResponse.json({ error: 'New password must be at least 6 characters.' }, { status: 400 });
      await db.run('UPDATE users SET password = ? WHERE id = ?', [hashPassword(new_password), user.id]);
    }

    await db.run(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address), city = COALESCE(?, city), state = COALESCE(?, state), pincode = COALESCE(?, pincode) WHERE id = ?',
      [name || null, phone || null, address || null, city || null, state || null, pincode || null, user.id]
    );

    // Update provider profile too if provider
    if (user.role === 'provider' && body.business_name) {
      await db.run('UPDATE providers SET business_name = ?, description = ?, city = ?, pincode = ? WHERE user_id = ?',
        [body.business_name, body.description || null, city || null, pincode || null, user.id]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
