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

// PATCH /api/bookings/[id] — update booking status
export async function PATCH(request, { params }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { action, otp } = body;
    const db = await openDb();

    const booking = await db.get('SELECT * FROM bookings WHERE id = $1', [id]);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    if (action === 'cancel') {
      if (booking.customer_id !== user.id && user.role !== 'admin') {
        return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
      }
      if (['completed', 'paid', 'cancelled'].includes(booking.status)) {
        return NextResponse.json({ error: 'Cannot cancel this booking.' }, { status: 400 });
      }
      await db.run("UPDATE bookings SET status = 'cancelled' WHERE id = $1", [id]);
      return NextResponse.json({ success: true, status: 'cancelled' });
    }

    if (action === 'accept') {
      const provider = await db.get('SELECT id FROM providers WHERE user_id = $1', [user.id]);
      if (!provider || booking.provider_id !== provider.id) {
        return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
      }
      await db.run("UPDATE bookings SET status = 'accepted' WHERE id = $1", [id]);
      await db.run('INSERT INTO notifications (user_id, message, type) VALUES ($1,$2,$3)', [
        booking.customer_id,
        `Your ${booking.service_category} booking for ${booking.booking_date} has been accepted.`,
        'booking'
      ]);
      return NextResponse.json({ success: true, status: 'accepted' });
    }

    if (action === 'reject') {
      const provider = await db.get('SELECT id FROM providers WHERE user_id = $1', [user.id]);
      if (!provider || booking.provider_id !== provider.id) {
        return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
      }
      await db.run("UPDATE bookings SET status = 'rejected' WHERE id = $1", [id]);
      return NextResponse.json({ success: true, status: 'rejected' });
    }

    if (action === 'verify_otp') {
      const provider = await db.get('SELECT id FROM providers WHERE user_id = $1', [user.id]);
      if (!provider || booking.provider_id !== provider.id) {
        return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
      }
      if (booking.otp !== otp) {
        return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 });
      }
      await db.run("UPDATE bookings SET status = 'in_progress', otp_verified = 1 WHERE id = $1", [id]);
      return NextResponse.json({ success: true, status: 'in_progress' });
    }

    if (action === 'complete') {
      const provider = await db.get('SELECT id FROM providers WHERE user_id = $1', [user.id]);
      if (!provider || booking.provider_id !== provider.id) {
        return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
      }
      if (!booking.otp_verified) {
        return NextResponse.json({ error: 'OTP must be verified before marking complete.' }, { status: 400 });
      }
      await db.run("UPDATE bookings SET status = 'completed' WHERE id = $1", [id]);
      await db.run('INSERT INTO notifications (user_id, message, type) VALUES ($1,$2,$3)', [
        booking.customer_id,
        `Your ${booking.service_category} service is complete. Please make payment of ₹${booking.total_amount}.`,
        'payment'
      ]);
      return NextResponse.json({ success: true, status: 'completed' });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const db = await openDb();
    const booking = await db.get(`
      SELECT b.*, u.name as customer_name, u.phone as customer_phone,
             p.business_name as provider_name, p.category as provider_category
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      LEFT JOIN providers p ON b.provider_id = p.id
      WHERE b.id = $1
    `, [id]);
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
