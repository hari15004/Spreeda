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
- [ ] Supabase project + env setup
- [ ] Auth (signup/login)
- [ ] Tables + RLS policies
- [ ] Progress save/load

## Phase 3 — Lessons Day 1–5
- [x] Day 1 lesson data (five hiragana vowels)
- [ ] Day 1–5 content (hiragana + greetings)
- [x] Lesson player UI + browser speech audio (Day 1)

## Phase 4 — Tests & Revision
- [x] Day 1 five-question check integrated into the lesson
- [ ] Reusable quick test engine
- [ ] Weak-item tracking
- [ ] Revision session

## Phase 5 — Voice + Finish
- [ ] Speaking practice
- [ ] Days 6–30 content
- [ ] Day 30 challenge
- [ ] Security review + deploy
