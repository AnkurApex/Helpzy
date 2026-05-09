import { NextResponse } from 'next/server';
import { query, run } from '@/lib/db';
import { requireRole } from '@/lib/auth';

async function requireAdminResponse() {
  const session = await requireRole('admin');
  if (session.error) return NextResponse.json({ error: session.error }, { status: session.status });
  return null;
}

export async function GET() {
  try {
    const denied = await requireAdminResponse();
    if (denied) return denied;

    const users = await query(
      'SELECT id, name, email, phone, role, address, city, state, pincode, is_blocked, created_at FROM users ORDER BY created_at DESC'
    );
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const denied = await requireAdminResponse();
    if (denied) return denied;

    const { user_id, action } = await req.json();
    if (!user_id) return NextResponse.json({ error: 'User id is required' }, { status: 400 });

    if (action === 'block') {
      await run("UPDATE users SET is_blocked = 1 WHERE id = ? AND role != 'admin'", [user_id]);
      return NextResponse.json({ message: 'User blocked' });
    }

    if (action === 'unblock') {
      await run("UPDATE users SET is_blocked = 0 WHERE id = ? AND role != 'admin'", [user_id]);
      return NextResponse.json({ message: 'User unblocked' });
    }

    if (action === 'delete') {
      await run("DELETE FROM users WHERE id = ? AND role != 'admin'", [user_id]);
      return NextResponse.json({ message: 'User deleted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
