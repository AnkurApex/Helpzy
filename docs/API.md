# API.md

## 1. Purpose

How the Helpzy frontend talks to Next.js route handlers.

## 2. Base configuration

- Development: `http://localhost:3000/api`
- Response format: JSON
- No `/api/v1` prefix. Do not add versioning unless the product requires it.

## 3. Authentication

Session cookie `helpzy_session` (httpOnly, SameSite=Lax). The browser sends it automatically. Do not put `SESSION_SECRET` in client code.

`GET /api/auth` returns `{ user }` or `{ user: null }`.

## 4. Error shape

```json
{ "error": "Human-readable message" }
```

Status codes: 200, 201, 400, 401, 403, 404, 409, 429, 500.

Do not return stack traces.

## 5. Endpoints

### Auth

- `GET /api/auth` — current user
- `POST /api/auth` — `{ action: "signup" | "login" | "logout" }`
- `POST /api/auth/otp` — `{ action: "send_login" | "send_signup", email, ... }`
- `PATCH /api/auth/otp` — `{ email, otp, password? }`

### Public

- `GET /api/providers?category=&city=&pincode=`
- `GET /api/providers/:id` — id or slug
- `GET /api/reviews?providerId=`

### Authenticated

- `GET/POST /api/bookings`
- `GET/PATCH /api/bookings/:id` — actions: `cancel`, `accept`, `reject`, `complete`, `verify_otp`
- `GET/PATCH /api/profile`
- `POST/PATCH /api/payment`

### Role-restricted

- `GET /api/provider/dashboard` — provider
- `GET /api/admin/overview` — admin
- `GET/PATCH /api/admin/users` — admin (`block`, `unblock`, `delete`)
- `GET/POST/PATCH /api/admin/providers` — admin (`verify`, `reject`, `remove`)

## 6. Rate limiting

Auth and OTP routes are rate-limited in memory per process. This is a local safeguard, not a distributed limiter.

## 7. Third-party APIs

None in production. UPI links are generated locally. There is no Stripe webhook.
