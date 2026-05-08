import { openDb, dbGet } from '@/lib/db';
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

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || user.role;
    const db = await openDb();

    if (role === 'provider' && user.role === 'provider') {
      const provider = await db.get('SELECT id FROM providers WHERE user_id = $1', [user.id]);
      if (!provider) return NextResponse.json([]);
      const bookings = await db.all(`
        SELECT b.*, u.name as customer_name, u.phone as customer_phone
        FROM bookings b JOIN users u ON b.customer_id = u.id
        WHERE b.provider_id = $1 ORDER BY b.created_at DESC
      `, [provider.id]);
      return NextResponse.json(bookings);
    }

    if (role === 'admin' && user.role === 'admin') {
      const bookings = await db.all(`
        SELECT b.*, u.name as customer_name, p.business_name as provider_name
        FROM bookings b
        JOIN users u ON b.customer_id = u.id
        LEFT JOIN providers p ON b.provider_id = p.id
        ORDER BY b.created_at DESC
      `);
      return NextResponse.json(bookings);
    }

    // Customer
    const bookings = await db.all(`
      SELECT b.*, p.business_name as provider_name, p.category as provider_category
      FROM bookings b
      LEFT JOIN providers p ON b.provider_id = p.id
      WHERE b.customer_id = $1 ORDER BY b.created_at DESC
    `, [user.id]);
    return NextResponse.json(bookings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Please login to book a service.' }, { status: 401 });
    if (user.role !== 'customer') return NextResponse.json({ error: 'Only customers can create bookings.' }, { status: 403 });

    const body = await request.json();
    const { provider_id, service_category, service_description, address, city, pincode, booking_date, booking_time, payment_method } = body;

    if (!service_category || !address || !pincode || !booking_date || !booking_time) {
      return NextResponse.json({ error: 'Please fill all required fields.' }, { status: 400 });
    }

    const db = await openDb();
    const otp = generateOTP();

    let total_amount = 0;
    if (provider_id) {
      const provider = await db.get('SELECT base_price FROM providers WHERE id = $1', [provider_id]);
      if (provider) total_amount = provider.base_price;
    }

    const newBooking = await dbGet(`
      INSERT INTO bookings (customer_id, provider_id, service_category, service_description, address, city, pincode, booking_date, booking_time, status, otp, payment_method, total_amount)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',$10,$11,$12) RETURNING id
    `, [user.id, provider_id || null, service_category, service_description || '', address, city || '', pincode, booking_date, booking_time, otp, payment_method || 'cash', total_amount]);

    // Notify provider
    if (provider_id) {
      const provider = await db.get('SELECT user_id FROM providers WHERE id = $1', [provider_id]);
      if (provider) {
        await db.run(
          'INSERT INTO notifications (user_id, message, type) VALUES ($1,$2,$3)',
          [provider.user_id, `New booking request for ${service_category} on ${booking_date} at ${booking_time}`, 'booking']
        );
      }
    }

    return NextResponse.json({ success: true, booking_id: newBooking.id, otp }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
