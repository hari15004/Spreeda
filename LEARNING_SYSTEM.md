# LEARNING_SYSTEM.md — 30-Day Curriculum & Logic

## Daily structure (~20–30 min)
1. **Seekho** — 5–8 new items (script + romaji + Hindi meaning + audio)
2. **Bolo** — repeat/speak practice (TTS model + mic attempt)
3. **Likho** — kana/word writing practice
4. **Test** — 5-question quick check
5. **Revision** — weak items from earlier days mixed in

Each day ends with ONE next action: "Kal ka din" or "Revision karo".

## Curriculum outline
| Week | Days | Theme |
|---|---|---|
| 1 | 1–7 | Hiragana (all rows) + greetings, self-intro basics |
| 2 | 8–14 | Katakana, numbers 1–100, time, days |
| 3 | 15–21 | Core grammar patterns (です/ます, particles は/を/に/で), shopping, restaurant |
| 4 | 22–28 | Travel, directions, transport, hotel, emergencies, ~30 basic kanji |
| 5 | 29–30 | Full revision + **Day 30 Survival Challenge** |

## Day 30 Challenge
Scripted real-life scenarios: introduce yourself → order food → ask price → ask directions → handle a problem. Scored on listening, speaking, reading.

## Weak-area logic
- Each item tracked: correct, wrong, last_seen.
- Wrong answer → item enters weak list, shown again next day, then +3 days, +7 days (simple spaced repetition).
- 3 correct in a row → item leaves weak list.
- Revision session picks weakest items first.

## Content format
Learning items use stable IDs, a target-language text field, a reading, and pronunciation cues localized for the selected UI language. Course and lesson titles/instructions are localized as well. UI language is independent from the target language.

The current TypeScript contracts live in `types/learning.ts`; the first Japanese course and Day 1 lesson are in `data/day-one.ts`. `contentVersion` is separate from the type/schema version. Adding content currently requires updating the bundled website data; independent runtime publishing still needs a free static-content host.
