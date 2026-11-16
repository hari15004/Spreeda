export type UiLanguage = "en" | "hi";

export type LocalizedText = {
  en: string;
  hi?: string;
  [languageCode: string]: string | undefined;
};

export type Language = {
  code: string;
  nativeName: string;
  englishName: string;
  script: string;
  speechLocale: string;
};

export type TargetLanguageOption = {
  code: string;
  title: LocalizedText;
  nativeName: string;
  availability: "available" | "coming-soon";
};

export type LearningItem = {
  id: string;
  kind: "script-character" | "vocabulary" | "phrase" | "grammar";
  targetText: string;
  reading: string;
  pronunciationCue: LocalizedText;
  audioText: string;
  meaning?: LocalizedText;
  isReview?: boolean;
};

export type LessonQuestion = {
  id: string;
  itemId: string;
  reading: string;
  prompt?: LocalizedText;
  correctAnswer: string;
  options: readonly string[];
};

export type Lesson = {
  id: string;
  courseId: string;
  sequence: number;
  title: LocalizedText;
  description: LocalizedText;
  mission?: LocalizedText;
  estimatedMinutes: number;
  items: readonly LearningItem[];
  questions: readonly LessonQuestion[];
};

export type LessonCheckpoint = {
  lessonId: string;
  phase: "learn" | "quiz";
  questionIndex: number;
  answer: string | null;
  score: number;
  elapsedSeconds: number;
};

export type Course = {
  id: string;
  targetLanguageCode: string;
  supportedUiLanguages: readonly UiLanguage[];
  title: LocalizedText;
  contentVersion: string;
  lessons: readonly Lesson[];
};
