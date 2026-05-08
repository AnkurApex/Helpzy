import { NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const providerId = searchParams.get('providerId');

    let bookings;
    if (userId) {
      bookings = await query(`
        SELECT b.*, p.business_name, p.category 
        FROM bookings b 
        JOIN providers p ON b.provider_id = p.id 
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
      `, [userId]);
    } else if (providerId) {
      bookings = await query(`
        SELECT b.*, u.name as customer_name, u.phone as customer_phone
        FROM bookings b 
        JOIN users u ON b.user_id = u.id 
        WHERE b.provider_id = ?
        ORDER BY b.created_at DESC
      `, [providerId]);
    } else {
      return NextResponse.json({ error: 'Missing userId or providerId' }, { status: 400 });
    }

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { user_id, provider_id, service_date, service_time, address, city, pincode, total_price } = data;

    const result = await run(`
      INSERT INTO bookings (user_id, provider_id, service_date, service_time, address, city, pincode, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [user_id, provider_id, service_date, service_time, address, city, pincode, total_price]);

    return NextResponse.json({ message: 'Booking successful', id: result.lastID });
  } catch (error) {
    console.error('Booking Error:', error);
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 });
  }
}
