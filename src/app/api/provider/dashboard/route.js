import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function requireProvider() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('helpzy_session')?.value;
    if (!token) return null;
    const resp = await fetch(`http://localhost:3000/api/auth`, { headers: { cookie: `helpzy_session=${token}` }, cache: 'no-store' });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.user?.role === 'provider' ? data.user : null;
  } catch { return null; }
}

export async function GET() {
  try {
    const user = await requireProvider();
    if (!user) return NextResponse.json({ error: 'Provider access required.' }, { status: 403 });

    const db = await openDb();
    const provider = await db.get('SELECT * FROM providers WHERE user_id = ?', [user.id]);
    if (!provider) return NextResponse.json({ error: 'Provider profile not found.' }, { status: 404 });

    const [bookings, earnings, reviews] = await Promise.all([
      db.all(`SELECT b.*, u.name as customer_name, u.phone as customer_phone
              FROM bookings b JOIN users u ON b.customer_id = u.id
              WHERE b.provider_id = ? ORDER BY b.created_at DESC`, [provider.id]),
      db.get("SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings WHERE provider_id = ? AND payment_status = 'paid'", [provider.id]),
      db.all(`SELECT r.*, u.name as customer_name FROM reviews r JOIN users u ON r.customer_id = u.id
              WHERE r.provider_id = ? ORDER BY r.created_at DESC LIMIT 5`, [provider.id]),
    ]);

    return NextResponse.json({ provider, bookings, earnings: earnings.total, reviews });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
