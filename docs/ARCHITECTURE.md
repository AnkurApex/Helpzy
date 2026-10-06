# ARCHITECTURE.md

## Stack

- Next.js 16 App Router (`src/app`)
- React 19
- Tailwind CSS 4
- SQLite via `sqlite` + `sqlite3` (`src/lib/db.js`)
- HMAC session cookie (`src/lib/auth.js`)

## Layout

- Pages live under `src/app/*/page.js`
- Route handlers live under `src/app/api/*/route.js`
- Shared UI: `src/components`
- Server helpers: `src/lib`

There is no separate backend service. API routes run in the Next.js server.

## Auth

Signed `helpzy_session` httpOnly cookie. Role is always loaded from the `users` table, never trusted from the client body.

## Data

SQLite file from `DATABASE_URL` or `helpzy.sqlite` in the project root. Schema is created with `CREATE TABLE IF NOT EXISTS` on first open. Demo users are seeded with hashed passwords.
