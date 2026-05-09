import { NextResponse } from 'next/server';
import { get, run } from '@/lib/db';
import { requireUser } from '@/lib/auth';

async function loadBooking(id) {
  return get(`
    SELECT b.*, p.user_id as provider_user_id, p.business_name, p.category, u.name as customer_name, u.phone as customer_phone
    FROM bookings b
    LEFT JOIN providers p ON b.provider_id = p.id
    JOIN users u ON b.customer_id = u.id
    WHERE b.id = ?
  `, [id]);
}

function canView(user, booking) {
  return user.role === 'admin' || booking.customer_id === user.id || booking.provider_user_id === user.id;
}

export async function GET(req, { params }) {
  try {
    const session = await requireUser();
    if (session.error) return NextResponse.json({ error: session.error }, { status: session.status });

    const { id } = await params;
    const booking = await loadBooking(id);

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (!canView(session.user, booking)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await requireUser();
    if (session.error) return NextResponse.json({ error: session.error }, { status: session.status });

    const { id } = await params;
    const { action, status, otp } = await req.json();
    const booking = await loadBooking(id);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const requestedAction = action || status;
    let nextStatus = null;

    if (requestedAction === 'cancel') {
      if (booking.customer_id !== session.user.id && session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (!['pending', 'accepted'].includes(booking.status)) {
        return NextResponse.json({ error: 'This booking cannot be cancelled' }, { status: 400 });
      }
      nextStatus = 'cancelled';
    } else {
      if (booking.provider_user_id !== session.user.id && session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      if (requestedAction === 'accept') nextStatus = 'accepted';
      if (requestedAction === 'reject') nextStatus = 'rejected';
      if (requestedAction === 'complete') nextStatus = 'completed';
      if (requestedAction === 'verify_otp') {
        if (booking.otp !== otp) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        await run('UPDATE bookings SET status = ?, otp_verified = 1 WHERE id = ?', ['in_progress', id]);
        return NextResponse.json({ message: 'OTP verified', status: 'in_progress' });
      }
    }

    if (!nextStatus) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    await run('UPDATE bookings SET status = ? WHERE id = ?', [nextStatus, id]);

    return NextResponse.json({ message: 'Status updated', status: nextStatus });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
