import { NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET() {
  try {
    const users = await query('SELECT * FROM users ORDER BY created_at DESC');
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await run('DELETE FROM users WHERE id = ?', [id]);
    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { user_id, action } = await req.json();
    
    if (action === 'block') {
      await run('UPDATE users SET is_blocked = 1 WHERE id = ?', [user_id]);
      return NextResponse.json({ message: 'User blocked' });
    }
    
    if (action === 'unblock') {
      await run('UPDATE users SET is_blocked = 0 WHERE id = ?', [user_id]);
      return NextResponse.json({ message: 'User unblocked' });
    }

    if (action === 'delete') {
      await run('DELETE FROM users WHERE id = ?', [user_id]);
      return NextResponse.json({ message: 'User deleted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
