import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('helpzy_session')?.value;
    if (!token) return null;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resp = await fetch(`${baseUrl}/api/auth`, { headers: { cookie: `helpzy_session=${token}` }, cache: 'no-store' });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.user;
  } catch { return null; }
}

// POST /api/reviews — submit review
export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'customer') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { booking_id, provider_id, rating, review_text } = await request.json();
    if (!booking_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid review data.' }, { status: 400 });
    }

    const db = await openDb();
    const booking = await db.get(
      "SELECT * FROM bookings WHERE id = $1 AND customer_id = $2 AND status = 'completed'",
      [booking_id, user.id]
    );
    if (!booking) return NextResponse.json({ error: 'You can only review completed bookings.' }, { status: 400 });

    const existing = await db.get('SELECT id FROM reviews WHERE booking_id = $1', [booking_id]);
    if (existing) return NextResponse.json({ error: 'You already reviewed this booking.' }, { status: 409 });

    const pid = provider_id || booking.provider_id;
    await db.run(
      'INSERT INTO reviews (booking_id, customer_id, provider_id, rating, review_text) VALUES ($1,$2,$3,$4,$5)',
      [booking_id, user.id, pid, rating, review_text || '']
    );

    // Update provider rating
    const stats = await db.get('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE provider_id = $1', [pid]);
    await db.run(
      'UPDATE providers SET rating = $1, review_count = $2 WHERE id = $3',
      [Math.round(parseFloat(stats.avg) * 10) / 10, parseInt(stats.count), pid]
    );

    await db.run("UPDATE bookings SET status = 'reviewed' WHERE id = $1", [booking_id]);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET /api/reviews?provider_id=X
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('provider_id');
    const db = await openDb();
    const reviews = await db.all(`
      SELECT r.*, u.name as customer_name
      FROM reviews r JOIN users u ON r.customer_id = u.id
      WHERE r.provider_id = $1
      ORDER BY r.created_at DESC
    `, [providerId]);
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
