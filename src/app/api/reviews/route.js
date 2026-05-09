import { NextResponse } from 'next/server';
import { query, run, get } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get('providerId');
    if (!providerId) return NextResponse.json({ error: 'Provider id is required' }, { status: 400 });

    const reviews = await query(`
      SELECT r.*, u.name as customer_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      WHERE r.provider_id = ?
      ORDER BY r.created_at DESC
    `, [providerId]);

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await requireUser();
    if (session.error) return NextResponse.json({ error: session.error }, { status: session.status });

    const { booking_id, provider_id, rating, review_text, comment } = await req.json();
    const safeRating = Number(rating);
    if (!booking_id || !provider_id || safeRating < 1 || safeRating > 5) {
      return NextResponse.json({ error: 'Booking, provider, and a 1-5 rating are required' }, { status: 400 });
    }

    const booking = await get(
      'SELECT * FROM bookings WHERE id = ? AND customer_id = ? AND provider_id = ? AND status = ?',
      [booking_id, session.user.id, provider_id, 'completed']
    );
    if (!booking) return NextResponse.json({ error: 'Completed booking not found' }, { status: 404 });

    await run(`
      INSERT INTO reviews (booking_id, customer_id, provider_id, rating, review_text)
      VALUES (?, ?, ?, ?, ?)
    `, [booking_id, session.user.id, provider_id, safeRating, review_text || comment || null]);

    await run(`
      UPDATE providers
      SET rating = (SELECT AVG(rating) FROM reviews WHERE provider_id = ?),
          review_count = (SELECT COUNT(*) FROM reviews WHERE provider_id = ?)
      WHERE id = ?
    `, [provider_id, provider_id, provider_id]);
    await run('UPDATE bookings SET status = ? WHERE id = ?', ['reviewed', booking_id]);

    return NextResponse.json({ message: 'Review added' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
}
