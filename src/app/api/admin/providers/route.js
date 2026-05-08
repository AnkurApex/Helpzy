import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function requireAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('helpzy_session')?.value;
    if (!token) return null;
    const resp = await fetch(`http://localhost:3000/api/auth`, { headers: { cookie: `helpzy_session=${token}` }, cache: 'no-store' });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.user?.role === 'admin' ? data.user : null;
  } catch { return null; }
}

export async function GET(request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const db = await openDb();
  let query = 'SELECT p.*, u.email, u.phone FROM providers p JOIN users u ON p.user_id = u.id';
  const params = [];
  if (status) { query += ' WHERE p.status = ?'; params.push(status); }
  query += ' ORDER BY p.created_at DESC';
  return NextResponse.json(await db.all(query, params));
}

export async function PATCH(request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  const { provider_id, action } = await request.json();
  const db = await openDb();
  if (action === 'verify') {
    await db.run("UPDATE providers SET status = 'active', is_verified = 1 WHERE id = ?", [provider_id]);
    return NextResponse.json({ success: true, message: 'Provider verified.' });
  }
  if (action === 'reject') {
    await db.run("UPDATE providers SET status = 'rejected' WHERE id = ?", [provider_id]);
    return NextResponse.json({ success: true, message: 'Provider rejected.' });
  }
  if (action === 'remove') {
    await db.run('DELETE FROM providers WHERE id = ?', [provider_id]);
    return NextResponse.json({ success: true, message: 'Provider removed.' });
  }
  return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
}
