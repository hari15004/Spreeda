import type { LearningSkill } from "@/features/learning/types/learning";

export type RecallCard = {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  dueAt: string;
  lastGrade: number;
  attempts: number;
  correct: number;
};

export type SkillHistory = {
  attempts: number;
  correct: number;
  recent: boolean[];
  lastPracticedAt: string;
};

export type LearningMemory = {
  items: Record<string, RecallCard>;
  skills: Partial<Record<LearningSkill, SkillHistory>>;
};

const learningSkills: readonly LearningSkill[] = [
  "listening",
  "speaking",
  "reading",
  "writing",
  "vocabulary",
  "grammar",
];

export const initialLearningMemory: LearningMemory = {
  items: {},
  skills: {},
};

export function recordRecall(
  memory: LearningMemory,
  itemId: string,
  correct: boolean,
  now = new Date(),
): LearningMemory {
  const previous = memory.items[itemId];
  const grade = correct ? 4 : 1;
  const easeFactor = Math.max(
    1.3,
    (previous?.easeFactor ?? 2.5) +
      (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)),
  );
  const repetitions =
    grade < 3 ? 0 : (previous?.repetitions ?? 0) + 1;
  const intervalDays =
    grade < 3
      ? 1
      : repetitions === 1
        ? 1
        : repetitions === 2
          ? 6
          : Math.max(
              1,
              Math.round((previous?.intervalDays ?? 6) * easeFactor),
            );
  const dueAt = new Date(now);
  dueAt.setUTCDate(dueAt.getUTCDate() + intervalDays);

  return {
    ...memory,
    items: {
      ...memory.items,
      [itemId]: {
        repetitions,
        intervalDays,
        easeFactor,
        dueAt: dueAt.toISOString(),
        lastGrade: grade,
        attempts: (previous?.attempts ?? 0) + 1,
        correct: (previous?.correct ?? 0) + Number(correct),
      },
    },
  };
}

export function recordSkillResult(
  memory: LearningMemory,
  skill: LearningSkill,
  correct: boolean,
  now = new Date(),
): LearningMemory {
  const previous = memory.skills[skill];
  return {
    ...memory,
    skills: {
      ...memory.skills,
      [skill]: {
        attempts: (previous?.attempts ?? 0) + 1,
        correct: (previous?.correct ?? 0) + Number(correct),
        recent: [...(previous?.recent ?? []), correct].slice(-10),
        lastPracticedAt: now.toISOString(),
      },
    },
  };
}

export function getDueReviewIds(
  memory: LearningMemory,
  now = new Date(),
  limit = 8,
): string[] {
  if (!Number.isInteger(limit) || limit < 1) return [];
  return Object.entries(memory.items)
    .filter(([, card]) => Date.parse(card.dueAt) <= now.getTime())
    .sort(
      ([, first], [, second]) =>
        Date.parse(first.dueAt) - Date.parse(second.dueAt),
    )
    .slice(0, limit)
    .map(([itemId]) => itemId);
}

export function parseLearningMemory(value: string): LearningMemory {
  if (!value) return initialLearningMemory;
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("items" in parsed) ||
      typeof parsed.items !== "object" ||
      parsed.items === null ||
      !("skills" in parsed) ||
      typeof parsed.skills !== "object" ||
      parsed.skills === null
    ) {
      return initialLearningMemory;
    }

    const items: Record<string, RecallCard> = {};
    for (const [itemId, card] of Object.entries(parsed.items)) {
      if (
        typeof card === "object" &&
        card !== null &&
        "repetitions" in card &&
        typeof card.repetitions === "number" &&
        Number.isInteger(card.repetitions) &&
        card.repetitions >= 0 &&
        "intervalDays" in card &&
        typeof card.intervalDays === "number" &&
        Number.isFinite(card.intervalDays) &&
        card.intervalDays >= 1 &&
        "easeFactor" in card &&
        typeof card.easeFactor === "number" &&
        Number.isFinite(card.easeFactor) &&
        "dueAt" in card &&
        typeof card.dueAt === "string" &&
        Number.isFinite(Date.parse(card.dueAt)) &&
        "lastGrade" in card &&
        typeof card.lastGrade === "number" &&
        "attempts" in card &&
        typeof card.attempts === "number" &&
        Number.isInteger(card.attempts) &&
        card.attempts >= 0 &&
        "correct" in card &&
        typeof card.correct === "number" &&
        Number.isInteger(card.correct) &&
        card.correct >= 0
      ) {
        items[itemId] = {
          repetitions: card.repetitions,
          intervalDays: card.intervalDays,
          easeFactor: card.easeFactor,
          dueAt: card.dueAt,
          lastGrade: card.lastGrade,
          attempts: card.attempts,
          correct: card.correct,
        };
      }
    }

    const skills: Partial<Record<LearningSkill, SkillHistory>> = {};
    const savedSkills = parsed.skills as Record<string, unknown>;
    for (const skill of learningSkills) {
      const history = savedSkills[skill];
      if (
        typeof history === "object" &&
        history !== null &&
        "attempts" in history &&
        typeof history.attempts === "number" &&
        Number.isInteger(history.attempts) &&
        history.attempts >= 0 &&
        "correct" in history &&
        typeof history.correct === "number" &&
        Number.isInteger(history.correct) &&
        history.correct >= 0 &&
        history.correct <= history.attempts &&
        "recent" in history &&
        Array.isArray(history.recent) &&
        history.recent.length <= 10 &&
        history.recent.every((result) => typeof result === "boolean") &&
        "lastPracticedAt" in history &&
        typeof history.lastPracticedAt === "string" &&
        Number.isFinite(Date.parse(history.lastPracticedAt))
      ) {
        skills[skill] = {
          attempts: history.attempts,
          correct: history.correct,
          recent: history.recent,
          lastPracticedAt: history.lastPracticedAt,
        };
      }
    }

    return { items, skills };
  } catch {
    return initialLearningMemory;
  }
}
