import type { TargetLanguageOption } from "@/features/learning/types/learning";

export const targetLanguages = [
  {
    code: "ja",
    title: { en: "Japanese", hi: "जापानी" },
    nativeName: "日本語",
    availability: "available",
  },
  {
    code: "en",
    title: { en: "English", hi: "अंग्रेज़ी" },
    nativeName: "English",
    availability: "available",
  },
  {
    code: "fr",
    title: { en: "French", hi: "फ़्रेंच" },
    nativeName: "Français",
    availability: "available",
  },
  {
    code: "de",
    title: { en: "German", hi: "जर्मन" },
    nativeName: "Deutsch",
    availability: "available",
  },
  {
    code: "it",
    title: { en: "Italian", hi: "इतालवी" },
    nativeName: "Italiano",
    availability: "available",
  },
] as const satisfies readonly TargetLanguageOption[];

export const legacyTargetLanguages = [
  {
    code: "es",
    title: { en: "Spanish", hi: "स्पैनिश" },
    nativeName: "Español",
    availability: "available",
  },
  {
    code: "ko",
    title: { en: "Korean", hi: "कोरियाई" },
    nativeName: "한국어",
    availability: "available",
  },
  {
    code: "zh",
    title: { en: "Mandarin Chinese", hi: "चीनी (मंदारिन)" },
    nativeName: "中文",
    availability: "available",
  },
] as const satisfies readonly TargetLanguageOption[];

export const allTargetLanguages = [
  ...targetLanguages,
  ...legacyTargetLanguages,
] as const;
