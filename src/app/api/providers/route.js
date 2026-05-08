import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Shared session helper (duplicate to avoid circular imports)
function getSessionFromCookie(token) {
  // We re-export from a shared lib; for now use a simple approach
  return token ? token : null;
}

async function getCurrentUser(db) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('helpzy_session')?.value;
    if (!token) return null;
    // Decode session - we store userId in a simple map in the auth route
    // Since sessions map is in-memory in auth/route.js and not shared easily,
    // we use a workaround: the token contains userId encoded after last '-'
    // Actually let's just call our auth endpoint internally
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth`, {
      headers: { cookie: `helpzy_session=${token}` }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.user;
  } catch {
    return null;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const pincode = searchParams.get('pincode');
    const city = searchParams.get('city');
    const db = await openDb();

    let query = "SELECT * FROM providers WHERE status = 'active' AND is_verified = 1";
    const params = [];
    if (category) { query += ' AND LOWER(category) = LOWER(?)'; params.push(category); }
    if (pincode) { query += ' AND pincode = ?'; params.push(pincode); }
    if (city) { query += ' AND LOWER(city) LIKE LOWER(?)'; params.push(`%${city}%`); }
    query += ' ORDER BY rating DESC';

    const providers = await db.all(query, params);
    return NextResponse.json(providers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
