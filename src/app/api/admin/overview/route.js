import { NextResponse } from 'next/server';
import { get } from '@/lib/db';

export async function GET() {
  try {
    const stats = await get(`
      SELECT 
        (SELECT COUNT(*) FROM users) as totalUsers,
        (SELECT COUNT(*) FROM providers) as totalProviders,
        (SELECT COUNT(*) FROM bookings) as totalBookings,
        (SELECT SUM(total_price) FROM bookings WHERE status = 'completed') as totalRevenue
    `);

    const recentBookings = await query(`
      SELECT b.*, u.name as customer_name, p.business_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN providers p ON b.provider_id = p.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    return NextResponse.json({
      stats: {
        totalUsers: stats.totalUsers || 0,
        totalProviders: stats.totalProviders || 0,
        totalBookings: stats.totalBookings || 0,
        totalRevenue: stats.totalRevenue || 0
      },
      recentBookings: recentBookings || []
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
