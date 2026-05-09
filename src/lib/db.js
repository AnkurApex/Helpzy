import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

let db = null;

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password, storedPassword) {
  if (!storedPassword) return false;
  if (!storedPassword.startsWith('scrypt:')) {
    return password === storedPassword;
  }

  const [, salt, hash] = storedPassword.split(':');
  if (!salt || !hash) return false;

  const hashBuffer = Buffer.from(hash, 'hex');
  const candidateBuffer = scryptSync(password, salt, 64);
  return hashBuffer.length === candidateBuffer.length && timingSafeEqual(hashBuffer, candidateBuffer);
}

export async function openDb() {
  if (db) return db;
  
  const databaseUrl = process.env.DATABASE_URL || 'helpzy.sqlite';
  db = await open({
    filename: path.isAbsolute(databaseUrl)
      ? databaseUrl
      : path.join(/* turbopackIgnore: true */ process.cwd(), databaseUrl),
    driver: sqlite3.Database
  });

  // Create tables if they don't exist
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
      slug TEXT UNIQUE,
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

    -- Seed demo users if not exists
    INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES 
    (1, 'Admin User', 'admin@helpzy.in', 'admin123', 'admin'),
    (2, 'Rahul Customer', 'rahul@example.com', 'customer123', 'customer'),
    (3, 'Ramesh Provider', 'ramesh@provider.com', 'provider123', 'provider');

    INSERT OR IGNORE INTO providers (id, user_id, business_name, slug, category, city, pincode, rating, review_count, base_price, status, is_verified) VALUES
    (1, 3, 'Ramesh Electric Solutions', 'ramesh-electric-solutions-1', 'Electrician', 'Mumbai', '400001', 4.8, 12, 499, 'active', 1);
  `);

  return db;
}

// Helper to run queries
export async function query(sql, params = []) {
  const database = await openDb();
  return database.all(sql, params);
}

// Helper for single row
export async function get(sql, params = []) {
  const database = await openDb();
  return database.get(sql, params);
}

// Helper for insert/update/delete
export async function run(sql, params = []) {
  const database = await openDb();
  return database.run(sql, params);
}
