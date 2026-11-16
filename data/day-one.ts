import type { Course, LearningItem, Lesson, LessonQuestion } from "@/types/learning";

export const dayOneKana = [
  {
    id: "ja-day-01-a",
    kind: "script-character",
    targetText: "あ",
    reading: "a",
    pronunciationCue: { en: "a", hi: "आ" },
    audioText: "あ",
  },
  {
    id: "ja-day-01-i",
    kind: "script-character",
    targetText: "い",
    reading: "i",
    pronunciationCue: { en: "ee", hi: "ई" },
    audioText: "い",
  },
  {
    id: "ja-day-01-u",
    kind: "script-character",
    targetText: "う",
    reading: "u",
    pronunciationCue: { en: "oo", hi: "ऊ" },
    audioText: "う",
  },
  {
    id: "ja-day-01-e",
    kind: "script-character",
    targetText: "え",
    reading: "e",
    pronunciationCue: { en: "e", hi: "ए" },
    audioText: "え",
  },
  {
    id: "ja-day-01-o",
    kind: "script-character",
    targetText: "お",
    reading: "o",
    pronunciationCue: { en: "o", hi: "ओ" },
    audioText: "お",
  },
] as const satisfies readonly LearningItem[];

export const dayOneQuestions = dayOneKana.map((kana) => ({
  id: `${kana.id}-question`,
  itemId: kana.id,
  reading: kana.reading,
  correctAnswer: kana.targetText,
  options: dayOneKana.map((option) => option.targetText),
})) satisfies readonly LessonQuestion[];

export const japaneseDayOne: Lesson = {
  id: "ja-day-01",
  courseId: "japanese",
  sequence: 1,
  title: {
    en: "Meet the five hiragana vowels",
    hi: "हिरागाना के पाँच स्वरों से मिलें",
  },
  description: {
    en: "Listen, recognize, and remember the building blocks of Japanese reading.",
    hi: "जापानी पढ़ने की बुनियाद को सुनें, पहचानें और याद रखें।",
  },
  estimatedMinutes: 8,
  items: dayOneKana,
  questions: dayOneQuestions,
};

export const japaneseCourse: Course = {
  id: "japanese",
  targetLanguageCode: "ja",
  supportedUiLanguages: ["en", "hi"],
  title: { en: "Japanese", hi: "जापानी" },
  contentVersion: "1.0.0",
  lessons: [japaneseDayOne],
};
