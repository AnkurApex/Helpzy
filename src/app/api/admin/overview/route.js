import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function requireAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('helpzy_session')?.value;
    if (!token) return null;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resp = await fetch(`${baseUrl}/api/auth`, { headers: { cookie: `helpzy_session=${token}` }, cache: 'no-store' });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.user?.role === 'admin' ? data.user : null;
  } catch { return null; }
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });

    const db = await openDb();
    const [userCount, providerCount, bookingCount, revenueRow, pendingProviders, recentBookings] = await Promise.all([
      db.get("SELECT COUNT(*) as count FROM users WHERE role = 'customer'"),
      db.get("SELECT COUNT(*) as count FROM providers WHERE status = 'active'"),
      db.get("SELECT COUNT(*) as count FROM bookings WHERE status NOT IN ('cancelled', 'rejected')"),
      db.get("SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings WHERE payment_status = 'paid'"),
      db.all("SELECT p.*, u.email, u.phone FROM providers p JOIN users u ON p.user_id = u.id WHERE p.status = 'pending' ORDER BY p.created_at DESC LIMIT 10"),
      db.all(`SELECT b.*, u.name as customer_name, p.business_name as provider_name
              FROM bookings b JOIN users u ON b.customer_id = u.id
              LEFT JOIN providers p ON b.provider_id = p.id
              ORDER BY b.created_at DESC LIMIT 10`),
    ]);

    return NextResponse.json({
      stats: {
        users: parseInt(userCount.count),
        active_providers: parseInt(providerCount.count),
        bookings: parseInt(bookingCount.count),
        revenue: parseFloat(revenueRow.total),
      },
      pending_providers: pendingProviders,
      recent_bookings: recentBookings,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
