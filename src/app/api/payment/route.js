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

// POST /api/payment — initiate payment
export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { booking_id, method, upi_id } = await request.json();
    const db = await openDb();

    const booking = await db.get(
      "SELECT * FROM bookings WHERE id = $1 AND customer_id = $2",
      [booking_id, user.id]
    );
    if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    if (!['completed', 'reviewed'].includes(booking.status) && booking.payment_status !== 'unpaid') {
      return NextResponse.json({ error: 'Payment not applicable for this booking.' }, { status: 400 });
    }

    const transaction_ref = 'HLZ' + Date.now() + Math.floor(Math.random() * 1000);

    // UPI methods: simulate payment initiation
    if (['upi', 'phonepe', 'paytm', 'gpay'].includes(method)) {
      const existing = await db.get('SELECT id FROM payments WHERE booking_id = $1', [booking_id]);
      if (existing) {
        await db.run('UPDATE payments SET method = $1, upi_id = $2, status = $3, transaction_ref = $4 WHERE booking_id = $5',
          [method, upi_id || null, 'pending', transaction_ref, booking_id]);
      } else {
        await db.run(
          'INSERT INTO payments (booking_id, amount, method, upi_id, status, transaction_ref) VALUES ($1,$2,$3,$4,$5,$6)',
          [booking_id, booking.total_amount, method, upi_id || null, 'pending', transaction_ref]
        );
      }
      return NextResponse.json({
        success: true,
        method,
        transaction_ref,
        amount: booking.total_amount,
        upi_link: method === 'upi' ? `upi://pay?pa=${upi_id || 'helpzy@upi'}&pn=Helpzy&am=${booking.total_amount}&cu=INR&tn=Booking%20${booking_id}` : null,
        message: 'Payment initiated. Complete payment in your UPI app.',
      });
    }

    // Cash payment: mark directly as paid
    if (method === 'cash') {
      await db.run("UPDATE bookings SET payment_status = 'paid', payment_method = 'cash' WHERE id = $1", [booking_id]);
      const existing = await db.get('SELECT id FROM payments WHERE booking_id = $1', [booking_id]);
      if (existing) {
        await db.run("UPDATE payments SET status = 'paid' WHERE booking_id = $1", [booking_id]);
      } else {
        await db.run('INSERT INTO payments (booking_id, amount, method, status, transaction_ref) VALUES ($1,$2,$3,$4,$5)',
          [booking_id, booking.total_amount, 'cash', 'paid', transaction_ref]);
      }
      return NextResponse.json({ success: true, method: 'cash', message: 'Cash payment recorded.' });
    }

    return NextResponse.json({ error: 'Invalid payment method.' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/payment — confirm payment
export async function PATCH(request) {
  try {
    const { transaction_ref, status } = await request.json();
    if (!transaction_ref) return NextResponse.json({ error: 'Transaction ref required.' }, { status: 400 });

    const db = await openDb();
    const payment = await db.get('SELECT * FROM payments WHERE transaction_ref = $1', [transaction_ref]);
    if (!payment) return NextResponse.json({ error: 'Payment not found.' }, { status: 404 });

    await db.run("UPDATE payments SET status = $1 WHERE transaction_ref = $2", [status || 'paid', transaction_ref]);
    if (status === 'paid' || !status) {
      await db.run("UPDATE bookings SET payment_status = 'paid' WHERE id = $1", [payment.booking_id]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
