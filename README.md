# LocalPro (Helpzy)

Next.js app for a local services marketplace (customers + service providers) with pages, API routes, and a simple SQLite-backed data layer.

## Tech stack

- **Next.js**: 16.2.4 (Turbopack dev server)
- **React**: 19.2.4
- **Styling**: Tailwind CSS (via PostCSS)
- **Database**: SQLite by default (optionally via `DATABASE_URL`)

## Getting started (local)

### Prerequisites

- **Node.js + npm** installed

### Install

```bash
npm install
```

### Run dev server

```bash
npm run dev
```

App will start on **`http://localhost:3000`**.

### Production build (optional)

```bash
npm run build
npm run start
```

## Environment variables

The app uses SQLite by default and will create/use a DB file in the project root.

- **`DATABASE_URL`** (optional): Path to the SQLite DB file.
  - If not set, defaults to **`helpzy.sqlite`**.
  - Relative paths are resolved from the project root.

Example (PowerShell):

```powershell
$env:DATABASE_URL="helpzy.sqlite"
npm run dev
```

## Project structure

Top-level:

```text
.
├─ eslint.config.mjs        # ESLint config
├─ jsconfig.json            # JS path aliases (if configured)
├─ next.config.mjs          # Next.js config
├─ package.json             # Scripts + dependencies
├─ package-lock.json        # Locked dependency versions
├─ postcss.config.mjs       # PostCSS (Tailwind)
├─ tailwind.config.js       # Tailwind config
├─ public/                  # Static assets
└─ src/                     # App source
```

`src/`:

```text
src/
├─ app/
│  ├─ layout.js
│  ├─ page.js
│  ├─ globals.css
│  ├─ favicon.ico
│  ├─ admin/page.js
│  ├─ auth/page.js
│  ├─ booking/page.js
│  ├─ my-bookings/page.js
│  ├─ profile/page.js
│  ├─ provider/
│  │  ├─ dashboard/page.js
│  │  └─ [id]/
│  │     ├─ page.js
│  │     └─ book/page.js
│  ├─ search/page.js
│  ├─ services/[slug]/page.js
│  └─ api/
│     ├─ auth/route.js
│     ├─ auth/otp/route.js
│     ├─ profile/route.js
│     ├─ payment/route.js
│     ├─ reviews/route.js
│     ├─ providers/route.js
│     ├─ providers/[id]/route.js
│     ├─ bookings/route.js
│     ├─ bookings/[id]/route.js
│     ├─ provider/dashboard/route.js
│     └─ admin/
│        ├─ overview/route.js
│        ├─ providers/route.js
│        └─ users/route.js
├─ components/
│  ├─ Navbar.jsx
│  └─ Footer.jsx
└─ lib/
   ├─ auth.js
   └─ db.js
```

`public/` (examples):

```text
public/
├─ platform_hero.png
├─ category_ac_repair.png
├─ category_cleaner.png
├─ category_electrician.png
├─ category_landscaper.png
└─ category_plumber.png
```

