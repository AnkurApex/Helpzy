# 🛠️ Helpzy (LocalPro)

<div align="center">

<img src="./public/platform_hero.png" alt="Helpzy Platform Banner" width="600" style="border-radius: 12px; margin-bottom: 12px;" />

![Helpzy Banner](https://img.shields.io/badge/Helpzy-Home%20Services-016e21?style=for-the-badge&logo=next.js&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

### 🚀 Book Verified Home Service Professionals Instantly in India

**Find Electricians, Plumbers, Cleaners & AC Technicians → Get transparent pricing, instant booking & secure OTP service verification.**

</div>

---

## 🎯 Problem Statement

Hiring reliable home maintenance professionals in urban India is often frustrating, opaque, and unsafe. Traditional unorganized local contractor networks result in:

- ❌ **Unpredictable Pricing:** Arbitrary quotes with hidden extra charges.
- ❌ **Safety & Verification Risks:** Unvetted technicians entering homes without identification.
- ❌ **Delays & No-Shows:** Lack of scheduling transparency and unpunctual visits.
- ❌ **Zero Accountability:** No recourse or formal dispute resolution when jobs are poorly executed.

---

## 💡 Our Solution

**Helpzy** is an on-demand, end-to-end home services platform built with Next.js 16 and SQLite. It connects homeowners directly with verified local tradespeople, featuring:

- **Transparent Pricing:** Clear base rates and service catalogs upfront.
- **OTP-Secured Completion:** Service visits are verified through a customer-provided OTP before payment release.
- **Role-Based Portals:** Dedicated experiences for Customers, Service Providers, and Platform Admins.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Service Discovery** | Search and filter by category (Electrician, Plumber, Cleaner, AC Repair, Painter). |
| 📅 **Instant Booking** | Select service date, time slot, and address in a streamlined checkout flow. |
| 🔐 **OTP Job Verification** | Technician must verify a unique OTP provided by the customer to complete work. |
| 💳 **Payment Flexibility** | Support for Cash on Delivery and mock UPI transactions (PhonePe, Paytm, GPay). |
| ⭐ **Ratings & Reviews** | Verified customer feedback with dynamic star ratings and review counts. |
| 📊 **Provider Dashboard** | Accept/reject job requests, verify OTPs, and track earnings in real-time. |
| 🛡️ **Admin Portal** | Monitor total bookings, platform revenue, verify service providers, and manage users. |
| 🔒 **Security & Rate Limiting** | Passwords secured with `scrypt` hashing, session authentication, and API rate-limiting. |

---

## 📸 Categories & Showcase

| Electrician | Plumber | Cleaner | AC Repair |
|:-----------:|:-------:|:-------:|:---------:|
| <img src="./public/category_electrician.png" width="160" /> | <img src="./public/category_plumber.png" width="160" /> | <img src="./public/category_cleaner.png" width="160" /> | <img src="./public/category_ac_repair.png" width="160" /> |

---

## 🛠️ Tech Stack

### Frontend & Application
- ⚡ **Next.js 16 (App Router)** — Modern server-rendered and static components with Turbopack.
- ⚛️ **React 19** — Latest React primitives and hooks.
- 🎨 **Tailwind CSS v4** — Design-token based styling with custom themes and responsive layouts.
- 🔤 **Google Fonts & Material Symbols** — Clean typography and visual iconography.

### Backend & Data Layer
- 🟢 **Next.js Route Handlers** — RESTful API endpoints for auth, bookings, providers, and admin controls.
- 🗄️ **SQLite (`sqlite3` + `sqlite`)** — Lightweight, zero-config relational database with automated schema migrations and seeding.
- 🛡️ **Crypto (`scrypt`)** — Cryptographically secure password hashing and verification.

### Architecture Flow
```text
Customer / Provider Browser
             │
             ▼
 Next.js 16 App Router (React 19)
   ├── Customer Pages: /search, /services/[slug], /provider/[id], /booking
   ├── Provider Dashboard: /provider/dashboard
   └── Admin Portal: /admin
             │
             ▼
 Next.js API Routes (Serverless Handlers)
   ├── /api/auth & /api/auth/otp (Authentication & Rate Limiting)
   ├── /api/bookings & /api/bookings/[id] (Booking Lifecycle)
   ├── /api/providers & /api/reviews (Provider Directory)
   └── /api/admin/* (Platform Analytics & User Moderation)
             │
             ▼
 SQLite Data Access Layer (`src/lib/db.js`)
             │
             ▼
 Local Database (`helpzy.sqlite`)
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone the Repository
```bash
git clone https://github.com/AnkurApex/Helpzy.git
cd Helpzy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Default variables in `.env`:
```env
DATABASE_URL=helpzy.sqlite
SESSION_SECRET=your_secret_session_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 🧪 Demo Accounts

The SQLite database seeds development accounts automatically on first run:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | `admin@helpzy.in` | `admin123` | Access to `/admin` dashboard |
| **Customer** | `rahul@example.com` | `customer123` | Customer booking & review account |
| **Provider** | `ramesh@provider.com` | `provider123` | Electrician provider dashboard access |

---

## 📁 Project Structure

```text
Helpzy/
├── docs/                      # Architectural & security documentation
│   ├── API.md                 # API endpoints & contracts
│   ├── ARCHITECTURE.md        # System design & component boundaries
│   ├── CODE_STYLE.md          # Code standards & naming conventions
│   ├── DATABASE.md            # Schema definitions & query conventions
│   ├── DESIGN_SYSTEM.md       # Color palettes, typography & spacing tokens
│   ├── PRD.md                 # Product requirements document
│   └── SECURITY.md            # Security rules & auth guidelines
├── public/                    # Optimized image assets
│   ├── category_ac_repair.png
│   ├── category_cleaner.png
│   ├── category_electrician.png
│   ├── category_landscaper.png
│   ├── category_plumber.png
│   └── platform_hero.png
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── admin/             # Admin management dashboard
│   │   ├── api/               # Serverless API routes
│   │   │   ├── admin/         # Admin API endpoints
│   │   │   ├── auth/          # Password & OTP auth endpoints
│   │   │   ├── bookings/      # Booking operations
│   │   │   ├── payment/       # Payment handling
│   │   │   ├── profile/       # User profile API
│   │   │   ├── provider/      # Provider dashboard routes
│   │   │   ├── providers/     # Public provider directory
│   │   │   └── reviews/       # Review submissions
│   │   ├── auth/              # Customer / Provider login & signup
│   │   ├── booking/           # Checkout & scheduling flow
│   │   ├── my-bookings/       # Customer booking history & status
│   │   ├── profile/           # User profile & address settings
│   │   ├── provider/          # Provider profile & booking page
│   │   ├── search/            # Provider search & filter page
│   │   ├── services/[slug]/   # Category landing pages
│   │   ├── layout.js          # Root layout with fonts & Navbar/Footer
│   │   └── page.js            # Platform homepage
│   ├── components/            # Reusable React components
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx
│   │   └── ProviderCard.jsx
│   └── lib/                   # Shared utilities & database client
│       ├── auth.js            # Session & token handlers
│       ├── constants.js       # Categories, payment options, and regex
│       ├── db.js              # SQLite connection, schema & seeders
│       ├── http.js            # Standard HTTP response helpers
│       └── rateLimit.js       # In-memory API rate limiter
├── .env.example
├── AGENTS.md                  # Development guidelines for AI agents
├── eslint.config.mjs          # Linting rules
├── package.json
└── tailwind.config.js         # Tailwind theme configuration
```

---

## 🆕 What Makes This Different

Traditional classifieds platforms only display phone numbers, leaving the customer vulnerable. Here is how Helpzy compares:

| Feature | Classifieds / Directories | Helpzy Platform |
|---------|---------------------------|-----------------|
| **Booking Mechanism** | ❌ Manual phone calls | ✅ In-app scheduling & instant confirmation |
| **Pricing Transparency** | ❌ Negotiated on-site | ✅ Standardized base price & itemized quotes |
| **Service Completion Verification** | ❌ None (honor system) | ✅ Secure OTP verification code |
| **Payment Options** | ❌ Cash only | ✅ Cash on Delivery + UPI integration |
| **Provider Onboarding** | ❌ Unverified listings | ✅ Admin verification & profile approvals |
| **Dispute & Review Tracking** | ❌ Unverified reviews | ✅ Review tied exclusively to completed booking ID |

---

## 🔮 Future Scope

- [ ] **Live Geolocation Tracking:** Real-time map view of the technician en route.
- [ ] **Real-time Messaging:** In-app chat between customer and provider via WebSockets.
- [ ] **Razorpay & Cashfree Gateway:** Automated UPI and NetBanking payment gateway integration.
- [ ] **Mobile Application:** Cross-platform iOS and Android mobile app using React Native.
- [ ] **Push & SMS Alerts:** Instant WhatsApp/SMS notifications for booking updates and OTPs.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
