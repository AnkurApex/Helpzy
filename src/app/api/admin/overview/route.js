import { NextResponse } from 'next/server';
import { get, query } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    const session = await requireRole('admin');
    if (session.error) return NextResponse.json({ error: session.error }, { status: session.status });

    const stats = await get(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role != 'admin') as users,
        (SELECT COUNT(*) FROM providers WHERE status = 'active') as active_providers,
        (SELECT COUNT(*) FROM providers WHERE status = 'pending') as pending_providers,
        (SELECT COUNT(*) FROM bookings) as bookings,
        (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE payment_status = 'paid') as revenue
    `);

    const recentBookings = await query(`
      SELECT b.*, u.name as customer_name, p.business_name as provider_name
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      LEFT JOIN providers p ON b.provider_id = p.id
      ORDER BY b.created_at DESC
      LIMIT 25
    `);

    return NextResponse.json({ stats, recent_bookings: recentBookings || [] });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
