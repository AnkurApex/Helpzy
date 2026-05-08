import { NextResponse } from 'next/server';
import { openDb, hashPassword } from '@/lib/db';
import { cookies } from 'next/headers';

// In-memory OTP store: email → { otp, expires, data }
const otpStore = new Map();

// Reuse session logic from parent auth route
const sessions = new Map();

function createSession(userId, role, name) {
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);
  sessions.set(token, { userId, role, name, createdAt: Date.now() });
  return token;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/otp — send OTP for login or signup
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, action, name, phone, role, city, pincode, category } = body;

    if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });

    const db = await openDb();

    if (action === 'send_login') {
      // Check user exists
      const user = await db.get('SELECT id, name, email, role, is_blocked FROM users WHERE email = ?', [email.toLowerCase().trim()]);
      if (!user) return NextResponse.json({ error: 'No account found with this email. Please sign up.' }, { status: 404 });
      if (user.is_blocked) return NextResponse.json({ error: 'Your account has been blocked. Contact support.' }, { status: 403 });

      const otp = generateOTP();
      otpStore.set(email.toLowerCase(), { otp, expires: Date.now() + 5 * 60 * 1000, type: 'login', userId: user.id, role: user.role, name: user.name });

      // In production: send SMS via Twilio/MSG91
      // For dev: return OTP directly
      return NextResponse.json({ success: true, otp, message: `OTP sent to ${email}`, name: user.name });
    }

    if (action === 'send_signup') {
      if (!name || !phone) return NextResponse.json({ error: 'Name and phone are required.' }, { status: 400 });

      // Check email not already taken
      const existing = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
      if (existing) return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 409 });

      const otp = generateOTP();
      otpStore.set(email.toLowerCase(), {
        otp, expires: Date.now() + 5 * 60 * 1000, type: 'signup',
        name: name.trim(), phone, role: role || 'customer', city, pincode, category,
      });

      return NextResponse.json({ success: true, otp, message: `OTP sent to ${email}` });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err) {
    console.error('OTP POST error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// PATCH /api/auth/otp — verify OTP and complete auth
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { email, otp, password } = body;

    if (!email || !otp) return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });

    const stored = otpStore.get(email.toLowerCase());
    if (!stored) return NextResponse.json({ error: 'OTP not found or expired. Please resend.' }, { status: 400 });
    if (Date.now() > stored.expires) {
      otpStore.delete(email.toLowerCase());
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }
    if (stored.otp !== otp.trim()) return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 });

    otpStore.delete(email.toLowerCase());
    const db = await openDb();

    // LOGIN flow
    if (stored.type === 'login') {
      const user = await db.get('SELECT * FROM users WHERE id = ?', [stored.userId]);
      if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

      const token = createSession(user.id, user.role, user.name);
      const response = NextResponse.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
      response.cookies.set('helpzy_session', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' });
      return response;
    }

    // SIGNUP flow
    if (stored.type === 'signup') {
      if (!password || password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });

      const hashed = hashPassword(password);
      const result = await db.run(
        'INSERT INTO users (name, email, password, phone, role, city, pincode) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [stored.name, email.toLowerCase(), hashed, stored.phone || null, stored.role, stored.city || null, stored.pincode || null]
      );
      const userId = result.lastID;

      if (stored.role === 'provider' && stored.category) {
        const slug = stored.name.toLowerCase().replace(/\s+/g, '-') + '-' + userId;
        await db.run(
          'INSERT INTO providers (user_id, business_name, slug, category, city, pincode, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [userId, stored.name, slug, stored.category, stored.city || '', stored.pincode || '', 'pending']
        );
      }

      const token = createSession(userId, stored.role, stored.name);
      const response = NextResponse.json({
        success: true,
        user: { id: userId, name: stored.name, email: email.toLowerCase(), role: stored.role }
      }, { status: 201 });
      response.cookies.set('helpzy_session', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' });
      return response;
    }

    return NextResponse.json({ error: 'Invalid OTP type.' }, { status: 400 });
  } catch (err) {
    console.error('OTP PATCH error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
