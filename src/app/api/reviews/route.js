import { NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get('providerId');

    const reviews = await query(`
      SELECT r.*, u.name as user_name 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
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
    const { booking_id, user_id, provider_id, rating, comment } = await req.json();

    await run(`
      INSERT INTO reviews (booking_id, user_id, provider_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `, [booking_id, user_id, provider_id, rating, comment]);

    // Update provider rating
    await run(`
      UPDATE providers 
      SET rating = (SELECT AVG(rating) FROM reviews WHERE provider_id = ?),
          review_count = (SELECT COUNT(*) FROM reviews WHERE provider_id = ?)
      WHERE id = ?
    `, [provider_id, provider_id, provider_id]);

    return NextResponse.json({ message: 'Review added' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
}
