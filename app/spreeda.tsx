"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AccountMenu } from "@/components/account/AccountMenu";
import { DayPath } from "@/components/layout/DayPath";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import {
  LearningPathSummary,
  WelcomeFlow,
} from "@/components/onboarding/WelcomeFlow";
import { SoundPreview } from "@/components/learning/SoundPreview";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { coursesById } from "@/data/courses";
import { languages } from "@/data/languages";
import { targetLanguages } from "@/data/target-languages";
import { uiCopy } from "@/data/ui-copy";
import type { LessonCheckpoint, UiLanguage } from "@/types/learning";
import type { LearnerProfile } from "@/types/learner-profile";
import {
  learnerProfileChangeEvent,
  learnerProfileKey,
  parseLearnerProfile,
} from "@/lib/learner-profile";
import { createClient } from "@/lib/supabase/client";
import styles from "./spreeda.module.css";

const progressKey = "nihongo-learning-progress";
const languageKey = "spreeda-ui-language";
const languageChangeEvent = "spreeda-language-change";

let sessionLanguage: UiLanguage = "en";

type LessonActivity = {
  courseId: string;
  lessonId: string;
  completedAt: string | null;
  studyDate: string;
  durationSeconds: number | null;
};

type SavedProgress = {
  schemaVersion: 2;
  completed: boolean;
  streak: number;
  lastStudyDate: string | null;
  completedLessonIds: string[];
  activities: LessonActivity[];
  lessonCheckpoint: LessonCheckpoint | null;
};

type DashboardView =
  | "home"
  | "progress"
  | "alphabet"
  | "method"
  | "languages"
  | "settings";

const initialProgress: SavedProgress = {
  schemaVersion: 2,
  completed: false,
  streak: 0,
  lastStudyDate: null,
  completedLessonIds: [],
  activities: [],
  lessonCheckpoint: null,
};

function subscribeToProgress(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("nihongo-progress-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("nihongo-progress-change", onChange);
  };
}

function getProgressSnapshot() {
  try {
    return window.localStorage.getItem(progressKey) ?? "";
  } catch {
    return "storage-error";
  }
}

function getServerProgressSnapshot() {
  return "";
}

function subscribeToLanguage(onChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key !== languageKey) return;
    sessionLanguage = event.newValue === "hi" ? "hi" : "en";
    onChange();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(languageChangeEvent, onChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(languageChangeEvent, onChange);
  };
}

function getLanguageSnapshot(): UiLanguage {
  try {
    const savedLanguage = window.localStorage.getItem(languageKey);
    if (savedLanguage === "en" || savedLanguage === "hi") {
      return savedLanguage;
    }
  } catch {
    return sessionLanguage;
  }

  return sessionLanguage;
}

function getServerLanguageSnapshot(): UiLanguage {
  return "en";
}

function subscribeToLearnerProfile(onChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === learnerProfileKey) onChange();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(learnerProfileChangeEvent, onChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(learnerProfileChangeEvent, onChange);
  };
}

function getLearnerProfileSnapshot() {
  try {
    return window.localStorage.getItem(learnerProfileKey) ?? "";
  } catch {
    return "storage-error";
  }
}

function getServerLearnerProfileSnapshot() {
  return "loading";
}

function isLessonActivity(value: unknown): value is LessonActivity {
  return (
    typeof value === "object" &&
    value !== null &&
    "courseId" in value &&
    typeof value.courseId === "string" &&
    "lessonId" in value &&
    typeof value.lessonId === "string" &&
    "completedAt" in value &&
    (value.completedAt === null ||
      (typeof value.completedAt === "string" &&
        Number.isFinite(Date.parse(value.completedAt)))) &&
    "studyDate" in value &&
    typeof value.studyDate === "string" &&
    "durationSeconds" in value &&
    (value.durationSeconds === null ||
      (typeof value.durationSeconds === "number" &&
        Number.isFinite(value.durationSeconds) &&
        value.durationSeconds >= 0))
  );
}

