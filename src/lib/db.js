import { Pool } from 'pg';
import { createHash } from 'crypto';

// ── Connection Pool ────────────────────────────────────────────────────────────
let pool = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

// ── Password Hashing ───────────────────────────────────────────────────────────
export function hashPassword(password) {
  return createHash('sha256').update(password + 'helpzy_salt_2026').digest('hex');
}

// ── Query Helper (mirrors old sqlite `db.get` / `db.all` / `db.run`) ─────────
export async function query(sql, params = []) {
  const client = getPool();
  const result = await client.query(sql, params);
  return result;
}

// Mimics sqlite `db.get` — returns first row or null
export async function dbGet(sql, params = []) {
  const result = await query(sql, params);
  return result.rows[0] || null;
}

// Mimics sqlite `db.all` — returns all rows
export async function dbAll(sql, params = []) {
  const result = await query(sql, params);
  return result.rows;
}

// Mimics sqlite `db.run` — returns { lastID, changes }
export async function dbRun(sql, params = []) {
  const result = await query(sql, params);
  const lastID = result.rows[0]?.id || null;
  const changes = result.rowCount || 0;
  return { lastID, changes };
}

// ── openDb (kept for backward compat — returns helper object) ─────────────────
export async function openDb() {
  await ensureSchema();
  return {
    get: dbGet,
    all: dbAll,
    run: dbRun,
    exec: async (sql) => query(sql),
  };
}

// ── Schema ────────────────────────────────────────────────────────────────────
let schemaInitialized = false;

async function ensureSchema() {
  if (schemaInitialized) return;
  schemaInitialized = true;

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      phone TEXT,
      role TEXT DEFAULT 'customer',
      address TEXT,
      city TEXT,
      state TEXT DEFAULT 'Maharashtra',
      pincode TEXT,
      is_blocked INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS providers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      business_name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      experience INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      base_price REAL DEFAULT 0,
      city TEXT DEFAULT 'Mumbai',
      pincode TEXT,
      image_url TEXT,
      status TEXT DEFAULT 'pending',
      is_verified INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      provider_id INTEGER REFERENCES providers(id),
      name TEXT NOT NULL,
      description TEXT,
      price REAL,
      price_type TEXT DEFAULT 'Starting At'
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES users(id),
      provider_id INTEGER REFERENCES providers(id),
      service_category TEXT NOT NULL,
      service_description TEXT,
      address TEXT,
      city TEXT,
      pincode TEXT,
      booking_date TEXT,
      booking_time TEXT,
      status TEXT DEFAULT 'pending',
      otp TEXT,
      otp_verified INTEGER DEFAULT 0,
      payment_status TEXT DEFAULT 'unpaid',
      payment_method TEXT DEFAULT 'cash',
      total_amount REAL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER UNIQUE REFERENCES bookings(id),
      customer_id INTEGER REFERENCES users(id),
      provider_id INTEGER REFERENCES providers(id),
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      review_text TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER UNIQUE REFERENCES bookings(id),
      amount REAL NOT NULL,
      method TEXT DEFAULT 'cash',
      upi_id TEXT,
      status TEXT DEFAULT 'pending',
      transaction_ref TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      booking_id INTEGER REFERENCES bookings(id),
      subject TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'open',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Seed only if empty
  const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
  if (parseInt(userCount.count) === 0) {
    await seedDb();
  }
}

