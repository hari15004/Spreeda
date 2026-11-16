# ARCHITECTURE.md

## Product direction
- Multilingual learning platform; English-default website with an optional Hindi UI.
- Japanese is the first course. UI language and target course language are separate.
- Android follows the completed website and should share content, learning rules, and user progress.
- Strict ₹0 budget; no iOS or Play Store release is currently planned.

## Stack
- Next.js (App Router) + TypeScript
- Supabase: Postgres + Auth + RLS
- Vercel: deployment
- Browser-native: Web Speech API (TTS `ja-JP`, speech recognition), Canvas for stroke practice
- No paid APIs.

## Folder structure
```
app/            Routes, layouts, server actions, route handlers
components/     UI components (ui/, lesson/, practice/, layout/)
lib/            supabase clients, utils, scoring, spaced-repetition logic
data/           Static curriculum: days 1-30, kana, vocab, phrases (typed TS/JSON)
types/          Shared TypeScript types
hooks/          Client hooks (useSpeech, useProgress, useRecorder)
public/         Fonts, icons, static audio (if any)
styles/         Global CSS, design tokens
docs/           Extra notes, diagrams
```

## Data flow
1. Curriculum is static in `data/` (fast, free, versioned in git).
2. User progress (completed days, test scores, weak items, streak) lives in Supabase.
3. Reads/writes go through server actions or route handlers; never trust the client.
4. Weak items (wrong answers) are stored per user and re-injected into daily revision.

The current site has a typed Japanese Day 1 course and browser-local progress. It does not yet have runtime-loaded course content, a backend, or cross-device progress. Independently publishing new course content without a website rebuild still requires a free static-content hosting decision.

## Planned DB tables (Phase 2)
- `profiles` (id → auth.users, display_name, created_at)
- `day_progress` (user_id, day, status, completed_at)
- `item_stats` (user_id, item_id, correct, wrong, last_seen, next_review)
- `test_results` (user_id, day, score, taken_at)

All tables: RLS ON, policies `auth.uid() = user_id`.

## Principles
- Server-first rendering, minimal client JS.
- Curriculum content is data, not hardcoded in components.
- Offline-friendly where cheap (static data).
