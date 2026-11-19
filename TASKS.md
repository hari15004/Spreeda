# TASKS.md

## Phase 0 — Foundation

- [x] Project folder + docs created
- [x] Review docs with owner

## Phase 1 — Setup

- [x] Next.js + TypeScript scaffold
- [x] Folder structure per ARCHITECTURE.md
- [x] Design tokens (colors, font stacks incl. Devanagari + Japanese)
- [ ] Load real web fonts (Noto Serif JP / Noto Sans Devanagari) via next/font on a networked machine
- [x] English-default bilingual dashboard + Hindi toggle linked to the Day 1 lesson
- [x] Typed course/lesson/item model and localized Japanese Day 1 content
- [x] First-visit multilingual welcome flow with locally saved learner preferences
- [x] Personalized path summary before entering the selected course flow
- [x] Coming-soon path for unavailable courses and explicit Japanese preview
- [x] Persistent light/dark theme toggle across onboarding, dashboard, and lessons
- [ ] Runtime-loaded course catalog for adding languages without rebuilding the website (free static-host decision pending)
- [x] lint / typecheck / build passing

## Phase 2 — Backend

- [x] Supabase project + env setup
- [x] Auth: email+password signup/login (no email verification) + Google login
- [x] Tables + RLS policies (supabase/schema.sql, 002, 003, 004 SQL files)
- [x] Squads: create / join by code / leave / owner delete, leaderboard
- [x] Lesson pass (80%) + retry; complete_lesson RPC syncs streak/XP/unlocked day
- [ ] Progress load from Supabase on a new device (not verified)
- [ ] Server-side score validation migration implemented; apply and verify it in the actual Spreeda Supabase project
- [ ] Apply `supabase/007_lesson_result_validation.sql` and run `tests/supabase/lesson-result-validation.sql` in the actual Spreeda project

## Phase 6 — Engagement

- [x] Exact-time daily mission planner for 5–60 minute routines
- [x] Practice-mode rotation across Listen, Speak, Read, and Write
- [x] Guided session flow: warm-up, learn, active practice, recall, real outcome, and focus timer
- [ ] 14-day novelty loop and real-life milestones

## Phase 7 — Admin product

- [ ] Secure admin access and role management
- [ ] Course/lesson content review and publishing
- [ ] Learner engagement analytics and support/feedback inbox

## Phase 3 — Lessons Day 1–5

- [x] Day 1 lesson data (five hiragana vowels)
- [x] 30-lesson course structure for ja, en, es, fr, ko, de, zh (content quality not reviewed)
- [x] Lesson player UI + browser speech audio (Day 1)

## Phase 4 — Tests & Revision

- [x] Day 1 five-question check integrated into the lesson
- [ ] Reusable quick test engine
- [ ] Weak-item tracking
- [ ] Revision session

## Phase 5 — Voice + Finish

- [ ] Speaking practice
- [ ] Days 6–30 content review
- [ ] Day 30 challenge
- [ ] Security review + deploy
