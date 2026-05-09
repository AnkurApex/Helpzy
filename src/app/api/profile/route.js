import { NextResponse } from 'next/server';
import { get, run, hashPassword, verifyPassword } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await requireUser();
    if (session.error) return NextResponse.json({ error: session.error }, { status: session.status });

    const user = await get(
      'SELECT id, name, email, phone, role, address, city, state, pincode, is_blocked, created_at FROM users WHERE id = ?',
      [session.user.id]
    );
    if (!user) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const provider = user.role === 'provider'
      ? await get('SELECT * FROM providers WHERE user_id = ?', [user.id])
      : null;

    return NextResponse.json({ ...user, provider });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await requireUser();
    if (session.error) return NextResponse.json({ error: session.error }, { status: session.status });

    const body = await req.json();

    if (body.new_password) {
      if (!body.password || body.new_password.length < 6) {
        return NextResponse.json({ error: 'Current password and a 6+ character new password are required' }, { status: 400 });
      }

      const user = await get('SELECT id, password FROM users WHERE id = ?', [session.user.id]);
      if (!user || !verifyPassword(body.password, user.password)) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      await run('UPDATE users SET password = ? WHERE id = ?', [hashPassword(body.new_password), session.user.id]);
      return NextResponse.json({ message: 'Password updated' });
    }

    const { name, phone, address, city, state, pincode, business_name, description } = body;
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    await run(
      'UPDATE users SET name = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ? WHERE id = ?',
      [name.trim(), phone || null, address || null, city || null, state || 'Maharashtra', pincode || null, session.user.id]
    );

    if (session.user.role === 'provider' && (business_name || description)) {
      await run(
        'UPDATE providers SET business_name = COALESCE(?, business_name), description = COALESCE(?, description), city = COALESCE(?, city), pincode = COALESCE(?, pincode) WHERE user_id = ?',
        [business_name || null, description || null, city || null, pincode || null, session.user.id]
      );
    }

    return NextResponse.json({ message: 'Profile updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
