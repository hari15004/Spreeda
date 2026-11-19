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

export type LearningSkill =
  | "listening"
  | "speaking"
  | "reading"
  | "writing"
  | "vocabulary"
  | "grammar";

export type LessonActivityKind =
  | "listen"
  | "sentence-build"
  | "role-play"
  | "type"
  | "recall"
  | "speak";

export type DialogueLine = {
  speaker: string;
  targetText: string;
  meaning: LocalizedText;
};

export type LessonCurriculum = {
  objective: LocalizedText;
  grammar: LocalizedText;
  pronunciation: LocalizedText;
  segments: readonly {
    title: LocalizedText;
    minutes: number;
    task: LocalizedText;
  }[];
  example: {
    targetText: string;
    meaning: LocalizedText;
  };
  dialogue: readonly DialogueLine[];
  activity: {
    kind: LessonActivityKind;
    instruction: LocalizedText;
    skills: readonly LearningSkill[];
  };
};

export type LessonQuestion = {
  id: string;
  itemId: string;
  reading: string;
  prompt?: LocalizedText;
  correctAnswer: string;
  options: readonly string[];
  skill?: LearningSkill;
  interaction?: LessonActivityKind;
  answerMeaning?: LocalizedText;
  answerAudioText?: string;
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
  curriculum?: LessonCurriculum;
};

export type LessonCheckpoint = {
  lessonId: string;
  phase: "intro" | "review" | "learn" | "practice" | "quiz";
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
