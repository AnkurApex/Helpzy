import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const pincode = searchParams.get('pincode');
    const city = searchParams.get('city');
    const db = await openDb();

    let queryStr = "SELECT * FROM providers WHERE status = 'active' AND is_verified = 1";
    const params = [];
    let paramIdx = 1;

    if (category) {
      queryStr += ` AND LOWER(category) = LOWER($${paramIdx++})`;
      params.push(category);
    }
    if (pincode) {
      queryStr += ` AND pincode = $${paramIdx++}`;
      params.push(pincode);
    }
    if (city) {
      queryStr += ` AND LOWER(city) LIKE LOWER($${paramIdx++})`;
      params.push(`%${city}%`);
    }
    queryStr += ' ORDER BY rating DESC';

    const providers = await db.all(queryStr, params);
    return NextResponse.json(providers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
