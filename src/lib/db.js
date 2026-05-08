import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { createHash } from 'crypto';

let db = null;

// Simple password hash (SHA-256 based, no external deps needed)
export function hashPassword(password) {
  return createHash('sha256').update(password + 'helpzy_salt_2026').digest('hex');
}

export async function openDb() {
  if (!db) {
    db = await open({
      filename: path.join(process.cwd(), 'helpzy.sqlite'),
      driver: sqlite3.Database
    });
    await db.exec('PRAGMA foreign_keys = ON;');
    await initDb(db);
  }
  return db;
}

async function initDb(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      price REAL,
      price_type TEXT DEFAULT 'Starting At',
      FOREIGN KEY (provider_id) REFERENCES providers (id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      provider_id INTEGER,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users (id),
      FOREIGN KEY (provider_id) REFERENCES providers (id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER UNIQUE,
      customer_id INTEGER,
      provider_id INTEGER,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      review_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings (id),
      FOREIGN KEY (customer_id) REFERENCES users (id),
      FOREIGN KEY (provider_id) REFERENCES providers (id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER UNIQUE,
      amount REAL NOT NULL,
      method TEXT DEFAULT 'cash',
      upi_id TEXT,
      status TEXT DEFAULT 'pending',
      transaction_ref TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings (id)
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      booking_id INTEGER,
      subject TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (booking_id) REFERENCES bookings (id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    await seedDb(db);
  }
}

async function seedDb(db) {
  const adminPw = hashPassword('admin123');
  const custPw = hashPassword('customer123');
  const provPw = hashPassword('provider123');

  await db.run(`INSERT INTO users (name, email, password, phone, role, city, pincode) VALUES ('Admin User', 'admin@helpzy.in', '${adminPw}', '9999999999', 'admin', 'Mumbai', '400001')`);
  await db.run(`INSERT INTO users (name, email, password, phone, role, city, pincode) VALUES ('Rahul Sharma', 'rahul@example.com', '${custPw}', '9876543210', 'customer', 'Mumbai', '400050')`);
  await db.run(`INSERT INTO users (name, email, password, phone, role, city, pincode) VALUES ('Ramesh Electricals', 'ramesh@provider.com', '${provPw}', '9123456780', 'provider', 'Mumbai', '400001')`);
  await db.run(`INSERT INTO users (name, email, password, phone, role, city, pincode) VALUES ('Suresh Plumbing', 'suresh@provider.com', '${provPw}', '9123456781', 'provider', 'Mumbai', '400002')`);
  await db.run(`INSERT INTO users (name, email, password, phone, role, city, pincode) VALUES ('CleanHome Services', 'cleanhome@provider.com', '${provPw}', '9123456782', 'provider', 'Mumbai', '400003')`);
  await db.run(`INSERT INTO users (name, email, password, phone, role, city, pincode) VALUES ('CoolAir AC Repair', 'coolair@provider.com', '${provPw}', '9123456783', 'provider', 'Mumbai', '400004')`);

  const categories = [
    { user_id: 3, business_name: 'Ramesh Electricals', slug: 'ramesh-electricals', category: 'Electrician', description: 'Licensed electrician with 10+ years experience. Specializing in wiring, switchboard repair, and fan installation across Mumbai.', base_price: 299, city: 'Mumbai', pincode: '400001', rating: 4.8, review_count: 142, status: 'active', is_verified: 1 },
    { user_id: 4, business_name: 'Suresh Plumbing Works', slug: 'suresh-plumbing', category: 'Plumber', description: 'Expert plumber for pipeline repair, tap/geyser installation, and drain cleaning. Quick response across Mumbai.', base_price: 249, city: 'Mumbai', pincode: '400002', rating: 4.7, review_count: 98, status: 'active', is_verified: 1 },
    { user_id: 5, business_name: 'CleanHome Services', slug: 'cleanhome', category: 'Cleaner', description: 'Professional home cleaning with eco-friendly products. Deep cleaning, move-in/out, and regular maintenance packages.', base_price: 399, city: 'Mumbai', pincode: '400003', rating: 4.9, review_count: 210, status: 'active', is_verified: 1 },
    { user_id: 6, business_name: 'CoolAir AC Repair', slug: 'coolair', category: 'AC Repair', description: 'Certified AC technicians for all brands. Installation, servicing, gas refill, and emergency repair.', base_price: 349, city: 'Mumbai', pincode: '400004', rating: 4.6, review_count: 87, status: 'active', is_verified: 1 },
  ];

  for (const p of categories) {
    const result = await db.run(`
      INSERT INTO providers (user_id, business_name, slug, category, description, base_price, city, pincode, rating, review_count, status, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [p.user_id, p.business_name, p.slug, p.category, p.description, p.base_price, p.city, p.pincode, p.rating, p.review_count, p.status, p.is_verified]);

    const pid = result.lastID;
    if (p.category === 'Electrician') {
      await db.run(`INSERT INTO services (provider_id, name, description, price, price_type) VALUES (?, 'Wiring & Rewiring', 'Complete home wiring and rewiring services', 599, 'Starting At')`,[pid]);
      await db.run(`INSERT INTO services (provider_id, name, description, price, price_type) VALUES (?, 'Switchboard Repair', 'MCB, fuse, and switchboard repair', 299, 'Fixed')`,[pid]);
    }
    if (p.category === 'Plumber') {
      await db.run(`INSERT INTO services (provider_id, name, description, price, price_type) VALUES (?, 'Pipe Leak Repair', 'Fix pipe leaks and bursts', 349, 'Starting At')`,[pid]);
      await db.run(`INSERT INTO services (provider_id, name, description, price, price_type) VALUES (?, 'Tap Installation', 'Install or replace taps and faucets', 249, 'Fixed')`,[pid]);
    }
    if (p.category === 'Cleaner') {
      await db.run(`INSERT INTO services (provider_id, name, description, price, price_type) VALUES (?, 'Deep Home Cleaning', '2BHK full deep clean with eco products', 1499, 'Starting At')`,[pid]);
      await db.run(`INSERT INTO services (provider_id, name, description, price, price_type) VALUES (?, 'Kitchen Cleaning', 'Exhaust, tiles, countertop deep clean', 699, 'Fixed')`,[pid]);
    }
    if (p.category === 'AC Repair') {
      await db.run(`INSERT INTO services (provider_id, name, description, price, price_type) VALUES (?, 'AC Servicing', 'Full AC clean and gas check', 499, 'Fixed')`,[pid]);
      await db.run(`INSERT INTO services (provider_id, name, description, price, price_type) VALUES (?, 'Gas Refill', 'R22/R32 gas refilling', 799, 'Starting At')`,[pid]);
    }
  }

  // Also add pending providers for admin queue
  await db.run(`INSERT INTO users (name, email, password, phone, role, city, pincode) VALUES ('Vikram Painters', 'vikram@provider.com', '${provPw}', '9123456784', 'provider', 'Mumbai', '400005')`);
  await db.run(`
    INSERT INTO providers (user_id, business_name, slug, category, description, base_price, city, pincode, status, is_verified)
    VALUES (7, 'Vikram Painters', 'vikram-painters', 'Painter', 'Interior and exterior painting with premium paints.', 799, 'Mumbai', '400005', 'pending', 0)
  `);

  // Add a sample booking
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  await db.run(`
    INSERT INTO bookings (customer_id, provider_id, service_category, service_description, address, city, pincode, booking_date, booking_time, status, otp, total_amount)
    VALUES (2, 1, 'Electrician', 'Main switchboard tripped, need immediate repair', 'Flat 3B, Andheri West', 'Mumbai', '400058', '2026-05-10', '10:00 AM', 'pending', '${otp}', 299)
  `);
}
