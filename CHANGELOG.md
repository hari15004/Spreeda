# CHANGELOG.md

## 2026-10-31
- Phase 0: created PROJECT_RULES, ARCHITECTURE, SECURITY, LEARNING_SYSTEM, DECISIONS, TASKS, CHANGELOG.
- Phase 1: Next.js 16 + TypeScript scaffold, folder structure, design tokens (styles/tokens.css), base layout, home screen shell with DayPath. lint/typecheck/build pass.

## 2026-11-15
- Replaced the placeholder home screen with a responsive Hindi-first learning dashboard and a working Day 1 hiragana lesson.
- Added five-vowel kana study cards, Japanese browser audio, a five-question quiz with feedback, and a results review.
- Saved lesson completion and daily streak locally on the device; cloud accounts and the remaining curriculum are still pending.
- Updated the website to default to English with a persistent Hindi language toggle, localized the Day 1 lesson, and added typed course/language/lesson content contracts.
- Refreshed the dashboard with a course badge, stronger visual hierarchy, a focused dark hero, and responsive language controls while preserving local progress.
- Added a multilingual welcome flow for learning preferences, with local-only profile storage and an edit-learning-path entry point.
- Added a bilingual learning-path summary so learners can review their language, level, goal, routine, and practice preferences before continuing.
- Added honest coming-soon screens for unavailable languages and an explicitly labeled Japanese preview; existing lesson progress storage remains unchanged.
- Added a persistent, bilingual dark-mode toggle across the welcome flow, course screens, dashboard, and lesson dialog.
