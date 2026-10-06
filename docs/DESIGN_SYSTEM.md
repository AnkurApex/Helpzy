# DESIGN_SYSTEM.md

## Brand

- Dark emerald (`emerald-950`) + lime (`lime-400`) accents
- Warm off-white surfaces (`background` / `surface` from `tailwind.config.js`)
- Display type: Inter / Manrope via `layout.js`
- Icons: Material Symbols Outlined

## UI rules

- Primary CTA: lime pill on dark emerald, or dark emerald on light surfaces
- Uppercase tracking for labels and nav
- Loading, empty, and error states on data screens
- Keep navbar and footer; do not invent a second chrome
- Prefer existing Tailwind tokens (`primary`, `on-surface`, `outline`) over one-off hex colors when a token already exists
