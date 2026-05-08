import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('helpzy_session')?.value;
    if (!token) return null;
    const resp = await fetch(`http://localhost:3000/api/auth`, { headers: { cookie: `helpzy_session=${token}` }, cache: 'no-store' });
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

    const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    // Customer: cancel booking
    if (action === 'cancel') {
      if (booking.customer_id !== user.id && user.role !== 'admin') {
        return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
      }
      if (['completed', 'paid', 'cancelled'].includes(booking.status)) {
        return NextResponse.json({ error: 'Cannot cancel this booking.' }, { status: 400 });
      }
      await db.run("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [id]);
      return NextResponse.json({ success: true, status: 'cancelled' });
    }

    // Provider: accept booking
    if (action === 'accept') {
      const provider = await db.get('SELECT id FROM providers WHERE user_id = ?', [user.id]);
      if (!provider || booking.provider_id !== provider.id) {
        return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
      }
      await db.run("UPDATE bookings SET status = 'accepted' WHERE id = ?", [id]);
      // Notify customer
      await db.run('INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)', [
        booking.customer_id,
        `Your ${booking.service_category} booking for ${booking.booking_date} has been accepted.`,
        'booking'
      ]);
      return NextResponse.json({ success: true, status: 'accepted' });
    }

    // Provider: reject booking
    if (action === 'reject') {
      const provider = await db.get('SELECT id FROM providers WHERE user_id = ?', [user.id]);
      if (!provider || booking.provider_id !== provider.id) {
        return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
      }
      await db.run("UPDATE bookings SET status = 'rejected' WHERE id = ?", [id]);
      return NextResponse.json({ success: true, status: 'rejected' });
    }

    // Provider: verify OTP
    if (action === 'verify_otp') {
      const provider = await db.get('SELECT id FROM providers WHERE user_id = ?', [user.id]);
      if (!provider || booking.provider_id !== provider.id) {
        return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
      }
      if (booking.otp !== otp) {
        return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 });
      }
      await db.run("UPDATE bookings SET status = 'in_progress', otp_verified = 1 WHERE id = ?", [id]);
      return NextResponse.json({ success: true, status: 'in_progress' });
    }

    // Provider: mark complete
    if (action === 'complete') {
      const provider = await db.get('SELECT id FROM providers WHERE user_id = ?', [user.id]);
      if (!provider || booking.provider_id !== provider.id) {
        return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
      }
      if (!booking.otp_verified) {
        return NextResponse.json({ error: 'OTP must be verified before marking complete.' }, { status: 400 });
      }
      await db.run("UPDATE bookings SET status = 'completed' WHERE id = ?", [id]);
      // Notify customer to pay
      await db.run('INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)', [
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
      WHERE b.id = ?
    `, [id]);
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
