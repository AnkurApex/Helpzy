import { NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET() {
  try {
    const providers = await query('SELECT * FROM providers ORDER BY created_at DESC');
    return NextResponse.json(providers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { user_id, business_name, category, description, experience, base_price, city, pincode, image_url } = data;

    const result = await run(`
      INSERT INTO providers (user_id, business_name, category, description, experience, base_price, city, pincode, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [user_id, business_name, category, description, experience, base_price, city, pincode, image_url]);

    // Update user role to provider
    await run('UPDATE users SET role = "provider" WHERE id = ?', [user_id]);

    return NextResponse.json({ message: 'Provider profile created', id: result.lastID });
  } catch (error) {
    console.error('Provider Creation Error:', error);
    return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { provider_id, action } = await req.json();
    
    if (action === 'verify') {
      await run('UPDATE providers SET status = "active", is_verified = 1 WHERE id = ?', [provider_id]);
      return NextResponse.json({ message: 'Provider verified' });
    }
    
    if (action === 'reject') {
      await run('UPDATE providers SET status = "rejected" WHERE id = ?', [provider_id]);
      return NextResponse.json({ message: 'Provider rejected' });
    }

    if (action === 'remove') {
      await run('DELETE FROM providers WHERE id = ?', [provider_id]);
      return NextResponse.json({ message: 'Provider removed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
