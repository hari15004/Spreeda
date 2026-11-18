import type { Language } from "@/features/learning/types/learning";

export const languages: Record<string, Language> = {
  en: {
    code: "en",
    nativeName: "English",
    englishName: "English",
    script: "Latin",
    speechLocale: "en-US",
  },
  hi: {
    code: "hi",
    nativeName: "हिन्दी",
    englishName: "Hindi",
    script: "Devanagari",
    speechLocale: "hi-IN",
  },
  ja: {
    code: "ja",
    nativeName: "日本語",
    englishName: "Japanese",
    script: "Japanese",
    speechLocale: "ja-JP",
  },
  es: {
    code: "es",
    nativeName: "Español",
    englishName: "Spanish",
    script: "Latin",
    speechLocale: "es-ES",
  },
  fr: {
    code: "fr",
    nativeName: "Français",
    englishName: "French",
    script: "Latin",
    speechLocale: "fr-FR",
  },
  ko: {
    code: "ko",
    nativeName: "한국어",
    englishName: "Korean",
    script: "Hangul",
    speechLocale: "ko-KR",
  },
  de: {
    code: "de",
    nativeName: "Deutsch",
    englishName: "German",
    script: "Latin",
    speechLocale: "de-DE",
  },
  it: {
    code: "it",
    nativeName: "Italiano",
    englishName: "Italian",
    script: "Latin",
    speechLocale: "it-IT",
  },
  zh: {
    code: "zh",
    nativeName: "中文",
    englishName: "Mandarin Chinese",
    script: "Han",
    speechLocale: "zh-CN",
  },
};
