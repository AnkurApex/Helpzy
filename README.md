<div align="center">

![Helpzy Banner](./helpzy-banner.svg)

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-f97316?style=for-the-badge)](./LICENSE)

<br/>

> **🏠 Helpzy** is a modern home-services booking platform that connects homeowners with **verified local professionals** — from plumbing and electrical work to cleaning and AC repair. Book trusted pros in seconds.

<br/>

[🚀 Quick Start](#getting-started) · [🧪 Demo Accounts](#demo-accounts) · [📡 API Reference](#api-reference) · [🐛 Report Bug](../../issues) · [✨ Request Feature](../../issues)

</div>

---

## 📌 Table of Contents

- [About the Project](#about-the-project)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [File Architecture](#file-architecture)
- [Pages Overview](#pages-overview)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Demo Accounts](#demo-accounts)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 🏠 About the Project

**Helpzy** is a full-stack home services marketplace built on **Next.js 16** with a SQLite backend and a clean, mobile-first **"High-Contrast Direct"** design system. Inspired by platforms like Urban Company, it enables users to search for services, view professional profiles, and book appointments — all through a fast and intuitive interface.

The platform serves **three distinct user roles**:

| Role | Description |
|---|---|
| 🏠 **Customer** | Browse services, book pros, manage appointments, pay via UPI / Cash |
| 🔧 **Service Provider** | Accept bookings, generate OTPs, mark jobs complete, view earnings |
| ⚙️ **Admin** | Verify providers, manage users, view platform analytics |

---

## 🏗 System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                            Helpzy                                │
├──────────────────────┬───────────────────────┬───────────────────┤
│   Frontend (UI)      │    Backend (API)       │   Data Layer      │
│  Next.js 16          │  Next.js API Routes    │  SQLite           │
│  React 19            │  Route Handlers        │  (better-sqlite3) │
│  Tailwind CSS v4     │  SHA-256 Auth          │  Auto-seeded DB   │
│  Material Icons      │  OTP Engine            │                   │
└──────────────────────┴───────────────────────┴───────────────────┘
                       ⬇ Single Process ⬇
                    localhost:3000 (All-in-one)
```

### Booking Lifecycle

```
👤 Customer Registers / Logs In (OTP)
         ↓
🔍 Browse Services → Filter by Category / City
         ↓
👷 View Provider Profile → Ratings & Reviews
         ↓
📅 Book Appointment → Address + Time + Payment Mode
         ↓
🔔 Provider Accepts / Rejects Request
         ↓
🔑 Provider Generates Service OTP
         ↓
✅ Customer Verifies OTP → Work Begins
         ↓
🏁 Provider Marks Job Complete
         ↓
💰 Payment Recorded (Cash / UPI / PhonePe / Paytm)
         ↓
⭐ Customer Leaves Review
```

### Database Schema (SQLite)

```
┌──────────────┐    ┌──────────────────┐    ┌───────────────────┐
│    users     │    │     bookings      │    │     providers     │
│──────────────│    │──────────────────│    │───────────────────│
│ id (PK)      │───▶│ id (PK)          │◀───│ id (PK)           │
│ name         │    │ customer_id (FK)  │    │ user_id (FK)      │
│ email        │    │ provider_id (FK)  │    │ service_category  │
│ password_hash│    │ service_category  │    │ city              │
│ role         │    │ status           │    │ pincode           │
│ phone        │    │ address          │    │ hourly_rate       │
│ created_at   │    │ scheduled_date   │    │ rating            │
└──────────────┘    │ payment_method   │    │ is_verified       │
                    │ otp_code         │    └───────────────────┘
┌──────────────┐    │ amount           │    ┌───────────────────┐
│    otps      │    └──────────────────┘    │     reviews       │
│──────────────│                            │───────────────────│
│ id (PK)      │                            │ id (PK)           │
│ email        │                            │ booking_id (FK)   │
│ otp_code     │                            │ rating            │
│ expires_at   │                            │ comment           │
│ is_used      │                            │ created_at        │
└──────────────┘                            └───────────────────┘
```

---

## ✨ Features

### 🔐 Multi-Step OTP Authentication
- 3-step animated flow: **Email → OTP → Success**
- Signup includes name, role selection (Customer / Service Pro), phone, and password
- 6-digit OTP with auto-focus input, resend timer, and expiry validation
- SHA-256 password hashing — no plaintext secrets stored

### 🔍 Smart Service Discovery
- Browse **8 service categories**: Electrician, Plumber, Cleaner, AC Repair, Painter, Carpenter, Pest Control, Appliance Repair
- Filter providers by **city**, **pincode**, and **minimum rating**
- Sort by rating, experience, and price

### 📅 Full Booking Flow
- Multi-step booking with Indian address fields (pincode, city, state, landmark)
- Preferred **date & time** scheduling
- **Payment mode selection**: Cash, UPI, PhonePe, Paytm

### 🔑 OTP Service Start
- Provider generates a unique OTP when arriving on-site
- Customer verifies OTP before work begins — no disputes about job start time

### 💰 Indian Payment Support
- Cash, UPI, PhonePe, Paytm — all natively supported modes
- Payment recorded on job completion

### 👤 Provider Profiles
- Detailed public profiles with service category, city, hourly rate, and rating
- Read customer reviews before booking

### ⚙️ Admin Dashboard
- Verify/reject service provider applications
- Block/unblock users
- View platform metrics: total users, bookings, providers, revenue

### 📱 Mobile-First UI
- Responsive layout with **bottom navigation bar** for mobile users
- Tailwind CSS v4 with a custom "High-Contrast Direct" design token system

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Full-stack React framework |
| **Language** | JavaScript (ES2023+) | No TypeScript for simplicity |
| **Styling** | Tailwind CSS v4 | Utility-first design system |
| **Database** | SQLite via `sqlite` + `sqlite3` | Embedded, zero-config database |
| **Auth** | OTP-based + SHA-256 hashing | Passwordless-style login flow |
| **Icons** | Google Material Symbols | Consistent UI iconography |
| **Fonts** | Google Fonts — Inter | Clean, modern typography |

---

## 📁 File Architecture

```
Helpzy/                                   # → Project root
│
├── 📂 public/                            # Static assets served at /
│   ├── category_electrician.png          # AI-generated category hero images
│   ├── category_plumber.png
│   ├── category_cleaner.png
│   ├── category_ac_repair.png
│   ├── category_landscaper.png
│   └── platform_hero.png                 # Home page hero image
│
├── 📂 src/
│   │
│   ├── 📂 app/                           # Next.js 16 App Router
│   │   │
│   │   ├── page.js                       # 🏠 Home / Landing page
│   │   ├── layout.js                     # Root layout (Navbar + Footer)
│   │   ├── globals.css                   # Global styles & design tokens
│   │   │
│   │   ├── 📂 auth/                      # 🔐 Multi-step OTP auth
│   │   │   └── page.js                   # Email → OTP → Success flow
│   │   │
│   │   ├── 📂 search/                    # 🔍 Service discovery
│   │   │   └── page.js                   # Provider search with filters
│   │   │
│   │   ├── 📂 booking/                   # 📅 Booking flow
│   │   │   └── page.js                   # Multi-step booking form
│   │   │
│   │   ├── 📂 my-bookings/               # 📋 Customer booking history
│   │   │   └── page.js                   # Status tracking & history
│   │   │
│   │   ├── 📂 profile/                   # 👤 User profile management
│   │   │   └── page.js                   # Edit name, phone, password
│   │   │
│   │   ├── 📂 provider/
│   │   │   ├── 📂 [id]/                  # Public provider profile page
│   │   │   │   └── page.js               # Ratings, reviews, Book Now
│   │   │   └── 📂 dashboard/             # 🔧 Provider dashboard
│   │   │       └── page.js               # Accept/reject, OTP, earnings
│   │   │
│   │   ├── 📂 admin/                     # ⚙️ Admin control panel
│   │   │   └── page.js                   # Metrics, verify providers, manage users
│   │   │
│   │   ├── 📂 services/
│   │   │   └── 📂 [slug]/                # Dynamic service category pages
│   │   │       └── page.js               # e.g. /services/electrician
│   │   │
│   │   └── 📂 api/                       # REST API route handlers
│   │       │
│   │       ├── 📂 auth/
│   │       │   ├── route.js              # POST /api/auth — Login & Register
│   │       │   └── 📂 otp/
│   │       │       └── route.js          # POST /api/auth/otp — Generate & Verify OTP
│   │       │
│   │       ├── 📂 bookings/
│   │       │   ├── route.js              # GET / POST /api/bookings
│   │       │   └── 📂 [id]/
│   │       │       └── route.js          # PATCH /api/bookings/[id] — Status updates
│   │       │
│   │       ├── 📂 providers/
│   │       │   ├── route.js              # GET /api/providers — Provider listing
│   │       │   └── 📂 [id]/
│   │       │       └── route.js          # GET /api/providers/[id] — Provider detail
│   │       │
│   │       ├── 📂 provider/
│   │       │   └── 📂 dashboard/
│   │       │       └── route.js          # GET /api/provider/dashboard — Stats & bookings
│   │       │
│   │       ├── 📂 reviews/
│   │       │   └── route.js              # POST /api/reviews — Submit review
│   │       │
│   │       ├── 📂 payment/
│   │       │   └── route.js              # POST /api/payment — Record payment
│   │       │
│   │       ├── 📂 profile/
│   │       │   └── route.js              # GET / PATCH /api/profile
│   │       │
│   │       └── 📂 admin/
│   │           ├── 📂 overview/
│   │           │   └── route.js          # GET /api/admin/overview — Platform stats
│   │           ├── 📂 providers/
│   │           │   └── route.js          # GET / PATCH /api/admin/providers
│   │           └── 📂 users/
│   │               └── route.js          # GET / PATCH /api/admin/users
│   │
│   ├── 📂 components/
│   │   ├── Navbar.jsx                    # Responsive navbar with auth state & mobile nav
│   │   └── Footer.jsx                    # Site-wide footer with links
│   │
│   └── 📂 lib/
│       └── db.js                         # SQLite connection + full schema init + demo seed
│
├── 🎨 helpzy-banner.svg                  # GitHub README banner
├── ⚙️  next.config.mjs                   # Next.js configuration
├── ⚙️  tailwind.config.js                # Tailwind CSS + design tokens
├── 📦 package.json                       # Dependencies & npm scripts
├── 📄 helpzy.sqlite                      # SQLite database (auto-created on first run)
└── 📄 README.md                          # You are here!
```

---

## 📄 Pages Overview

### 🔐 `/auth` — Multi-Step OTP Authentication
3-step animated auth flow: **Email input → 6-digit OTP → Success redirect**.  
Signup includes name, role selection (Customer / Service Pro), phone, and password creation.

### 🏠 `/` — Home Page
4-panel photo hero (Plumber · Electrician · AC Repair · Landscaper) with CTA buttons, service category grid (8 categories), and a platform trust section.

### 🔍 `/search` — Service Discovery
Browse and filter all available providers by category, city, pincode, and minimum rating. Each result card shows provider rating, hourly rate, and a quick-book button.

### 📅 `/booking` — Booking Flow
Multi-step booking form with Indian address validation (pincode → auto city/state), preferred date/time picker, and payment method selection (Cash, UPI, PhonePe, Paytm).

### 📋 `/my-bookings` — Customer Booking History
Full booking history with live status pipeline:  
`Pending → Accepted → OTP Generated → In Progress → Completed → Paid`

### 👤 `/provider/[id]` — Provider Public Profile
View provider ratings, review breakdown, service details, hourly rate, and a **Book Now** button.

### 🔧 `/provider/dashboard` — Provider Dashboard
Accept / reject booking requests, generate service OTPs, mark jobs complete, and view earnings summary.

### ⚙️ `/admin` — Admin Control Panel
Platform metrics cards, provider verification queue, and user management table with block/unblock actions.

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth` | ❌ | Login or register a user |
| `POST` | `/api/auth/otp` | ❌ | Generate or verify a 6-digit OTP |
| `GET` | `/api/providers` | ❌ | List providers (with filters) |
| `GET` | `/api/providers/[id]` | ❌ | Get single provider detail |
| `GET` | `/api/bookings` | ✅ | List bookings for current user |
| `POST` | `/api/bookings` | ✅ | Create a new booking |
| `PATCH` | `/api/bookings/[id]` | ✅ | Update booking status / OTP |
| `POST` | `/api/reviews` | ✅ | Submit a review for a booking |
| `POST` | `/api/payment` | ✅ | Record payment for a booking |
| `GET` | `/api/profile` | ✅ | Get current user profile |
| `PATCH` | `/api/profile` | ✅ | Update profile details |
| `GET` | `/api/provider/dashboard` | ✅ | Provider stats & booking list |
| `GET` | `/api/admin/overview` | ✅ Admin | Platform metrics |
| `GET` | `/api/admin/providers` | ✅ Admin | Provider management list |
| `PATCH` | `/api/admin/providers` | ✅ Admin | Verify / reject a provider |
| `GET` | `/api/admin/users` | ✅ Admin | User management list |
| `PATCH` | `/api/admin/users` | ✅ Admin | Block / unblock a user |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **npm** or **yarn**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AnkurApex/Helpzy.git
cd Helpzy

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** The SQLite database is **auto-created and seeded with demo accounts** on first run — no manual database setup needed.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |

---

## 🧪 Demo Accounts

Use these on the `/auth` page to skip registration:

| Role | Email | Password |
|---|---|---|
| ⚙️ **Admin** | `admin@helpzy.in` | `admin123` |
| 🏠 **Customer** | `rahul@example.com` | `customer123` |
| 🔧 **Provider** | `ramesh@provider.com` | `provider123` |

---

## 🗺 Roadmap

- [x] Home page with 4-panel hero & 8 service categories
- [x] Multi-step OTP authentication (login + signup)
- [x] Provider search and browse with filters
- [x] Full booking flow with Indian address validation
- [x] OTP-based service start verification
- [x] Provider dashboard (accept/reject, mark complete)
- [x] Admin dashboard (verify providers, manage users)
- [x] Indian payment modes (UPI, PhonePe, Paytm, Cash)
- [x] My Bookings & profile management pages
- [x] Review & rating system
- [ ] SMS OTP via MSG91 / Twilio
- [ ] Real-time notifications (Socket.io)
- [ ] Payment gateway integration (Razorpay / Cashfree)
- [ ] Image uploads for provider portfolios (Cloudinary)
- [ ] Export booking data as CSV
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

Please make sure your code follows the existing style and includes appropriate comments.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.

---

<div align="center">

Made with ❤️ by [AnkurApex](https://github.com/AnkurApex)

⭐ **Star this repo** if Helpzy helped you build better service platforms!

</div>
