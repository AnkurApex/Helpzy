import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const db = await openDb();
    
    // In PostgreSQL, we check if id is a numeric ID or a string slug
    const provider = isNaN(id)
      ? await db.get('SELECT * FROM providers WHERE slug = $1', [id])
      : await db.get('SELECT * FROM providers WHERE id = $1', [parseInt(id)]);
      
    if (!provider) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    const services = await db.all('SELECT * FROM services WHERE provider_id = $1', [provider.id]);
    const reviews = await db.all(`
      SELECT r.*, u.name as customer_name FROM reviews r
      JOIN users u ON r.customer_id = u.id
      WHERE r.provider_id = $1
      ORDER BY r.created_at DESC LIMIT 10
    `, [provider.id]);
    
    return NextResponse.json({ ...provider, services, reviews });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
