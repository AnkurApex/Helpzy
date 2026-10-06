# PRD.md

## Product

Helpzy (package name `localpro`) is a local home-services marketplace for India. Customers book verified professionals. Providers manage jobs. Admins moderate users and providers.

## Roles

- **customer**: search, book, pay, review
- **provider**: accept/reject/complete jobs, verify booking OTP
- **admin**: users, provider verification, overview stats

## Core flows

1. Sign up or sign in (email OTP and/or password).
2. Search or browse a service category.
3. Book a provider with address, date, and time.
4. Provider updates booking status; customer can cancel pending/accepted bookings.
5. After completion, customer reviews and pays (cash or UPI-style record).

## Out of scope (current product)

- Real SMS/email delivery, live UPI capture, Stripe, Clerk, Prisma, PostgreSQL in production.
