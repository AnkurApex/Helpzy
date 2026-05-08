import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function requireAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('helpzy_session')?.value;
    if (!token) return null;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resp = await fetch(`${baseUrl}/api/auth`, { headers: { cookie: `helpzy_session=${token}` }, cache: 'no-store' });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.user?.role === 'admin' ? data.user : null;
  } catch { return null; }
}

// GET /api/admin/users — list all users
export async function GET(request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');
  const db = await openDb();
  let queryStr = 'SELECT id, name, email, phone, role, city, pincode, is_blocked, created_at FROM users';
  const params = [];
  if (role) {
    queryStr += ' WHERE role = $1';
    params.push(role);
  }
  queryStr += ' ORDER BY created_at DESC';
  const users = await db.all(queryStr, params);
  return NextResponse.json(users);
}

// PATCH /api/admin/users — block/unblock user
export async function PATCH(request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  const { user_id, action } = await request.json();
  const db = await openDb();
  if (action === 'block') {
    await db.run('UPDATE users SET is_blocked = 1 WHERE id = $1', [user_id]);
    return NextResponse.json({ success: true, message: 'User blocked.' });
  }
  if (action === 'unblock') {
    await db.run('UPDATE users SET is_blocked = 0 WHERE id = $1', [user_id]);
    return NextResponse.json({ success: true, message: 'User unblocked.' });
  }
  if (action === 'delete') {
    await db.run("DELETE FROM users WHERE id = $1 AND role != 'admin'", [user_id]);
    return NextResponse.json({ success: true, message: 'User removed.' });
  }
  return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
}
