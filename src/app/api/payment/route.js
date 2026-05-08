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

// POST /api/payment — initiate payment
export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { booking_id, method, upi_id } = await request.json();
    const db = await openDb();

    const booking = await db.get(
      "SELECT * FROM bookings WHERE id = ? AND customer_id = ?",
      [booking_id, user.id]
    );
    if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    if (!['completed', 'reviewed'].includes(booking.status) && booking.payment_status !== 'unpaid') {
      return NextResponse.json({ error: 'Payment not applicable for this booking.' }, { status: 400 });
    }

    const transaction_ref = 'HLZ' + Date.now() + Math.floor(Math.random() * 1000);

    // UPI methods: simulate payment initiation
    if (['upi', 'phonepe', 'paytm', 'gpay'].includes(method)) {
      // In production: integrate with Razorpay/PayU/Cashfree
      // For now: create a pending payment record and return a simulated UPI deep link
      const existing = await db.get('SELECT id FROM payments WHERE booking_id = ?', [booking_id]);
      if (existing) {
        await db.run('UPDATE payments SET method = ?, upi_id = ?, status = ?, transaction_ref = ? WHERE booking_id = ?',
          [method, upi_id || null, 'pending', transaction_ref, booking_id]);
      } else {
        await db.run(
          'INSERT INTO payments (booking_id, amount, method, upi_id, status, transaction_ref) VALUES (?, ?, ?, ?, ?, ?)',
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
      await db.run("UPDATE bookings SET payment_status = 'paid', payment_method = 'cash' WHERE id = ?", [booking_id]);
      const existing = await db.get('SELECT id FROM payments WHERE booking_id = ?', [booking_id]);
      if (existing) {
        await db.run("UPDATE payments SET status = 'paid' WHERE booking_id = ?", [booking_id]);
      } else {
        await db.run('INSERT INTO payments (booking_id, amount, method, status, transaction_ref) VALUES (?, ?, ?, ?, ?)',
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

// PATCH /api/payment — confirm payment (webhook/callback simulation)
export async function PATCH(request) {
  try {
    const { transaction_ref, status } = await request.json();
    if (!transaction_ref) return NextResponse.json({ error: 'Transaction ref required.' }, { status: 400 });

    const db = await openDb();
    const payment = await db.get('SELECT * FROM payments WHERE transaction_ref = ?', [transaction_ref]);
    if (!payment) return NextResponse.json({ error: 'Payment not found.' }, { status: 404 });

    await db.run("UPDATE payments SET status = ? WHERE transaction_ref = ?", [status || 'paid', transaction_ref]);
    if (status === 'paid' || !status) {
      await db.run("UPDATE bookings SET payment_status = 'paid' WHERE id = ?", [payment.booking_id]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
