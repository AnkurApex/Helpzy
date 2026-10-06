# DATABASE.md

## 1. Purpose

How Helpzy data is modeled and accessed.

## 2. Database stack

- Primary database: SQLite
- Access: `sqlite` + `sqlite3` through `src/lib/db.js`
- No Prisma, no PostgreSQL in the current app

## 3. Environment

`DATABASE_URL` is a file path. Relative paths resolve from the project root. Default file: `helpzy.sqlite`.

Never hardcode a production connection string. Do not reset or delete a production database file.

## 4. Core tables

### users

App account. Fields: `id`, `name`, `email` (unique), `password` (scrypt), `phone`, `role` (`customer` | `provider` | `admin`), address fields, `is_blocked`, `created_at`.

### providers

Public business profile. `user_id` → `users.id`. Fields include `business_name`, `slug`, `category`, `description`, `experience`, `rating`, `review_count`, `base_price`, `city`, `pincode`, `image_url`, `status` (`pending` | `active` | `rejected`), `is_verified`.

Relationship: one user can have one provider profile.

### services

Optional priced offerings. `provider_id` → `providers.id`.

### bookings

Job between a customer and a provider. `customer_id` → `users.id`, `provider_id` → `providers.id`. Status: `pending`, `accepted`, `rejected`, `in_progress`, `completed`, `reviewed`, `cancelled`. Includes booking OTP, payment fields, and `total_amount`.

### reviews

One review per booking (`booking_id` unique). Rating 1–5. Updating a review also updates provider `rating` / `review_count`.

### payments

One payment row per booking. Methods: `cash`, `upi`, `phonepe`, `paytm`, `gpay`.

### complaints / notifications

Reserved tables. Keep them unless a migration removes them.

## 5. Schema rules

- Use integer primary keys.
- Use foreign keys in table definitions.
- Use unique constraints for email, provider slug, booking review/payment.
- Index frequently filtered columns (`providers.status`, `providers.category`, booking foreign keys).
- Always use parameterized queries.

## 6. Schema changes

1. Update `CREATE TABLE` / index statements in `src/lib/db.js`.
2. For existing local files, add additive `ALTER TABLE` or `CREATE INDEX IF NOT EXISTS` so old databases keep working.
3. Update this file.
4. Never hand-edit production data to skip a schema change.

## 7. Seed data

Demo accounts (development):

- `admin@helpzy.in` / `admin123`
- `rahul@example.com` / `customer123`
- `ramesh@provider.com` / `provider123`

Do not put real user data or production secrets in seeds. Passwords must be hashed at seed time.

## 8. Production safety

- Back up the SQLite file before destructive changes.
- Use transactions when several writes must succeed together.
- Follow `SECURITY.md` for access and sensitive fields.
