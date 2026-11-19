# CHANGELOG.md

## 2026-11-18
- Added `supabase/007_lesson_result_validation.sql` to replace the lesson RPC's client-supplied score with server-computed correct/total counts.
- Added strict language, day, question-count, count, and timezone validation plus append-only `lesson_attempts` audit rows with RLS.
- Fixed the Quick Match course-title fallback for languages with localized title data.
- Aligned the dashboard CSS filename with its component name and added VS Code file nesting/search settings.
- Added exact-time daily mission planning for 5–60 minute learner routines, with rotating Listen/Speak/Read/Write practice blocks.
- Connected the learner's mission plan to a guided session with warm-up, active practice, recall, resume checkpoints, live focus-time progress, and a clear learning outcome.

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
