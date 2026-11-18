# PROJECT_RULES.md — Permanent Development Rules

## Product
Multilingual language-learning platform. The website is the first priority, defaults to English, and offers Hindi as an interface and lesson-explanation option. Japanese is the first complete course. After the website, an Android app should provide the same core learning experience and user progress. No iOS or Google Play release is currently planned. Operate within a strict ₹0 budget.

## Work rules
1. Never build everything in one shot. One phase, one task at a time.
2. Before coding: inspect existing structure and the relevant files.
3. Never rewrite or delete working functionality without a reason.
4. No unnecessary packages. Every new dependency is logged in DECISIONS.md.
5. Code stays modular, clean, typed (TypeScript strict).
6. After every meaningful task run: `npm run lint`, `npm run typecheck`, `npm run build`.
7. Fix failures before moving on.
8. Mark `[x]` in TASKS.md only after implemented AND verified.
9. Never claim something is done when it is not.
10. Mobile + desktop must both work, always.
11. No dead code, duplicate code, unused imports, leftover files.
12. Before creating any new file/component, say what it does and what it affects.
13. At the end of each task, give a concise blue-text summary of the work completed and relevant validation results.

## Session start checklist
1. Read PROJECT_RULES.md
2. Read TASKS.md
3. Pick the next unfinished task
4. Work only on it (unless a dependency forces otherwise)
5. Test
6. Update TASKS.md and CHANGELOG.md
7. Report: done / tested / remaining

## Design rules
- Japanese-inspired, calm, premium, and contemporary. Original, not a template or a clone of another language app.
- No fake stats, random gradients, heavy glassmorphism, pointless visuals.
- Every visual element must support learning.
- One clear next action on the home screen.
- Gamification: subtle (streak, progress), never childish.

## Language rules
- Website UI defaults to English; Hindi is an optional UI language.
- UI language is separate from the language being learned.
- Japanese learning items include Japanese script, romaji, and an explanation or pronunciation cue in the selected UI language.
