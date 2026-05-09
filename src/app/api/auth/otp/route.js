import { NextResponse } from 'next/server';
import { openDb, hashPassword } from '@/lib/db';
import { randomBytes, randomInt } from 'crypto';
import { setSessionCookie } from '@/lib/auth';

const otpStore = new Map();

function normalizeEmail(email) {
  return email?.toLowerCase().trim();
}

function generateOTP() {
  return randomInt(100000, 1000000).toString();
}

function createSlug(name, id) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${base || randomBytes(4).toString('hex')}-${id}`;
}

function otpResponse(email, otp, extra = {}) {
  return NextResponse.json({
    success: true,
    otp: process.env.NODE_ENV === 'production' ? undefined : otp,
    message: `OTP sent to ${email}`,
    ...extra,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, action, name, phone, role, city, pincode, category } = body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });

    const db = await openDb();

    if (action === 'send_login') {
      const user = await db.get(
        'SELECT id, name, email, role, is_blocked FROM users WHERE email = ?',
        [normalizedEmail]
      );
      if (!user) return NextResponse.json({ error: 'No account found with this email. Please sign up.' }, { status: 404 });
      if (user.is_blocked) return NextResponse.json({ error: 'Your account has been blocked. Contact support.' }, { status: 403 });

      const otp = generateOTP();
      otpStore.set(normalizedEmail, {
        otp,
        expires: Date.now() + 5 * 60 * 1000,
        type: 'login',
        userId: user.id,
      });

      return otpResponse(normalizedEmail, otp, { name: user.name });
    }

    if (action === 'send_signup') {
      if (!name || !phone) return NextResponse.json({ error: 'Name and phone are required.' }, { status: 400 });

      const existing = await db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
      if (existing) return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 409 });

      const safeRole = ['customer', 'provider'].includes(role) ? role : 'customer';
      const otp = generateOTP();
      otpStore.set(normalizedEmail, {
        otp,
        expires: Date.now() + 5 * 60 * 1000,
        type: 'signup',
        name: name.trim(),
        phone,
        role: safeRole,
        city,
        pincode,
        category,
      });

      return otpResponse(normalizedEmail, otp);
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err) {
    console.error('OTP POST error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { email, otp, password } = body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !otp) return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });

    const stored = otpStore.get(normalizedEmail);
    if (!stored) return NextResponse.json({ error: 'OTP not found or expired. Please resend.' }, { status: 400 });
    if (Date.now() > stored.expires) {
      otpStore.delete(normalizedEmail);
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }
    if (stored.otp !== otp.trim()) return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 });

    otpStore.delete(normalizedEmail);
    const db = await openDb();

    if (stored.type === 'login') {
      const user = await db.get('SELECT * FROM users WHERE id = ?', [stored.userId]);
      if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

      const response = NextResponse.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
      setSessionCookie(response, user);
      return response;
    }

    if (stored.type === 'signup') {
      if (!password || password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
      }

      const result = await db.run(
        'INSERT INTO users (name, email, password, phone, role, city, pincode) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [stored.name, normalizedEmail, hashPassword(password), stored.phone || null, stored.role, stored.city || null, stored.pincode || null]
      );
      const userId = result.lastID;

      if (stored.role === 'provider' && stored.category) {
        await db.run(
          'INSERT INTO providers (user_id, business_name, slug, category, city, pincode, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [userId, stored.name, createSlug(stored.name, userId), stored.category, stored.city || '', stored.pincode || '', 'pending']
        );
      }

      const user = { id: userId, name: stored.name, role: stored.role };
      const response = NextResponse.json({
        success: true,
        user: { id: userId, name: stored.name, email: normalizedEmail, role: stored.role },
      }, { status: 201 });
      setSessionCookie(response, user);
      return response;
    }

    return NextResponse.json({ error: 'Invalid OTP type.' }, { status: 400 });
  } catch (err) {
    console.error('OTP PATCH error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
