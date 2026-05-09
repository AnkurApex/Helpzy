import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { randomBytes } from 'crypto';

function createTransactionRef() {
  return `HLZ${Date.now()}${randomBytes(4).toString('hex').toUpperCase()}`;
}

export async function POST(request) {
  try {
    const session = await requireUser();
    if (session.error) return NextResponse.json({ error: session.error }, { status: session.status });

    const { booking_id, method, upi_id } = await request.json();
    const db = await openDb();

    const booking = await db.get(
      'SELECT * FROM bookings WHERE id = ? AND customer_id = ?',
      [booking_id, session.user.id]
    );
    if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    if (!['completed', 'reviewed'].includes(booking.status) || booking.payment_status === 'paid') {
      return NextResponse.json({ error: 'Payment not applicable for this booking.' }, { status: 400 });
    }

    const transaction_ref = createTransactionRef();

    if (['upi', 'phonepe', 'paytm', 'gpay'].includes(method)) {
      const existing = await db.get('SELECT id FROM payments WHERE booking_id = ?', [booking_id]);
      if (existing) {
        await db.run(
          'UPDATE payments SET method = ?, upi_id = ?, status = ?, transaction_ref = ? WHERE booking_id = ?',
          [method, upi_id || null, 'pending', transaction_ref, booking_id]
        );
      } else {
        await db.run(
          'INSERT INTO payments (booking_id, amount, method, upi_id, status, transaction_ref) VALUES (?,?,?,?,?,?)',
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

    if (method === 'cash') {
      await db.run("UPDATE bookings SET payment_status = 'paid', payment_method = 'cash' WHERE id = ?", [booking_id]);
      const existing = await db.get('SELECT id FROM payments WHERE booking_id = ?', [booking_id]);
      if (existing) {
        await db.run("UPDATE payments SET status = 'paid', method = 'cash', transaction_ref = ? WHERE booking_id = ?", [transaction_ref, booking_id]);
      } else {
        await db.run(
          'INSERT INTO payments (booking_id, amount, method, status, transaction_ref) VALUES (?,?,?,?,?)',
          [booking_id, booking.total_amount, 'cash', 'paid', transaction_ref]
        );
      }
      return NextResponse.json({ success: true, method: 'cash', message: 'Cash payment recorded.' });
    }

    return NextResponse.json({ error: 'Invalid payment method.' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await requireUser();
    if (session.error) return NextResponse.json({ error: session.error }, { status: session.status });

    const { transaction_ref, status } = await request.json();
    if (!transaction_ref) return NextResponse.json({ error: 'Transaction ref required.' }, { status: 400 });

    const db = await openDb();
    const payment = await db.get(`
      SELECT pay.*, b.customer_id
      FROM payments pay
      JOIN bookings b ON pay.booking_id = b.id
      WHERE pay.transaction_ref = ?
    `, [transaction_ref]);
    if (!payment) return NextResponse.json({ error: 'Payment not found.' }, { status: 404 });
    if (payment.customer_id !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const nextStatus = status || 'paid';
    await db.run('UPDATE payments SET status = ? WHERE transaction_ref = ?', [nextStatus, transaction_ref]);
    if (nextStatus === 'paid') {
      await db.run("UPDATE bookings SET payment_status = 'paid' WHERE id = ?", [payment.booking_id]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
