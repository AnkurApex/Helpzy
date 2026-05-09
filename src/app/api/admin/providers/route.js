import { NextResponse } from 'next/server';
import { query, run } from '@/lib/db';
import { requireRole } from '@/lib/auth';

async function requireAdminResponse() {
  const session = await requireRole('admin');
  if (session.error) return NextResponse.json({ error: session.error }, { status: session.status });
  return null;
}

function createSlug(name, id) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${base || 'provider'}-${id}`;
}

export async function GET() {
  try {
    const denied = await requireAdminResponse();
    if (denied) return denied;

    const providers = await query(`
      SELECT p.*, u.name, u.email, u.phone
      FROM providers p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    return NextResponse.json(providers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const denied = await requireAdminResponse();
    if (denied) return denied;

    const data = await req.json();
    const { user_id, business_name, category, description, experience, base_price, city, pincode, image_url } = data;
    if (!user_id || !business_name || !category) {
      return NextResponse.json({ error: 'User, business name, and category are required' }, { status: 400 });
    }

    const result = await run(`
      INSERT INTO providers (user_id, business_name, slug, category, description, experience, base_price, city, pincode, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [user_id, business_name, createSlug(business_name, user_id), category, description || null, experience || 0, base_price || 0, city || null, pincode || null, image_url || null]);

    await run('UPDATE users SET role = "provider" WHERE id = ?', [user_id]);

    return NextResponse.json({ message: 'Provider profile created', id: result.lastID });
  } catch (error) {
    console.error('Provider Creation Error:', error);
    return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const denied = await requireAdminResponse();
    if (denied) return denied;

    const { provider_id, action } = await req.json();
    if (!provider_id) return NextResponse.json({ error: 'Provider id is required' }, { status: 400 });

    if (action === 'verify') {
      await run('UPDATE providers SET status = "active", is_verified = 1 WHERE id = ?', [provider_id]);
      return NextResponse.json({ message: 'Provider verified' });
    }

    if (action === 'reject') {
      await run('UPDATE providers SET status = "rejected", is_verified = 0 WHERE id = ?', [provider_id]);
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
