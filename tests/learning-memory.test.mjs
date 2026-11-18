import assert from "node:assert/strict";
import test from "node:test";
import {
  getDueReviewIds,
  initialLearningMemory,
  parseLearningMemory,
  recordRecall,
  recordSkillResult,
} from "../features/learning/lib/learning-memory.ts";
import { createLessonCurriculum } from "../features/learning/data/curriculum.ts";
import { calculateFairScore } from "../features/squad/lib/fair-score.ts";

test("correct recall schedules increasingly spaced reviews", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");
  const first = recordRecall(initialLearningMemory, "ja:あ", true, now);
  assert.equal(first.items["ja:あ"].intervalDays, 1);
  const second = recordRecall(first, "ja:あ", true, now);
  assert.equal(second.items["ja:あ"].intervalDays, 6);
  const third = recordRecall(second, "ja:あ", true, now);
  assert.ok(third.items["ja:あ"].intervalDays > 6);
});

test("a missed recall resets the interval and returns the card to review", () => {
  const now = new Date("2026-01-10T00:00:00.000Z");
  const learned = recordRecall(initialLearningMemory, "fr:bonjour", true, now);
  const due = new Date("2026-01-11T00:00:00.000Z");
  const missed = recordRecall(learned, "fr:bonjour", false, due);
  assert.equal(missed.items["fr:bonjour"].repetitions, 0);
  assert.equal(missed.items["fr:bonjour"].intervalDays, 1);
  assert.deepEqual(
    getDueReviewIds(missed, new Date("2026-01-12T00:00:00.000Z")),
    ["fr:bonjour"],
  );
});

test("skill history is bounded and malformed storage is safely ignored", () => {
  let memory = initialLearningMemory;
  for (let index = 0; index < 12; index += 1) {
    memory = recordSkillResult(
      memory,
      "vocabulary",
      index % 2 === 0,
      new Date(`2026-01-${String(index + 1).padStart(2, "0")}T00:00:00Z`),
    );
  }
  assert.equal(memory.skills.vocabulary?.attempts, 12);
  assert.equal(memory.skills.vocabulary?.recent.length, 10);
  const parsed = parseLearningMemory(JSON.stringify(memory));
  assert.equal(parsed.skills.vocabulary?.attempts, 12);
  assert.deepEqual(parseLearningMemory("not-json"), initialLearningMemory);
});

test("core-language lessons have a timed daily plan and distinct grammar", () => {
  const japanese = createLessonCurriculum(
    "ja",
    1,
    { en: "Ask politely", hi: "विनम्रता से कहें" },
    "お願いします",
    { en: "Please", hi: "कृपया" },
  );
  const italian = createLessonCurriculum(
    "it",
    1,
    { en: "Ask politely", hi: "विनम्रता से कहें" },
    "Per favore",
    { en: "Please", hi: "कृपया" },
  );
  assert.equal(
    japanese.segments.reduce((total, segment) => total + segment.minutes, 0),
    40,
  );
  assert.notEqual(japanese.grammar.en, italian.grammar.en);
  assert.equal(japanese.dialogue.length, 2);
});

test("fair competition scores normalized learning evidence, not attempt volume", () => {
  const now = new Date("2026-03-10T12:00:00.000Z");
  const assessments = [
    { skill: "listening", correct: true, isReview: false, studiedOn: "2026-03-10" },
    { skill: "writing", correct: false, isReview: false, studiedOn: "2026-03-09" },
    { skill: "vocabulary", correct: true, isReview: true, studiedOn: "2026-03-08" },
  ];
  const score = calculateFairScore(assessments, now);
  const repeated = calculateFairScore(
    [...assessments, ...assessments],
    now,
  );
  assert.equal(score.score, repeated.score);
  assert.equal(score.retention, 1);
  assert.equal(calculateFairScore(assessments.slice(0, 2), now).score, null);
});
