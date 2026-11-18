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
app/                    Next.js routes and layouts; route entries stay small
features/
  dashboard/            Dashboard screen and its styles
  learning/              Lesson UI, curriculum, learning logic, and types
  onboarding/            Welcome flow and language-selection content
  profile/               Learner profile, account menu, and avatars
  squad/                 Squad screen and its scoring logic
shared/
  components/            UI reused across multiple features
  data/                  Shared UI copy
lib/supabase/            Shared Supabase browser/server clients
public/                  Static assets
styles/                  Global CSS and design tokens
supabase/                Database schema and ordered migrations
tests/                   Automated tests and standalone SQL checks
```

Keep feature-specific components, data, logic, and types together under that feature. Only genuinely reusable UI or infrastructure belongs in `shared/` or `lib/`.

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
