import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const pincode = searchParams.get('pincode');
    const city = searchParams.get('city');

    let sql = 'SELECT * FROM providers WHERE 1=1';
    let params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (city) {
      sql += ' AND city LIKE ?';
      params.push(`%${city}%`);
    }
    if (pincode) {
      sql += ' AND pincode = ?';
      params.push(pincode);
    }

    const providers = await query(sql, params);
    return NextResponse.json(providers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}
