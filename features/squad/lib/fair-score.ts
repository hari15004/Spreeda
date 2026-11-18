import type { LearningSkill } from "@/features/learning/types/learning";

export type LearningAssessment = {
  skill: LearningSkill;
  correct: boolean;
  isReview: boolean;
  studiedOn: string;
};

export type FairScore = {
  score: number | null;
  consistency: number;
  retention: number | null;
  improvement: number | null;
  skillPerformance: number | null;
};

const objectivelyScoredSkills: readonly LearningSkill[] = [
  "listening",
  "reading",
  "writing",
  "vocabulary",
  "grammar",
];

function accuracy(events: readonly LearningAssessment[]) {
  if (events.length === 0) return null;
  return events.filter((event) => event.correct).length / events.length;
}

function dayOffset(studiedOn: string, today: string) {
  const studiedAt = Date.parse(`${studiedOn}T00:00:00Z`);
  const todayAt = Date.parse(`${today}T00:00:00Z`);
  if (!Number.isFinite(studiedAt) || !Number.isFinite(todayAt)) return null;
  return Math.floor((todayAt - studiedAt) / 86_400_000);
}

export function calculateFairScore(
  assessments: readonly LearningAssessment[],
  now = new Date(),
): FairScore {
  const today = now.toISOString().slice(0, 10);
  const dated = assessments
    .map((event) => ({ event, age: dayOffset(event.studiedOn, today) }))
    .filter(
      (entry): entry is { event: LearningAssessment; age: number } =>
        entry.age !== null && entry.age >= 0 && entry.age < 14,
    );
  const recent = dated.filter(({ age }) => age < 7).map(({ event }) => event);
  const previous = dated
    .filter(({ age }) => age >= 7)
    .map(({ event }) => event);
  const reviewEvents = dated
    .filter(({ event }) => event.isReview)
    .map(({ event }) => event);
  const distinctStudyDays = new Set(recent.map((event) => event.studiedOn)).size;
  const consistency = Math.round((distinctStudyDays / 7) * 100);
  const retention = accuracy(reviewEvents);
  const scoredRecent = recent.filter((event) =>
    objectivelyScoredSkills.includes(event.skill),
  );
  const scoredPrevious = previous.filter((event) =>
    objectivelyScoredSkills.includes(event.skill),
  );
  const recentAccuracy = accuracy(scoredRecent);
  const previousAccuracy = accuracy(scoredPrevious);
  const improvement =
    recentAccuracy === null
      ? null
      : previousAccuracy === null
        ? 0.5
        : Math.max(
            0,
            Math.min(1, (recentAccuracy - previousAccuracy + 1) / 2),
          );
  const skillRates = objectivelyScoredSkills
    .map((skill) => accuracy(recent.filter((event) => event.skill === skill)))
    .filter((rate): rate is number => rate !== null);
  const skillPerformance =
    skillRates.length === 0
      ? null
      : skillRates.reduce((total, rate) => total + rate, 0) /
        skillRates.length;

  if (retention === null || skillPerformance === null || improvement === null) {
    return {
      score: null,
      consistency,
      retention,
      improvement,
      skillPerformance,
    };
  }

  const score =
    consistency * 0.25 +
    retention * 100 * 0.35 +
    improvement * 100 * 0.2 +
    skillPerformance * 100 * 0.2;
  return {
    score: Math.round(score),
    consistency,
    retention,
    improvement,
    skillPerformance,
  };
}