// ── Seed Data ─────────────────────────────────────────────────────────────────
async function seedDb() {
  const adminPw = hashPassword('admin123');
  const custPw = hashPassword('customer123');
  const provPw = hashPassword('provider123');

  // Insert users and collect IDs
  const adminUser  = await dbGet(`INSERT INTO users (name, email, password, phone, role, city, pincode) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`, ['Admin User','admin@helpzy.in',adminPw,'9999999999','admin','Mumbai','400001']);
  const rahul      = await dbGet(`INSERT INTO users (name, email, password, phone, role, city, pincode) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`, ['Rahul Sharma','rahul@example.com',custPw,'9876543210','customer','Mumbai','400050']);
  const rameshUser = await dbGet(`INSERT INTO users (name, email, password, phone, role, city, pincode) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`, ['Ramesh Electricals','ramesh@provider.com',provPw,'9123456780','provider','Mumbai','400001']);
  const sureshUser = await dbGet(`INSERT INTO users (name, email, password, phone, role, city, pincode) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`, ['Suresh Plumbing','suresh@provider.com',provPw,'9123456781','provider','Mumbai','400002']);
  const cleanUser  = await dbGet(`INSERT INTO users (name, email, password, phone, role, city, pincode) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`, ['CleanHome Services','cleanhome@provider.com',provPw,'9123456782','provider','Mumbai','400003']);
  const coolUser   = await dbGet(`INSERT INTO users (name, email, password, phone, role, city, pincode) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`, ['CoolAir AC Repair','coolair@provider.com',provPw,'9123456783','provider','Mumbai','400004']);

  const providersData = [
    { user_id: rameshUser.id, business_name: 'Ramesh Electricals', slug: 'ramesh-electricals', category: 'Electrician', description: 'Licensed electrician with 10+ years experience. Specializing in wiring, switchboard repair, and fan installation across Mumbai.', base_price: 299, city: 'Mumbai', pincode: '400001', rating: 4.8, review_count: 142 },
    { user_id: sureshUser.id, business_name: 'Suresh Plumbing Works', slug: 'suresh-plumbing', category: 'Plumber', description: 'Expert plumber for pipeline repair, tap/geyser installation, and drain cleaning. Quick response across Mumbai.', base_price: 249, city: 'Mumbai', pincode: '400002', rating: 4.7, review_count: 98 },
    { user_id: cleanUser.id,  business_name: 'CleanHome Services', slug: 'cleanhome', category: 'Cleaner', description: 'Professional home cleaning with eco-friendly products. Deep cleaning, move-in/out, and regular maintenance packages.', base_price: 399, city: 'Mumbai', pincode: '400003', rating: 4.9, review_count: 210 },
    { user_id: coolUser.id,   business_name: 'CoolAir AC Repair', slug: 'coolair', category: 'AC Repair', description: 'Certified AC technicians for all brands. Installation, servicing, gas refill, and emergency repair.', base_price: 349, city: 'Mumbai', pincode: '400004', rating: 4.6, review_count: 87 },
  ];

  for (const p of providersData) {
    const pRow = await dbGet(
      `INSERT INTO providers (user_id, business_name, slug, category, description, base_price, city, pincode, rating, review_count, status, is_verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'active',1) RETURNING id`,
      [p.user_id, p.business_name, p.slug, p.category, p.description, p.base_price, p.city, p.pincode, p.rating, p.review_count]
    );
    const pid = pRow.id;

    if (p.category === 'Electrician') {
      await dbRun(`INSERT INTO services (provider_id, name, description, price, price_type) VALUES ($1,$2,$3,$4,$5)`, [pid, 'Wiring & Rewiring', 'Complete home wiring and rewiring services', 599, 'Starting At']);
      await dbRun(`INSERT INTO services (provider_id, name, description, price, price_type) VALUES ($1,$2,$3,$4,$5)`, [pid, 'Switchboard Repair', 'MCB, fuse, and switchboard repair', 299, 'Fixed']);
    }
    if (p.category === 'Plumber') {
      await dbRun(`INSERT INTO services (provider_id, name, description, price, price_type) VALUES ($1,$2,$3,$4,$5)`, [pid, 'Pipe Leak Repair', 'Fix pipe leaks and bursts', 349, 'Starting At']);
      await dbRun(`INSERT INTO services (provider_id, name, description, price, price_type) VALUES ($1,$2,$3,$4,$5)`, [pid, 'Tap Installation', 'Install or replace taps and faucets', 249, 'Fixed']);
    }
    if (p.category === 'Cleaner') {
      await dbRun(`INSERT INTO services (provider_id, name, description, price, price_type) VALUES ($1,$2,$3,$4,$5)`, [pid, 'Deep Home Cleaning', '2BHK full deep clean with eco products', 1499, 'Starting At']);
      await dbRun(`INSERT INTO services (provider_id, name, description, price, price_type) VALUES ($1,$2,$3,$4,$5)`, [pid, 'Kitchen Cleaning', 'Exhaust, tiles, countertop deep clean', 699, 'Fixed']);
    }
    if (p.category === 'AC Repair') {
      await dbRun(`INSERT INTO services (provider_id, name, description, price, price_type) VALUES ($1,$2,$3,$4,$5)`, [pid, 'AC Servicing', 'Full AC clean and gas check', 499, 'Fixed']);
      await dbRun(`INSERT INTO services (provider_id, name, description, price, price_type) VALUES ($1,$2,$3,$4,$5)`, [pid, 'Gas Refill', 'R22/R32 gas refilling', 799, 'Starting At']);
    }
  }

  // Pending provider
  const vikramUser = await dbGet(`INSERT INTO users (name, email, password, phone, role, city, pincode) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`, ['Vikram Painters','vikram@provider.com',provPw,'9123456784','provider','Mumbai','400005']);
  await dbRun(`INSERT INTO providers (user_id, business_name, slug, category, description, base_price, city, pincode, status, is_verified) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',0)`,
    [vikramUser.id, 'Vikram Painters', 'vikram-painters', 'Painter', 'Interior and exterior painting with premium paints.', 799, 'Mumbai', '400005']);

  // Sample booking
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const elecProvider = await dbGet(`SELECT id FROM providers WHERE slug = 'ramesh-electricals'`);
  await dbRun(
    `INSERT INTO bookings (customer_id, provider_id, service_category, service_description, address, city, pincode, booking_date, booking_time, status, otp, total_amount)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',$10,299)`,
    [rahul.id, elecProvider.id, 'Electrician', 'Main switchboard tripped, need immediate repair', 'Flat 3B, Andheri West', 'Mumbai', '400058', '2026-05-10', '10:00 AM', otp]
  );
}