function isLessonCheckpoint(value: unknown): value is LessonCheckpoint {
  return (
    typeof value === "object" &&
    value !== null &&
    "lessonId" in value &&
    typeof value.lessonId === "string" &&
    "phase" in value &&
    (value.phase === "learn" || value.phase === "quiz") &&
    "questionIndex" in value &&
    typeof value.questionIndex === "number" &&
    Number.isInteger(value.questionIndex) &&
    value.questionIndex >= 0 &&
    "answer" in value &&
    (value.answer === null || typeof value.answer === "string") &&
    "score" in value &&
    typeof value.score === "number" &&
    Number.isInteger(value.score) &&
    value.score >= 0 &&
    "elapsedSeconds" in value &&
    typeof value.elapsedSeconds === "number" &&
    Number.isInteger(value.elapsedSeconds) &&
    value.elapsedSeconds >= 0
  );
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatActivityDay(value: string, language: UiLanguage) {
  const date = new Date(`${value}T12:00:00`);
  const locale = language === "hi" ? "hi-IN" : "en-US";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

function formatActivityDate(value: string, language: UiLanguage) {
  const locale = language === "hi" ? "hi-IN" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function readProgress(saved: string): SavedProgress {
  if (!saved || saved === "storage-error") return initialProgress;

  try {
    const value: unknown = JSON.parse(saved);
    if (
      typeof value === "object" &&
      value !== null &&
      "completed" in value &&
      typeof value.completed === "boolean" &&
      "streak" in value &&
      typeof value.streak === "number" &&
      Number.isFinite(value.streak) &&
      "lastStudyDate" in value &&
      (typeof value.lastStudyDate === "string" ||
        value.lastStudyDate === null)
    ) {
      const completedLessonIds =
        "completedLessonIds" in value &&
        Array.isArray(value.completedLessonIds) &&
        value.completedLessonIds.every(
          (lessonId) => typeof lessonId === "string",
        )
          ? [...new Set(value.completedLessonIds)]
          : [];
      const japaneseDayOneId = coursesById.japanese.lessons[0].id;
      const isLegacyProgress = !("schemaVersion" in value);
      if (
        isLegacyProgress &&
        value.completed &&
        !completedLessonIds.includes(japaneseDayOneId)
      ) {
        completedLessonIds.push(japaneseDayOneId);
      }
      const activities =
        "activities" in value && Array.isArray(value.activities)
          ? value.activities.filter(isLessonActivity).slice(-50)
          : [];
      const lessonCheckpoint =
        "lessonCheckpoint" in value &&
        isLessonCheckpoint(value.lessonCheckpoint) &&
        !completedLessonIds.includes(value.lessonCheckpoint.lessonId)
          ? value.lessonCheckpoint
          : null;
      if (
        activities.length === 0 &&
        value.completed &&
        value.lastStudyDate !== null &&
        /^\d{4}-\d{2}-\d{2}$/.test(value.lastStudyDate) &&
        localDateKey(new Date(`${value.lastStudyDate}T12:00:00`)) ===
          value.lastStudyDate
      ) {
        activities.push({
          courseId: coursesById.japanese.id,
          lessonId: japaneseDayOneId,
          completedAt: null,
          studyDate: value.lastStudyDate,
          durationSeconds: null,
        });
      }

      return {
        schemaVersion: 2,
        completed: completedLessonIds.includes(japaneseDayOneId),
        streak: value.streak,
        lastStudyDate: value.lastStudyDate,
        completedLessonIds,
        activities,
        lessonCheckpoint,
      };
    }
  } catch {
    return initialProgress;
  }

  return initialProgress;
}

export default function HomePage() {
  const progressSnapshot = useSyncExternalStore(
    subscribeToProgress,
    getProgressSnapshot,
    getServerProgressSnapshot,
  );
  const [sessionProgress, setSessionProgress] =
    useState<SavedProgress | null>(null);
  const progress = sessionProgress ?? readProgress(progressSnapshot);
  const learnerProfileSnapshot = useSyncExternalStore(
    subscribeToLearnerProfile,
    getLearnerProfileSnapshot,
    getServerLearnerProfileSnapshot,
  );
  const savedProfile = parseLearnerProfile(learnerProfileSnapshot);
  const [sessionProfile, setSessionProfile] =
    useState<LearnerProfile | null>(null);
  const learnerProfile = sessionProfile ?? savedProfile;
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPathSummary, setShowPathSummary] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>("home");
  const [profileSaveError, setProfileSaveError] = useState(false);
  const targetCode = learnerProfile?.targetLanguageCode ?? "ja";
  const activeCourseId = targetCode === "ja" ? "japanese" : targetCode;
  const activeCourse = coursesById[activeCourseId] ?? coursesById.japanese;
  const checkpointLesson = activeCourse.lessons.find(
    (lesson) => lesson.id === progress.lessonCheckpoint?.lessonId,
  );
  const nextUncompletedLesson = activeCourse.lessons.find(
    (lesson) => !progress.completedLessonIds.includes(lesson.id),
  );
  const activeLesson =
    checkpointLesson ??
    nextUncompletedLesson ??
    activeCourse.lessons[activeCourse.lessons.length - 1];
  const targetLanguage = languages[activeCourse.targetLanguageCode];

  useEffect(() => {
    let cancelled = false;
    const dbNames: Record<string, string> = {
      ja: "japanese",
      es: "spanish",
      fr: "french",
      de: "german",
      en: "english",
      ko: "korean",
      zh: "chinese",
    };
    const dbLanguage =
      dbNames[activeCourse.targetLanguageCode] ?? activeCourse.targetLanguageCode;

    async function restoreFromSupabase() {
      try {
        const supabase = createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user || cancelled) return;
        const { data: row } = await supabase
          .from("streaks")
          .select("unlocked_day")
          .eq("user_id", auth.user.id)
          .eq("language", dbLanguage)
          .maybeSingle();
        if (!row || cancelled) return;

        const unlockedDay = Number(row.unlocked_day) || 1;
        const restoredIds = activeCourse.lessons
          .filter((lesson) => lesson.sequence < unlockedDay)
          .map((lesson) => lesson.id);
        const current = readProgress(window.localStorage.getItem(progressKey) ?? "");
        const merged = [...new Set([...current.completedLessonIds, ...restoredIds])];
        if (merged.length === current.completedLessonIds.length) return;

        const nextProgress: SavedProgress = {
          ...current,
          completedLessonIds: merged,
          completed: merged.includes(coursesById.japanese.lessons[0].id),
        };
        setSessionProgress(nextProgress);
        window.localStorage.setItem(progressKey, JSON.stringify(nextProgress));
        window.dispatchEvent(new Event("nihongo-progress-change"));
      } catch {
        // restore fail ho to local progress hi chalta rahe
      }
    }

    void restoreFromSupabase();
    return () => {
      cancelled = true;
    };
  }, [activeCourse]);
  const storedLanguage = useSyncExternalStore(
    subscribeToLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const language = learnerProfile?.uiLanguage ?? storedLanguage;
  const [languageSaveError, setLanguageSaveError] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "error" | null>(null);
  const t = uiCopy[language];
  const lessonToPlay =
    activeCourse.lessons.find((lesson) => lesson.id === openLessonId) ??
    activeLesson;

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function changeLanguage(nextLanguage: UiLanguage) {
    sessionLanguage = nextLanguage;
    setLanguageSaveError(false);
    if (learnerProfile) {
      const updatedProfile = {
        ...learnerProfile,
        uiLanguage: nextLanguage,
      };
      setSessionProfile(updatedProfile);
      try {
        window.localStorage.setItem(
          learnerProfileKey,
          JSON.stringify(updatedProfile),
        );
        window.dispatchEvent(new Event(learnerProfileChangeEvent));
        setSessionProfile(null);
        setProfileSaveError(false);
      } catch {
        setSessionProfile(updatedProfile);
        setProfileSaveError(true);
      }
    }
    try {
      window.localStorage.setItem(languageKey, nextLanguage);
    } catch {
      setLanguageSaveError(true);
    }
    window.dispatchEvent(new Event(languageChangeEvent));
  }

  function completeSetup(profile: LearnerProfile) {
    setShowWelcome(false);
    setShowPathSummary(true);
    sessionLanguage = profile.uiLanguage;
    let profileSaved = true;
    let languageSaved = true;
    try {
      window.localStorage.setItem(learnerProfileKey, JSON.stringify(profile));
      window.dispatchEvent(new Event(learnerProfileChangeEvent));
    } catch {
      profileSaved = false;
    }
    try {
      window.localStorage.setItem(languageKey, profile.uiLanguage);
      window.dispatchEvent(new Event(languageChangeEvent));
    } catch {
      languageSaved = false;
    }
    setSessionProfile(profileSaved ? null : profile);
    const saved = profileSaved && languageSaved;
    setProfileSaveError(!saved);
    return saved;
  }

  function changeCourse(targetLanguageCode: string) {
    if (!learnerProfile) return;
    const updatedProfile = { ...learnerProfile, targetLanguageCode };
    setSessionProfile(updatedProfile);
    try {
      window.localStorage.setItem(
        learnerProfileKey,
        JSON.stringify(updatedProfile),
      );
      window.dispatchEvent(new Event(learnerProfileChangeEvent));
      setSessionProfile(null);
      setProfileSaveError(false);
    } catch {
      setProfileSaveError(true);
    }
  }

  function completeLesson(score: number, durationSeconds: number) {
    const now = new Date();
    const today = localDateKey(now);
    const previousDate = progress.lastStudyDate;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const percent = Math.round((score / lessonToPlay.questions.length) * 100);
    const passed = percent >= 80;

    const nextStreak = !passed
      ? progress.streak
      : previousDate === today
        ? progress.streak
        : previousDate === localDateKey(yesterday)
          ? progress.streak + 1
          : 1;
    const completedLessonIds = passed
      ? [...new Set([...progress.completedLessonIds, lessonToPlay.id])]
      : progress.completedLessonIds;
    const nextProgress: SavedProgress = {
      schemaVersion: 2,
      completed: completedLessonIds.includes(coursesById.japanese.lessons[0].id),
      streak: nextStreak,
      lastStudyDate: passed ? today : progress.lastStudyDate,
      completedLessonIds,
      lessonCheckpoint: null,
      activities: [
        ...progress.activities,
        {
          courseId: activeCourse.id,
          lessonId: lessonToPlay.id,
          completedAt: now.toISOString(),
          studyDate: today,
          durationSeconds: Math.max(0, Math.floor(durationSeconds)),
        },
      ].slice(-50),
    };

    setSessionProgress(nextProgress);
    try {
      window.localStorage.setItem(progressKey, JSON.stringify(nextProgress));
      window.dispatchEvent(new Event("nihongo-progress-change"));
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }

    if (passed) {
      const dbLanguage =
        (
          {
            ja: "japanese",
            es: "spanish",
            fr: "french",
            de: "german",
            en: "english",
            ko: "korean",
            zh: "chinese",
          } as Record<string, string>
        )[activeCourse.targetLanguageCode] ?? activeCourse.targetLanguageCode;
      const supabase = createClient();
      void supabase
        .rpc("complete_lesson", {
          p_language: dbLanguage,
          p_day: lessonToPlay.sequence,
          p_score: percent,
          p_tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
        })
        .then(({ data, error }) => {
          if (error) {
            console.warn("Supabase sync:", error.message);
            return;
          }
          const row = Array.isArray(data) ? data[0] : data;
          if (
            !row ||
            typeof row.current_streak !== "number" ||
            typeof row.last_active_day !== "string"
          )
            return;
          try {
            const latest = readProgress(
              window.localStorage.getItem(progressKey) ?? "",
            );
            const synced: SavedProgress = {
              ...latest,
              streak: row.current_streak,
              lastStudyDate: row.last_active_day,
            };
            setSessionProgress(synced);
            window.localStorage.setItem(progressKey, JSON.stringify(synced));
            window.dispatchEvent(new Event("nihongo-progress-change"));
          } catch {
            // local progress hi chalta rahe
          }
        });
    }
  }

  function saveLessonCheckpoint(checkpoint: LessonCheckpoint) {
    const nextProgress = { ...progress, lessonCheckpoint: checkpoint };
    setSessionProgress(nextProgress);
    try {
      window.localStorage.setItem(progressKey, JSON.stringify(nextProgress));
      window.dispatchEvent(new Event("nihongo-progress-change"));
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }

  if (learnerProfileSnapshot === "loading") {
    return (
      <main className={styles.boot} aria-busy="true">
        <span className={styles.bootMark}>S</span>
      </main>
    );
  }

  if (showWelcome || !learnerProfile) {
    return (
      <WelcomeFlow
        language={language}
        initialProfile={learnerProfile}
        onLanguageChange={changeLanguage}
        onComplete={completeSetup}
      />
    );
  }

  if (showPathSummary && learnerProfile) {
    return (
      <LearningPathSummary
        language={language}
        profile={learnerProfile}
        saveError={profileSaveError}
        onLanguageChange={changeLanguage}
        onContinue={() => setShowPathSummary(false)}
        onEdit={() => {
          setShowPathSummary(false);
          setShowWelcome(true);
        }}
      />
    );
  }

  const selectedCourse = targetLanguages.find(
    (option) => option.code === learnerProfile.targetLanguageCode,
  );
  const selectedCourseName =
    selectedCourse?.title[language] ?? learnerProfile.targetLanguageCode;
  const availableLessons = activeCourse.lessons.length;
  const plannedLessons = Math.max(0, 30 - availableLessons);
  const completedAvailableLessons = activeCourse.lessons.filter((lesson) =>
    progress.completedLessonIds.includes(lesson.id),
  ).length;
  const completedLessons = completedAvailableLessons;
  const completedDays = Math.min(completedLessons, 30);
  const courseCompleted = completedAvailableLessons === availableLessons;
  const today = localDateKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const currentStreak =
    progress.lastStudyDate === today ||
    progress.lastStudyDate === localDateKey(yesterday)
      ? progress.streak
      : 0;
  const studySecondsToday = progress.activities
    .filter((activity) => activity.studyDate === today)
    .reduce(
      (total, activity) => total + (activity.durationSeconds ?? 0),
      0,
    );
  const dailyGoalSeconds = learnerProfile.dailyMinutes * 60;
  const dailyGoalPercent = Math.min(
    100,
    (studySecondsToday / dailyGoalSeconds) * 100,
  );
  const locale = language === "hi" ? "hi-IN" : "en-US";
  const numberFormat = new Intl.NumberFormat(locale);
  const completedMinutesToday = Math.floor(studySecondsToday / 60);
  const completedMinutesLabel =
    studySecondsToday > 0 && completedMinutesToday === 0
      ? t.lessThanMinute
      : numberFormat.format(completedMinutesToday);
  const dailyGoalLabel = t.dailyGoalProgress
    .replace("{completed}", completedMinutesLabel)
    .replace("{goal}", numberFormat.format(learnerProfile.dailyMinutes));
  const recentActivities = [...progress.activities].reverse().slice(0, 5);
  const navigationItems: {
    id: DashboardView;
    label: string;
    icon: string;
  }[] = [
    { id: "home", label: t.home, icon: "⌂" },
    { id: "progress", label: t.progress, icon: "◷" },
    { id: "alphabet", label: t.alphabet, icon: "◉" },
    { id: "method", label: t.method, icon: "↗" },
    { id: "languages", label: t.exploreLanguages, icon: "◎" },
    { id: "settings", label: t.settings, icon: "⚙" },
  ];
  const viewTitle = {
    home: t.home,
    progress: t.progress,
    alphabet: t.alphabet,
    method: t.method,
    languages: t.exploreLanguages,
    settings: t.settings,
  }[activeView];

  return (
    <main className={styles.shell} lang={language}>
      <aside className={styles.sidebar}>
        <div className={styles.brandBlock}>
          <a
            className={styles.brand}
            href="#home"
            aria-label={t.brandLabel}
            onClick={() => setActiveView("home")}
          >
            <span className={styles.brandMark} aria-hidden="true">
              S
            </span>
            <span>Spreeda</span>
          </a>
          <p className={styles.brandTagline}>{t.sidebarFooter}</p>
        </div>

        <p className={styles.navLabel}>{t.navSection}</p>
        <nav className={styles.nav} aria-label={t.navigation}>
          {navigationItems.map((item) => (
            <button
              type="button"
              className={`${styles.navLink} ${
                activeView === item.id ? styles.navActive : ""
              }`}
              key={item.id}
              onClick={() => setActiveView(item.id)}
              aria-current={activeView === item.id ? "page" : undefined}
            >
              <span aria-hidden="true">{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarNote}>
          <span className={styles.noteMark} aria-hidden="true">
            ✳
          </span>
          <p>{t.sidebarNote}</p>
        </div>
      </aside>

      <div className={styles.workspace} id="home">
        <header className={styles.topbar}>
          <p>
            {t.breadcrumb} <span aria-hidden="true">/</span> {viewTitle}
          </p>
          <div className={styles.topbarActions}>
            <div className={styles.languageControl}>
              <span className={styles.languageLabel}>{t.language}</span>
              <div
                className={styles.languageSwitch}
                role="group"
                aria-label={t.language}
              >
                <button
                  type="button"
                  aria-pressed={language === "en"}
                  onClick={() => changeLanguage("en")}
                >
                  EN
                </button>
                <button
                  type="button"
                  aria-pressed={language === "hi"}
                  onClick={() => changeLanguage("hi")}
                >
                  हिंदी
                </button>
              </div>
            </div>
            <AccountMenu language={language} />
            <ThemeToggle language={language} />
          </div>
          {languageSaveError && (
            <p className={styles.settingsError} role="status">
              {t.languageSaveError}
            </p>
          )}
        </header>

        <div className={styles.content}>
          {profileSaveError && (
            <p className={styles.saveMessage} role="status">
              {t.profileSaveError}
            </p>
          )}
          {activeView === "home" && (
            <>
          <section className={styles.welcome} aria-labelledby="welcome-title">
            <div>
              <p className={styles.dateLabel}>{t.welcomeEyebrow}</p>
              <span className={styles.courseBadge}>
                {activeCourse.title[language]} · {t.courseLevel}
              </span>
              <h1 id="welcome-title">{t.welcomeTitle}</h1>
              <p className={styles.welcomeText}>{t.welcomeDescription}</p>
            </div>
            <div className={styles.welcomeArtwork} aria-hidden="true">
              <span className={styles.artQuote}>“</span>
              <span className={styles.artRing} />
              <span className={styles.artSpark}>✳</span>
              <span className={styles.artBubble} />
            </div>
          </section>

          <section
            className={styles.summaryStats}
            aria-label={t.progressIndicators}
          >
            <div className={styles.summaryStat}>
              <span className={styles.statIcon} aria-hidden="true">↗</span>
              <div>
                <span className={styles.statLabel}>{t.streakLabel}</span>
                <strong>
                  {numberFormat.format(currentStreak)}{" "}
                  {currentStreak === 1
                    ? t.streakDaySingular
                    : t.streakDayPlural}
                </strong>
              </div>
            </div>
            <div className={styles.summaryStat}>
              <span className={styles.statIcon} aria-hidden="true">◷</span>
              <div>
                <span className={styles.statLabel}>{t.overallProgress}</span>
                <strong>
                  {numberFormat.format(completedDays)} / 30 {t.dayUnit}
                </strong>
              </div>
            </div>
            <div className={styles.summaryStat}>
              <span className={styles.statIcon} aria-hidden="true">◔</span>
              <div>
                <span className={styles.statLabel}>{t.dailyGoal}</span>
                <strong>{dailyGoalLabel}</strong>
              </div>
            </div>
          </section>

          <section
            className={styles.activeLearning}
            aria-label={activeCourse.title[language]}
          >
            <section className={styles.lessonCard} aria-labelledby="today-title">
              <div className={styles.lessonCardTop}>
                <span className={styles.dayTag}>
                  {t.dayLabel.replaceAll(
                    "{day}",
                    String(activeLesson.sequence).padStart(2, "0"),
                  )}
                </span>
                <span className={styles.timeTag}>
                  {t.estimatedDuration.replace(
                    "{minutes}",
                    String(activeLesson.estimatedMinutes),
                  )}
                </span>
              </div>
              <div className={styles.lessonCardBody}>
                <div className={styles.lessonText}>
                  <p className={styles.sectionEyebrow}>{t.todayLesson}</p>
                  <span className={styles.courseBadge}>
                    {activeCourse.title[language]} · {t.activeCourse}
                  </span>
                  <h2 id="today-title">{activeLesson.title[language]}</h2>
                  <p>{activeLesson.description[language]}</p>
                  {activeLesson.mission && (
                    <p className={styles.missionHint}>
                      <strong>{t.missionLabel}</strong>{" "}
                      {activeLesson.mission[language]}
                    </p>
                  )}
                  <button
                    type="button"
                    className={styles.startButton}
                    onClick={() => {
                      setOpenLessonId(activeLesson.id);
                      setLessonOpen(true);
                    }}
                  >
                    {courseCompleted ? t.practiceAgain : t.continueLearning}
                    <span aria-hidden="true">→</span>
                  </button>
                  {(saveStatus || progressSnapshot === "storage-error") && (
                    <p className={styles.saveMessage} role="status">
                      {saveStatus === "saved"
                        ? t.saved
                        : saveStatus === "error" ||
                            progressSnapshot === "storage-error"
                          ? t.saveError
                          : null}
                    </p>
                  )}
                </div>
                <div className={styles.lessonArt} aria-hidden="true">
                  <span lang={targetLanguage.code}>
                    {targetLanguage.nativeName}
                  </span>
                  <small>{targetLanguage.script}</small>
                </div>
              </div>
              <div className={styles.lessonCardFooter}>
                <span>
                  <span className={styles.statusDot} aria-hidden="true" />
                  {courseCompleted ? t.completed : t.nextStep}
                </span>
                <span>
                  {t.availableCompletionProgress
                    .replace(
                      "{completed}",
                      numberFormat.format(completedAvailableLessons),
                    )
                    .replace("{total}", numberFormat.format(availableLessons))}
                </span>
              </div>
            </section>

          </section>
            </>
          )}

          {activeView === "progress" && (
            <>
          <section className={styles.viewIntro}>
            <p className={styles.sectionEyebrow}>{t.dayPathEyebrow}</p>
            <h1>{t.progress}</h1>
            <p>{t.progressPageDescription}</p>
          </section>
          <div className={styles.insightGrid}>
            <section
              className={styles.dailyGoal}
              aria-labelledby="daily-goal-title"
            >
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.sectionEyebrow}>{t.progressEyebrow}</p>
                  <h2 id="daily-goal-title">{t.dailyGoal}</h2>
                </div>
                <strong className={styles.dailyGoalLabel}>
                  {dailyGoalLabel}
                </strong>
              </div>
              <div
                className={styles.dailyGoalTrack}
                role="progressbar"
                aria-label={t.dailyGoal}
                aria-valuenow={Math.min(studySecondsToday, dailyGoalSeconds)}
                aria-valuemin={0}
                aria-valuemax={dailyGoalSeconds}
              >
                <span style={{ width: `${dailyGoalPercent}%` }} />
              </div>
              <p className={styles.dailyGoalNote}>{t.dailyGoalDescription}</p>
            </section>

            <section
              className={styles.progressSection}
              aria-labelledby="path-title"
            >
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.sectionEyebrow}>{t.dayPathEyebrow}</p>
                  <h2 id="path-title">{t.dayPathTitle}</h2>
                </div>
                <span className={styles.pathCount}>
                  {numberFormat.format(completedDays)} / 30 {t.dayUnit}
                </span>
              </div>
              <div className={styles.progressStats}>
                <div className={styles.progressStat}>
                  <strong>{numberFormat.format(completedLessons)}</strong>
                  <span>{t.lessonsCompleted}</span>
                </div>
                <div className={styles.progressStat}>
                  <strong>{numberFormat.format(availableLessons)}</strong>
                  <span>{t.availableLessons}</span>
                </div>
                <div className={styles.progressStat}>
                  <strong>{numberFormat.format(plannedLessons)}</strong>
                  <span>{t.plannedLessons}</span>
                </div>
              </div>
              <p className={styles.progressNote}>{t.progressNote}</p>
              <DayPath
                total={30}
                completed={completedDays}
                label={`${numberFormat.format(completedDays)} / 30 ${t.dayUnit}; ${numberFormat.format(availableLessons)} ${t.availableLessons}; ${numberFormat.format(plannedLessons)} ${t.plannedLessons}`}
              />
              <div className={styles.pathWeeks}>
                <span>{t.pathStageKana}</span>
                <span>{t.pathStageEveryday}</span>
                <span>{t.pathStageConversation}</span>
                <span>{t.pathStageTravel}</span>
              </div>
            </section>
          </div>
            </>
          )}

          {activeView === "alphabet" && (
            <section className={styles.focusPage} aria-labelledby="alphabet-title">
              <div className={styles.viewIntro}>
                <p className={styles.sectionEyebrow}>{t.kanaEyebrow}</p>
                <h1 id="alphabet-title">{t.kanaTitle}</h1>
                <p>{t.soundPreviewDescription}</p>
              </div>
              <SoundPreview
                items={activeLesson.items}
                language={language}
                targetLanguageCode={targetLanguage.code}
                speechLocale={targetLanguage.speechLocale}
              />
              <p className={styles.progressNote}>{t.progressNote}</p>
              <button
                type="button"
                className={styles.startButton}
                onClick={() => {
                  setOpenLessonId(activeLesson.id);
                  setLessonOpen(true);
                }}
              >
                {t.continueLearning}
                <span aria-hidden="true">→</span>
              </button>
            </section>
          )}

          {(activeView === "method" || activeView === "progress") && (
          <div className={styles.practiceGrid}>
            {activeView === "method" && (
            <section className={styles.methodCard} id="method">
              <div className={styles.viewIntro}>
                <p className={styles.sectionEyebrow}>{t.methodEyebrow}</p>
                <h1>{t.methodTitle}</h1>
              </div>
              <p className={styles.methodSequence}>{t.methodSequence}</p>
              <div className={styles.methodSteps}>
                <div className={styles.methodStep}>
                  <span aria-hidden="true">◉</span>
                  <p>
                    <strong>{t.stepListen}</strong> — {t.stepListenDescription}
                  </p>
                </div>
                <div className={styles.methodStep}>
                  <span aria-hidden="true">↗</span>
                  <p>
                    <strong>{t.stepSpeak}</strong> — {t.stepSpeakDescription}
                  </p>
                </div>
                <div className={styles.methodStep}>
                  <span aria-hidden="true">◎</span>
                  <p>
                    <strong>{t.stepRecall}</strong> — {t.stepRecallDescription}
                  </p>
                </div>
              </div>
            </section>
            )}

            {activeView === "progress" && (
            <section
              className={styles.activitySection}
              aria-labelledby="activity-title"
            >
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.sectionEyebrow}>{t.progressEyebrow}</p>
                  <h2 id="activity-title">{t.recentActivity}</h2>
                </div>
              </div>
              {recentActivities.length === 0 ? (
                <div className={styles.activityEmpty}>
                  <span aria-hidden="true">◷</span>
                  <div>
                    <strong>{t.recentEmptyTitle}</strong>
                    <p>{t.recentEmptyDescription}</p>
                  </div>
                </div>
              ) : (
                <ol className={styles.activityList}>
                  {recentActivities.map((activity, index) => {
                    const activityMinutes = Math.floor(
                      (activity.durationSeconds ?? 0) / 60,
                    );
                    const duration =
                      activity.durationSeconds === null
                        ? null
                        : activity.durationSeconds > 0 && activityMinutes === 0
                          ? t.lessThanMinute
                          : numberFormat.format(activityMinutes);
                    const activityTitle =
                      coursesById[activity.courseId]?.lessons.find(
                        (lesson) => lesson.id === activity.lessonId,
                      )?.title[language] ?? activity.lessonId;
                    const activityDate = activity.completedAt
                      ? formatActivityDate(activity.completedAt, language)
                      : formatActivityDay(activity.studyDate, language);

                    return (
                      <li
                        className={styles.activityItem}
                        key={`${activity.completedAt}-${index}`}
                      >
                        <span className={styles.activityMark} aria-hidden="true">
                          ✓
                        </span>
                        <div className={styles.activityDescription}>
                          <strong>{activityTitle}</strong>
                          <span>{activityDate}</span>
                        </div>
                        <span className={styles.activityDuration}>
                          {duration === null
                            ? t.activityCompleted
                            : t.activityDuration
                                .replace("{duration}", duration)
                                .replace("{unit}", t.minuteShort)}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
            )}
          </div>
          )}

          {activeView === "languages" && (
          <section
            className={styles.exploreSection}
            id="languages"
            aria-labelledby="explore-title"
          >
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.sectionEyebrow}>{t.footerBrand}</p>
                <h1 id="explore-title">{t.exploreLanguages}</h1>
              </div>
              <p className={styles.exploreDescription}>
                {t.exploreLanguagesDescription}
              </p>
            </div>
            <div className={styles.languageGrid}>
              {targetLanguages.map((option) => {
                const isSelected =
                  option.code === activeCourse.targetLanguageCode;
                return (
                  <article className={styles.languageCard} key={option.code}>
                    <div className={styles.languageCardTop}>
                      <span className={styles.languageIcon} lang={option.code}>
                        {option.nativeName}
                      </span>
                      <span
                        className={
                          isSelected
                            ? styles.languageActive
                            : styles.languageAvailable
                        }
                      >
                        {isSelected ? t.activeCourse : t.availableCourse}
                      </span>
                    </div>
                    <h3>{option.title[language]}</h3>
                    <button
                      type="button"
                      className={styles.languageAction}
                      onClick={() => {
                        changeCourse(option.code);
                        setActiveView("home");
                      }}
                    >
                      {isSelected ? t.continueLearning : t.chooseCourse}
                      <span aria-hidden="true">→</span>
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
          )}

          {activeView === "settings" && (
            <section className={styles.settingsPage} aria-labelledby="settings-title">
              <div className={styles.viewIntro}>
                <p className={styles.sectionEyebrow}>{t.settingsHeading}</p>
                <h1 id="settings-title">{t.settings}</h1>
                <p>{t.settingsDescription}</p>
              </div>
              <div className={styles.settingsCard}>
                <div>
                  <p className={styles.sectionEyebrow}>{t.activeCourse}</p>
                  <h2>{selectedCourseName}</h2>
                  <p>
                    {t.dailyGoal}:{" "}
                    {numberFormat.format(learnerProfile.dailyMinutes)}{" "}
                    {t.minuteShort}
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.profileButton}
                  onClick={() => setShowWelcome(true)}
                >
                  {t.editPath}
                </button>
              </div>
              <p className={styles.progressNote}>{t.localProgress}</p>
            </section>
          )}
          <footer className={styles.footer}>
            <span>{t.footerBrand}</span>
            <span>{t.footerNote}</span>
          </footer>
        </div>
      </div>

      {lessonOpen && (
        <LessonPlayer
          lesson={lessonToPlay}
          language={language}
          targetLanguageCode={targetLanguage.code}
          speechLocale={targetLanguage.speechLocale}
          currentStreak={currentStreak}
          initialCheckpoint={
            progress.lessonCheckpoint?.lessonId === lessonToPlay.id
              ? progress.lessonCheckpoint
              : null
          }
          onComplete={completeLesson}
          onCheckpoint={saveLessonCheckpoint}
          onClose={() => {
            setLessonOpen(false);
            setOpenLessonId(null);
          }}
        />
      )}
    </main>
  );
}