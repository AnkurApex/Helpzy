# SECURITY.md

## 1. Purpose

Security rules for Helpzy. Developers and coding agents must follow them.

## 2. Authentication & authorization

- Auth is a signed HMAC session cookie (`helpzy_session`), not Clerk / NextAuth / Supabase.
- Protected routes and APIs must call `getCurrentUser`, `requireUser`, or `requireRole` from `src/lib/auth.js`.
- Never trust a user id or role sent only from the client.
- Signup may set role to `customer` or `provider` only. Never accept `admin` from the client.
- Admin APIs use `requireRole('admin')`. Provider dashboard uses `requireRole('provider')`.

## 3. Secrets & environment variables

- Store secrets in environment variables. Never hardcode production credentials.
- Never commit `.env` files. Keep `.env.example` with names only.
- `SESSION_SECRET` is required in production. Development may use a local fallback.
- `DATABASE_URL` is the SQLite file path (optional).

## 4. Input validation

- Validate user input on the server even if the UI already validates it.
- Reject unexpected roles, payment methods, and invalid types.
- Use parameterized SQL (`?` placeholders) only. Never concatenate SQL from user input.

## 5. API security

- Require a session on bookings, profile, payment, provider dashboard, and admin endpoints.
- Public: provider search, provider profile, reviews GET.
- Rate-limit auth and OTP endpoints.
- Do not return stack traces, file paths, or credentials to clients.
- OTP codes may be returned only when `NODE_ENV` is not `production` (local demo).

## 6. Data protection

- Hash passwords with scrypt (`hashPassword` / `verifyPassword` in `src/lib/db.js`).
- Do not log passwords, session cookies, or OTPs in production logs.
- Store only fields the product needs.

## 7. Error handling

User-facing errors may be useful, but must not reveal credentials, stack traces, or internal paths.

## 8. AI agent rules

The coding agent must:

- Never invent or hardcode production credentials.
- Never disable authentication to make a feature work.
- Never bypass authorization checks.
- Never expose secrets in client-side code.
- Ask for clarification when a requested change conflicts with this file.
