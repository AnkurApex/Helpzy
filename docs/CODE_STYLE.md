# CODE_STYLE.md

## 1. Purpose

Conventions so new Helpzy code stays consistent with this repository.

## 2. Stack

- JavaScript (not TypeScript)
- React functional components
- Next.js App Router
- Tailwind CSS + ESLint (`eslint-config-next`)
- No Prettier config in this repo — do not reformat unrelated files

## 3. General principles

- Prefer readable code over clever code.
- Reuse existing components and `src/lib` helpers before adding new ones.
- Keep UI, data fetching, and SQL in their current layers.
- Do not add TypeScript, Prisma, or extra UI libraries unless required.

## 4. Naming

- Components: PascalCase files (`Navbar.jsx`, `ProviderCard.jsx`)
- Route files stay Next.js names: `page.js`, `route.js`, `layout.js`
- Functions and variables: camelCase
- SQL columns: snake_case
- Booleans: `isLoading`, `is_blocked`, `otp_verified`

## 5. Components

- `'use client'` only when the page needs state, effects, or browser APIs.
- Handle loading, error, and empty states on data screens.
- Shared listing cards belong in `src/components`.

## 6. Formatting

- Follow ESLint. Do not reformat files you are not changing.
- Remove unused imports you introduce.
- Import order: React/Next, then `@/lib`, then local components.

## 7. Comments

Comment why, not obvious what.

## 8. Before finishing

- Run lint on touched files.
- Check loading/empty/error UI if a screen changed.
- Remove debug logs.
