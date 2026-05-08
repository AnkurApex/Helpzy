import { NextResponse } from 'next/server';
import { get, run } from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const user = await get('SELECT * FROM users WHERE id = ?', [id]);
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id, name, phone, email } = await req.json();
    await run(
      'UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?',
      [name, phone, email, id]
    );
    return NextResponse.json({ message: 'Profile updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
