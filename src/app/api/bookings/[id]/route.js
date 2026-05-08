import { NextResponse } from 'next/server';
import { get, run } from '@/lib/db';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const booking = await get(`
      SELECT b.*, p.business_name, p.category, u.name as customer_name, u.phone as customer_phone
      FROM bookings b
      JOIN providers p ON b.provider_id = p.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `, [id]);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const { status } = await req.json();

    await run('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

    return NextResponse.json({ message: 'Status updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
