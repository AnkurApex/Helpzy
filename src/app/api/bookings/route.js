import { NextResponse } from 'next/server';
import { get, query, run } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { randomInt } from 'crypto';
import { PAYMENT_METHODS } from '@/lib/constants';
import { jsonError, sessionError } from '@/lib/http';

function bookingSelect(whereClause) {
  return `
    SELECT b.*, p.business_name as provider_name, p.business_name, p.category, u.name as customer_name, u.phone as customer_phone
    FROM bookings b
    LEFT JOIN providers p ON b.provider_id = p.id
    JOIN users u ON b.customer_id = u.id
    ${whereClause}
    ORDER BY b.created_at DESC
  `;
}

export async function GET() {
  try {
    const session = await requireUser();
    if (session.error) return NextResponse.json({ error: session.error }, { status: session.status });

    if (session.user.role === 'admin') {
      return NextResponse.json(await query(bookingSelect('')));
    }

    if (session.user.role === 'provider') {
      const provider = await get('SELECT id FROM providers WHERE user_id = ?', [session.user.id]);
      if (!provider) return NextResponse.json([]);
      return NextResponse.json(await query(bookingSelect('WHERE b.provider_id = ?'), [provider.id]));
    }

    return NextResponse.json(await query(bookingSelect('WHERE b.customer_id = ?'), [session.user.id]));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await requireUser();
    if (session.error) return sessionError(session);

    const data = await req.json();
    const {
      provider_id,
      service_category,
      service_description,
      address,
      city,
      pincode,
      booking_date,
      booking_time,
      payment_method,
    } = data;

    if (!service_category || !address || !pincode || !booking_date || !booking_time) {
      return jsonError('Service, address, pincode, date, and time are required');
    }
    if (!/^\d{6}$/.test(String(pincode))) {
      return jsonError('Pincode must be 6 digits');
    }
    const method = payment_method || 'cash';
    if (!PAYMENT_METHODS.includes(method)) {
      return jsonError('Invalid payment method');
    }

    const provider = provider_id ? await get('SELECT id, base_price FROM providers WHERE id = ?', [provider_id]) : null;
    const otp = randomInt(1000, 10000).toString();
    const totalAmount = provider?.base_price || 0;

    const result = await run(`
      INSERT INTO bookings (
        customer_id, provider_id, service_category, service_description, address, city, pincode,
        booking_date, booking_time, payment_method, total_amount, otp
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      session.user.id,
      provider?.id || null,
      service_category,
      service_description || null,
      address,
      city || null,
      pincode,
      booking_date,
      booking_time,
      method,
      totalAmount,
      otp,
    ]);

    return NextResponse.json({ message: 'Booking successful', booking_id: result.lastID, id: result.lastID, otp });
  } catch (error) {
    console.error('Booking Error:', error);
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 });
  }
}
