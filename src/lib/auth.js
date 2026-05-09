import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';
import { get } from '@/lib/db';

const SESSION_COOKIE = 'helpzy_session';

function getSecret() {
  return process.env.SESSION_SECRET || 'local-helpzy-development-secret';
}

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function base64UrlDecode(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}

function sign(payload) {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createSessionValue(user) {
  const payload = base64UrlEncode({
    id: user.id,
    role: user.role,
    name: user.name,
    issuedAt: Date.now(),
  });
  return `${payload}.${sign(payload)}`;
}

export function setSessionCookie(response, user) {
  response.cookies.set(SESSION_COOKIE, createSessionValue(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  response.cookies.set('helpzy_user', '', { path: '/', maxAge: 0 });
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE)?.value;
    if (!session) return null;

    const [payload, signature] = session.split('.');
    if (!payload || !signature) return null;

    const expected = sign(payload);
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return null;
    }

    const sessionUser = base64UrlDecode(payload);
    if (!sessionUser?.id) return null;

    const user = await get(
      'SELECT id, name, email, phone, role, address, city, state, pincode, is_blocked, created_at FROM users WHERE id = ?',
      [sessionUser.id]
    );
    if (!user || user.is_blocked) return null;
    return user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }
  return { user };
}

export async function requireRole(role) {
  const result = await requireUser();
  if (result.error) return result;

  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(result.user.role)) {
    return { error: 'Forbidden', status: 403 };
  }
  return result;
}
