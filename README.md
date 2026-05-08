<div align="center">

![Helpzy Banner](./helpzy-banner.svg)

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-a3e635?style=for-the-badge)](./LICENSE)

<br/>

> **🏠 Helpzy** is a modern home services booking platform that connects homeowners with verified local professionals — from plumbing and electrical work to cleaning and AC repair. Book trusted pros in seconds.

<br/>

[🚀 Live Demo](#) · [📖 Docs](#getting-started) · [🐛 Report Bug](https://github.com/AnkurApex/Helpzy/issues) · [✨ Request Feature](https://github.com/AnkurApex/Helpzy/issues)

</div>

---

## 📌 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [File Architecture](#file-architecture)
- [Pages Overview](#pages-overview)
- [Getting Started](#getting-started)
- [Demo Accounts](#demo-accounts)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 🏠 About the Project

**Helpzy** is a full-stack home services marketplace built on **Next.js 16** with a SQLite backend and a clean, mobile-first "High-Contrast Direct" design system. Inspired by platforms like Urban Company, it enables users to search for services, view professional profiles, and book appointments — all through a fast and intuitive interface.

The platform serves **three distinct user roles**:

| Role | Description |
|---|---|
| 🏠 **Customer** | Browse services, book pros, manage appointments, pay via UPI/Cash |
| 🔧 **Service Provider** | Accept bookings, generate OTPs, mark jobs complete, view earnings |
| ⚙️ **Admin** | Verify providers, manage users, view platform analytics |

---

## ✨ Features

- 🔐 **Multi-Step OTP Auth** — Email-based OTP login/signup with 6-digit verification, auto-focus, resend timer
- 🔍 **Smart Search** — Find services by category with city/pincode-based filtering
- 📅 **Instant Booking** — Full booking flow with Indian address fields (pincode, city, state)
- 🔑 **OTP Service Start** — Providers generate an OTP; customers verify before work begins
- 💰 **Indian Payment Modes** — Cash, UPI, PhonePe, Paytm support
- 👤 **Provider Profiles** — View ratings, reviews, and service details before booking
- ⚙️ **Admin Dashboard** — Verify providers, block users, view platform metrics
- 📱 **Mobile-First UI** — Responsive design with bottom nav bar for mobile users
- 🌿 **8 Service Categories** — Electrician, Plumber, Cleaner, AC Repair, Painter, Carpenter, Pest Control, Appliance Repair
- 🎨 **Material Design Icons** — Clean, consistent iconography throughout

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | JavaScript (ES2023+) |
| **Styling** | Tailwind CSS |
| **Database** | SQLite via `better-sqlite3` |
| **Auth** | OTP-based + SHA-256 password hashing |
| **Icons** | Google Material Symbols |
| **Fonts** | Google Fonts (Inter) |

---

## 📁 File Architecture

```
Helpzy/
│
├── 📂 public/                        # Static assets
│   ├── category_electrician.png      # AI-generated category images
│   ├── category_plumber.png
│   ├── category_cleaner.png
│   ├── category_ac_repair.png
│   ├── category_landscaper.png
│   └── platform_hero.png
│
├── 📂 src/
│   ├── 📂 app/                       # Next.js App Router
│   │   ├── page.js                   # Home page
│   │   ├── layout.js                 # Root layout (Navbar + Footer)
│   │   ├── globals.css               # Global styles & design tokens
│   │   │
│   │   ├── 📂 auth/                  # Multi-step OTP auth page
│   │   ├── 📂 search/                # Service discovery & filtering
│   │   ├── 📂 booking/               # Booking flow
│   │   ├── 📂 my-bookings/           # Customer booking history
│   │   ├── 📂 profile/               # User profile management
│   │   ├── 📂 provider/
│   │   │   ├── [id]/                 # Public provider profile + book
│   │   │   └── dashboard/            # Provider dashboard
│   │   ├── 📂 admin/                 # Admin control panel
│   │   ├── 📂 services/[slug]/       # Service category pages
│   │   │
│   │   └── 📂 api/                   # REST API routes
│   │       ├── auth/                 # Login / Register
│   │       ├── auth/otp/             # OTP generation & verification
│   │       ├── bookings/             # Booking CRUD
│   │       ├── bookings/[id]/        # Single booking actions
│   │       ├── providers/            # Provider listing
│   │       ├── providers/[id]/       # Provider detail
│   │       ├── provider/dashboard/   # Provider stats & bookings
│   │       ├── reviews/              # Review submission
│   │       ├── payment/              # Payment processing
│   │       ├── profile/              # Profile update
│   │       ├── admin/overview/       # Platform metrics
│   │       ├── admin/providers/      # Provider management
│   │       └── admin/users/          # User management
│   │
│   ├── 📂 components/
│   │   ├── Navbar.jsx                # Responsive navbar with auth state
│   │   └── Footer.jsx                # Site footer
│   │
│   └── 📂 lib/
│       └── db.js                     # SQLite connection + schema init
│
├── 🎨 helpzy-banner.svg              # GitHub README banner
├── ⚙️  next.config.mjs               # Next.js configuration
├── ⚙️  tailwind.config.js            # Tailwind CSS + design tokens
├── 📦 package.json                   # Dependencies & scripts
└── 📄 README.md                      # You are here!
```

---

## 📄 Pages Overview

### 🔐 `/auth` — Multi-Step OTP Authentication
3-step animated auth flow: **Email input → OTP verification → Success redirect**.  
Signup includes name, role selection (Customer / Service Pro), phone, and password creation.

### 🏠 `/` — Home Page
4-panel photo hero (Plumber · Electrician · AC Repair · Landscaper) with CTA buttons, service category grid, and platform info section.

### 🔍 `/search` — Service Discovery
Browse and filter all available providers by category, city, pincode, and rating.

### 📅 `/booking` — Booking Flow
Multi-step booking with Indian address validation, preferred date/time, and payment method selection.

### 👤 `/my-bookings` — Customer Bookings
Full booking history with status tracking: Pending → Accepted → In Progress → Completed → Paid.

### 🔧 `/provider/dashboard` — Provider Dashboard
Accept/reject requests, generate service OTPs, mark jobs complete, view earnings.

### ⚙️ `/admin` — Admin Panel
Platform metrics, provider verification, user management, and system overview.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `v18+`
- **npm** or **yarn**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AnkurApex/Helpzy.git

# 2. Navigate into the project directory
cd Helpzy

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** The SQLite database is auto-created and seeded with demo accounts on first run — no manual setup needed.

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
| ⚙️ Admin | `admin@helpzy.in` | `admin123` |
| 🏠 Customer | `rahul@example.com` | `customer123` |
| 🔧 Provider | `ramesh@provider.com` | `provider123` |

---

## 🗺 Roadmap

- [x] Home page with 4-panel hero & service categories
- [x] Multi-step OTP authentication (login + signup)
- [x] Search and browse functionality with filters
- [x] Full booking flow with Indian address validation
- [x] OTP-based service start verification
- [x] Provider dashboard (accept/reject, mark complete)
- [x] Admin dashboard (verify providers, manage users)
- [x] Indian payment modes (UPI, PhonePe, Paytm, Cash)
- [x] My Bookings & profile management pages
- [ ] SMS OTP via MSG91 / Twilio
- [ ] Real-time notifications (Socket.io)
- [ ] Payment gateway integration (Razorpay / Cashfree)
- [ ] Image uploads for provider portfolios (Cloudinary)
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

Please make sure your code follows the existing code style and includes appropriate comments.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.

---

<div align="center">

Made with ❤️ by [AnkurApex](https://github.com/AnkurApex)

⭐ **Star this repo** if you found it helpful!

</div>
