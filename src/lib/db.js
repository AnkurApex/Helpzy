import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db = null;

// Simple password hashing (for local demo)
export function hashPassword(password) {
  return password; // In local demo we keep it plain, or you can add crypto here
}

export async function openDb() {
  if (db) return db;
  
  db = await open({
    filename: path.join(process.cwd(), 'helpzy.sqlite'),
    driver: sqlite3.Database
  });

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      business_name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      experience TEXT,
      base_price REAL,
      image_url TEXT,
      city TEXT,
      pincode TEXT,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      is_verified INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      provider_id INTEGER,
      service_date DATE,
      service_time TEXT,
      address TEXT,
      city TEXT,
      pincode TEXT,
      status TEXT DEFAULT 'pending',
      total_price REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (provider_id) REFERENCES providers (id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER,
      user_id INTEGER,
      provider_id INTEGER,
      rating INTEGER,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (provider_id) REFERENCES providers (id)
    );

    -- Seed demo users if not exists
    INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES 
    (1, 'Admin User', 'admin@helpzy.in', 'admin123', 'admin'),
    (2, 'Rahul Customer', 'rahul@example.com', 'customer123', 'user'),
    (3, 'Ramesh Provider', 'ramesh@provider.com', 'provider123', 'provider');

    INSERT OR IGNORE INTO providers (id, user_id, business_name, category, city, pincode, rating, review_count) VALUES
    (1, 3, 'Ramesh Electric Solutions', 'Electrician', 'Mumbai', '400001', 4.8, 12);
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
