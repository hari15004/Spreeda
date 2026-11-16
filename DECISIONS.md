# DECISIONS.md

## D1 — Static curriculum in `data/`
Free, fast, versioned. Only user progress goes to Supabase.

## D2 — Browser Web Speech API for voice
Free, no backend. Limitation: speech recognition works best in Chrome/Android; fallback = listen-and-repeat without scoring.

## D3 — Supabase Auth + RLS, no custom backend
Fewer moving parts, free tier friendly.

## D4 — No UI kit / template
Custom components and design tokens to keep an original look.

## D5 — Zod for validation
Only added when first server action is built (Phase 2).

## D6 — Plain CSS Modules + CSS variables (no Tailwind)
Keeps the look custom and avoids an extra dependency. Tokens live in `styles/tokens.css`.

## D7 — System font stacks for now
Web fonts via `next/font/google` need network at build time. Font stacks (Noto/Hiragino/Nirmala) are used until fonts are loaded on a networked machine (see TASKS Phase 1).

## D8 — `npm run typecheck` runs `next typegen` first
Next 16 generates `LayoutProps`/route types; plain `tsc` fails without them.

## D9 — npm audit: 16 moderate (eslint dev tooling)
All in eslint plugin chain (minimatch). Dev-only, not shipped. `--force` fix is breaking; revisit when eslint-config-next updates.

## D10 — English-default website with optional Hindi
The website UI defaults to English and supports Hindi. UI language is independent from the target language being learned.

## D11 — Japanese is the first course
Course, lesson, learning-item, and question data use stable IDs and localized text. The current Japanese Day 1 content is versioned as `1.0.0`; its existing local progress key remains unchanged.

## D12 — ₹0 product constraint
Do not add paid APIs, services, dependencies, or infrastructure. Any future free-tier hosting choice must be checked against its limits and current terms.
