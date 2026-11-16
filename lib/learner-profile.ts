import type {
  LearnerProfile,
  LearningGoal,
  PracticeMode,
  ProficiencyLevel,
} from "@/types/learner-profile";
import type { UiLanguage } from "@/types/learning";
import { targetLanguages } from "@/data/target-languages";

export const learnerProfileKey = "spreeda-learner-profile";
export const learnerProfileChangeEvent = "spreeda-learner-profile-change";

const proficiencyLevels: ProficiencyLevel[] = [
  "new",
  "beginner",
  "intermediate",
];
const learningGoals: LearningGoal[] = [
  "everyday",
  "travel",
  "work",
  "study",
  "culture",
  "personal",
];
const practiceModes: PracticeMode[] = ["listen", "speak", "read", "write"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUiLanguage(value: unknown): value is UiLanguage {
  return value === "en" || value === "hi";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isPracticeModeArray(value: unknown): value is PracticeMode[] {
  return (
    Array.isArray(value) &&
    value.every((item) => practiceModes.some((mode) => mode === item))
  );
}

export function parseLearnerProfile(value: string): LearnerProfile | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      !isRecord(parsed) ||
      parsed.schemaVersion !== 1 ||
      !isUiLanguage(parsed.uiLanguage) ||
      !isStringArray(parsed.knownLanguages) ||
      typeof parsed.otherKnownLanguage !== "string" ||
      typeof parsed.targetLanguageCode !== "string" ||
      !targetLanguages.some(
        (option) => option.code === parsed.targetLanguageCode,
      ) ||
      !proficiencyLevels.some((level) => level === parsed.proficiency) ||
      !learningGoals.some((goal) => goal === parsed.goal) ||
      (parsed.dailyMinutes !== 5 &&
        parsed.dailyMinutes !== 10 &&
        parsed.dailyMinutes !== 15 &&
        parsed.dailyMinutes !== 20) ||
      !isPracticeModeArray(parsed.practiceModes)
    ) {
      return null;
    }

    return {
      schemaVersion: 1,
      uiLanguage: parsed.uiLanguage,
      knownLanguages: parsed.knownLanguages,
      otherKnownLanguage: parsed.otherKnownLanguage,
      targetLanguageCode: parsed.targetLanguageCode,
      proficiency: parsed.proficiency as ProficiencyLevel,
      goal: parsed.goal as LearningGoal,
      dailyMinutes: parsed.dailyMinutes,
      practiceModes: parsed.practiceModes,
    };
  } catch {
    return null;
  }
}
