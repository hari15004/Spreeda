import type { UiLanguage } from "@/features/learning/types/learning";

export type ProficiencyLevel = "new" | "beginner" | "intermediate";

export type LearningGoal =
  | "everyday"
  | "travel"
  | "work"
  | "study"
  | "culture"
  | "personal";

export type PracticeMode = "listen" | "speak" | "read" | "write";

export type LearnerProfile = {
  schemaVersion: 1;
  uiLanguage: UiLanguage;
  knownLanguages: string[];
  otherKnownLanguage: string;
  targetLanguageCode: string;
  proficiency: ProficiencyLevel;
  goal: LearningGoal;
  dailyMinutes: 5 | 10 | 15 | 20 | 30 | 40 | 45 | 60;
  practiceModes: PracticeMode[];
};
