"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { onboardingCopy } from "@/features/onboarding/data/onboarding-copy";
import { targetLanguages } from "@/features/onboarding/data/target-languages";
import type {
  LearnerProfile,
  LearningGoal,
  PracticeMode,
  ProficiencyLevel,
} from "@/features/profile/types/learner-profile";
import type { UiLanguage } from "@/features/learning/types/learning";
import styles from "./WelcomeFlow.module.css";

type Props = {
  language: UiLanguage;
  initialProfile: LearnerProfile | null;
  onLanguageChange: (language: UiLanguage) => void;
  onComplete: (profile: LearnerProfile) => boolean;
};

type ComingSoonProps = {
  language: UiLanguage;
  targetLanguageCode: string;
  saveError: boolean;
  onLanguageChange: (language: UiLanguage) => void;
  onPreviewJapanese: () => void;
  onEditSetup: () => void;
};

type SummaryProps = {
  language: UiLanguage;
  profile: LearnerProfile;
  saveError: boolean;
  onLanguageChange: (language: UiLanguage) => void;
  onContinue: () => void;
  onEdit: () => void;
};

const practiceModes: PracticeMode[] = ["listen", "speak", "read", "write"];

function createDefaultProfile(language: UiLanguage): LearnerProfile {
  return {
    schemaVersion: 1,
    uiLanguage: language,
    knownLanguages: [],
    otherKnownLanguage: "",
    targetLanguageCode: "ja",
    proficiency: "new",
    goal: "everyday",
    dailyMinutes: 40,
    practiceModes,
  };
}

export function WelcomeFlow({
  language,
  initialProfile,
  onLanguageChange,
  onComplete,
}: Props) {
  const [step, setStep] = useState(() => (initialProfile ? 1 : 0));
  const [profile, setProfile] = useState(
    () => initialProfile ?? createDefaultProfile(language),
  );
  const [saveError, setSaveError] = useState(false);
  const t = onboardingCopy[language];

  function updateProfile<K extends keyof LearnerProfile>(
    key: K,
    value: LearnerProfile[K],
  ) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function toggleKnownLanguage(value: string) {
    const knownLanguages = profile.knownLanguages.includes(value)
      ? profile.knownLanguages.filter((languageCode) => languageCode !== value)
      : [...profile.knownLanguages, value];
    updateProfile("knownLanguages", knownLanguages);
  }

  function togglePracticeMode(mode: PracticeMode) {
    const nextModes = profile.practiceModes.includes(mode)
      ? profile.practiceModes.filter((currentMode) => currentMode !== mode)
      : [...profile.practiceModes, mode];
    updateProfile("practiceModes", nextModes);
  }

  function finishSetup() {
    setSaveError(!onComplete(profile));
  }

  const proficiencyOptions: {
    id: ProficiencyLevel;
    title: string;
    description: string;
  }[] = [
    { id: "new", title: t.levelNew, description: t.levelNewDescription },
    {
      id: "beginner",
      title: t.levelBeginner,
      description: t.levelBeginnerDescription,
    },
    {
      id: "intermediate",
      title: t.levelIntermediate,
      description: t.levelIntermediateDescription,
    },
  ];

  const goalOptions: { id: LearningGoal; label: string }[] = [
    { id: "everyday", label: t.goalEveryday },
    { id: "travel", label: t.goalTravel },
    { id: "work", label: t.goalWork },
    { id: "study", label: t.goalStudy },
    { id: "culture", label: t.goalCulture },
    { id: "personal", label: t.goalPersonal },
  ];

  const modeLabels: Record<PracticeMode, string> = {
    listen: t.modeListen,
    speak: t.modeSpeak,
    read: t.modeRead,
    write: t.modeWrite,
  };

  return (
    <main className={styles.page} lang={language}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link className={styles.brand} href="/" aria-label={t.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              S
            </span>
            <span>{t.brand}</span>
          </Link>
          <div className={styles.headerActions}>
            <ThemeToggle language={language} />
            <div className={styles.languageControl}>
              <span>{t.language}</span>
              <div className={styles.languageSwitch} role="group" aria-label={t.language}>
                <button
                  type="button"
                  aria-pressed={language === "en"}
                  onClick={() => {
                    updateProfile("uiLanguage", "en");
                    onLanguageChange("en");
                  }}
                >
                  EN
                </button>
                <button
                  type="button"
                  aria-pressed={language === "hi"}
                  onClick={() => {
                    updateProfile("uiLanguage", "hi");
                    onLanguageChange("hi");
                  }}
                >
                  हिंदी
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.layout}>
          <section className={styles.visualPanel}>
            <p className={styles.eyebrow}>{t.welcomeEyebrow}</p>
            <h1>{t.welcomeTitle}</h1>
            <p className={styles.visualNote}>{t.welcomeNote}</p>
            <div className={styles.wordOrbit} aria-hidden="true">
              <span className={styles.wordTop}>Hello</span>
              <span className={styles.wordRight}>Hola</span>
              <span className={styles.wordBottom}>नमस्ते</span>
              <span className={styles.wordLeft}>Bonjour</span>
              <span className={styles.orbitMark}>S</span>
            </div>
            <div className={styles.visualFooter}>
              <span>01</span>
              <span>{t.visualFooter}</span>
            </div>
          </section>

          <section className={styles.formPanel} aria-live="polite">
            {step === 0 ? (
              <div className={styles.introPanel}>
                <span className={styles.stepPill}>{t.introLabel}</span>
                <p className={styles.introText}>{t.welcomeDescription}</p>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => setStep(1)}
                >
                  {t.start} <span aria-hidden="true">→</span>
                </button>
                <p className={styles.localNote}>{t.localOnly}</p>
              </div>
            ) : (
              <>
                <div className={styles.stepHeader}>
                  <span className={styles.stepCount}>
                    {t.step} 0{step} {t.of} 04
                  </span>
                  <div className={styles.stepTrack} aria-hidden="true">
                    <span style={{ width: `${(step / 4) * 100}%` }} />
                  </div>
                </div>

                {step === 1 && (
                  <div>
                    <h2>{t.targetTitle}</h2>
                    <p className={styles.description}>{t.targetDescription}</p>
                    <div className={styles.languageGrid}>
                      {targetLanguages.map((option) => (
                        <button
                          type="button"
                          key={option.code}
                          className={`${styles.languageCard} ${
                            profile.targetLanguageCode === option.code
                              ? styles.selected
                              : ""
                          }`}
                          aria-pressed={profile.targetLanguageCode === option.code}
                          onClick={() =>
                            updateProfile("targetLanguageCode", option.code)
                          }
                        >
                          <span className={styles.languageNative} lang={option.code}>
                            {option.nativeName}
                          </span>
                          <span className={styles.languageName}>
                            {option.title[language]}
                          </span>
                          <span
                            className={
                              option.availability === "available"
                                ? styles.available
                                : styles.comingSoon
                            }
                          >
                            {option.availability === "available"
                              ? t.availableNow
                              : t.comingSoon}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2>{t.knownLanguageTitle}</h2>
                    <p className={styles.description}>
                      {t.knownLanguageDescription}
                    </p>
                    <div className={styles.choiceGrid}>
                      {[
                        { id: "en", label: t.knownEnglish },
                        { id: "hi", label: t.knownHindi },
                      ].map((option) => (
                        <button
                          type="button"
                          key={option.id}
                          className={`${styles.choiceCard} ${
                            profile.knownLanguages.includes(option.id)
                              ? styles.selected
                              : ""
                          }`}
                          aria-pressed={profile.knownLanguages.includes(option.id)}
                          onClick={() => toggleKnownLanguage(option.id)}
                        >
                          <span aria-hidden="true">
                            {profile.knownLanguages.includes(option.id) ? "✓" : "+"}
                          </span>
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <label className={styles.fieldLabel} htmlFor="other-language">
                      {t.knownOther}
                    </label>
                    <input
                      id="other-language"
                      className={styles.textInput}
                      value={profile.otherKnownLanguage}
                      placeholder={t.otherPlaceholder}
                      onChange={(event) =>
                        updateProfile("otherKnownLanguage", event.target.value)
                      }
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className={styles.preferencesStep}>
                    <div>
                      <h2>{t.levelTitle}</h2>
                      <p className={styles.description}>{t.levelDescription}</p>
                      <div className={styles.levelGrid}>
                        {proficiencyOptions.map((option) => (
                          <button
                            type="button"
                            key={option.id}
                            className={`${styles.levelCard} ${
                              profile.proficiency === option.id
                                ? styles.selected
                                : ""
                            }`}
                            aria-pressed={profile.proficiency === option.id}
                            onClick={() => updateProfile("proficiency", option.id)}
                          >
                            <strong>{option.title}</strong>
                            <span>{option.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h2 className={styles.subheading}>{t.goalTitle}</h2>
                      <p className={styles.description}>{t.goalDescription}</p>
                      <div className={styles.goalGrid}>
                        {goalOptions.map((option) => (
                          <button
                            type="button"
                            key={option.id}
                            className={`${styles.goalChip} ${
                              profile.goal === option.id ? styles.goalSelected : ""
                            }`}
                            aria-pressed={profile.goal === option.id}
                            onClick={() => updateProfile("goal", option.id)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className={styles.preferencesStep}>
                    <div>
                      <h2>{t.timeTitle}</h2>
                      <div className={styles.timeGrid}>
                        {([20, 30, 40, 45, 60] as const).map((minutes) => (
                          <button
                            type="button"
                            key={minutes}
                            className={`${styles.timeCard} ${
                              profile.dailyMinutes === minutes
                                ? styles.selected
                                : ""
                            }`}
                            aria-pressed={profile.dailyMinutes === minutes}
                            onClick={() => updateProfile("dailyMinutes", minutes)}
                          >
                            <strong>{minutes}</strong>
                            <span>{t.minutes}</span>
                          </button>
                        ))}
                      </div>
                      <p className={styles.description}>{t.routineDescription}</p>
                    </div>
                    <div>
                      <h2 className={styles.subheading}>{t.modeTitle}</h2>
                      <div className={styles.modeGrid}>
                        {practiceModes.map((mode) => (
                          <button
                            type="button"
                            key={mode}
                            className={`${styles.modeCard} ${
                              profile.practiceModes.includes(mode)
                                ? styles.modeSelected
                                : ""
                            }`}
                            aria-pressed={profile.practiceModes.includes(mode)}
                            onClick={() => togglePracticeMode(mode)}
                          >
                            <span aria-hidden="true">
                              {profile.practiceModes.includes(mode) ? "✓" : "＋"}
                            </span>
                            {modeLabels[mode]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {saveError && (
                  <p className={styles.errorNote} role="status">
                    {t.saveError}
                  </p>
                )}
                <div className={styles.navigation}>
                  <button
                    type="button"
                    className={styles.back}
                    onClick={() => setStep((currentStep) => currentStep - 1)}
                  >
                    {t.back}
                  </button>
                  {step < 4 ? (
                    <button
                      type="button"
                      className={styles.primary}
                      onClick={() => setStep((currentStep) => currentStep + 1)}
                    >
                      {t.continue} <span aria-hidden="true">→</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.primary}
                      onClick={finishSetup}
                    >
                      {t.finish} <span aria-hidden="true">→</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export function LearningPathSummary({
  language,
  profile,
  saveError,
  onLanguageChange,
  onContinue,
  onEdit,
}: SummaryProps) {
  const t = onboardingCopy[language];
  const option = targetLanguages.find(
    (languageOption) => languageOption.code === profile.targetLanguageCode,
  );
  const courseName = option?.title[language] ?? profile.targetLanguageCode;
  const availability = option?.availability ?? "coming-soon";
  const levelLabels: Record<ProficiencyLevel, string> = {
    new: t.levelNew,
    beginner: t.levelBeginner,
    intermediate: t.levelIntermediate,
  };
  const goalLabels: Record<LearningGoal, string> = {
    everyday: t.goalEveryday,
    travel: t.goalTravel,
    work: t.goalWork,
    study: t.goalStudy,
    culture: t.goalCulture,
    personal: t.goalPersonal,
  };
  const modeLabels: Record<PracticeMode, string> = {
    listen: t.modeListen,
    speak: t.modeSpeak,
    read: t.modeRead,
    write: t.modeWrite,
  };
  const knownLanguages = [
    ...profile.knownLanguages.map((code) =>
      code === "en" ? t.knownEnglish : code === "hi" ? t.knownHindi : code,
    ),
    ...(profile.otherKnownLanguage.trim()
      ? [profile.otherKnownLanguage.trim()]
      : []),
  ];
  const practices = profile.practiceModes.map((mode) => modeLabels[mode]);

  return (
    <main className={styles.page} lang={language}>
      <div className={styles.comingShell}>
        <header className={styles.header}>
          <Link className={styles.brand} href="/" aria-label={t.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              S
            </span>
            <span>{t.brand}</span>
          </Link>
          <div className={styles.headerActions}>
            <ThemeToggle language={language} />
            <div className={styles.languageControl}>
              <span>{t.language}</span>
              <div
                className={styles.languageSwitch}
                role="group"
                aria-label={t.language}
              >
                <button
                  type="button"
                  aria-pressed={language === "en"}
                  onClick={() => onLanguageChange("en")}
                >
                  EN
                </button>
                <button
                  type="button"
                  aria-pressed={language === "hi"}
                  onClick={() => onLanguageChange("hi")}
                >
                  हिंदी
                </button>
              </div>
            </div>
          </div>
        </header>
        <section
          className={`${styles.comingCard} ${styles.summaryCard}`}
          aria-labelledby="summary-title"
        >
          <div className={styles.summaryHeader}>
            <div>
              <p className={styles.eyebrow}>{t.summaryEyebrow}</p>
              <h1 id="summary-title">
                {t.summaryTitle.replace("{language}", courseName)}
              </h1>
              <p className={styles.description}>{t.summaryDescription}</p>
            </div>
            <span className={styles.summarySpark} aria-hidden="true">
              ✳
            </span>
          </div>

          <div className={styles.summaryCourse}>
            <div className={styles.summaryCourseMark} aria-hidden="true">
              <span lang={option?.code}>{option?.nativeName ?? "?"}</span>
            </div>
            <div className={styles.summaryCourseText}>
              <p>{t.summaryCourse}</p>
              <h2>{courseName}</h2>
            </div>
            <span
              className={
                availability === "available"
                  ? styles.available
                  : styles.comingSoon
              }
            >
              {availability === "available" ? t.availableNow : t.comingSoon}
            </span>
          </div>

          <dl className={styles.summaryDetails}>
            <div className={styles.summaryItem}>
              <dt>{t.summaryLevel}</dt>
              <dd>{levelLabels[profile.proficiency]}</dd>
            </div>
            <div className={styles.summaryItem}>
              <dt>{t.summaryGoal}</dt>
              <dd>{goalLabels[profile.goal]}</dd>
            </div>
            <div className={styles.summaryItem}>
              <dt>{t.summaryTime}</dt>
              <dd>
                {profile.dailyMinutes} {t.minutes}
              </dd>
            </div>
            <div className={styles.summaryItem}>
              <dt>{t.summaryPractice}</dt>
              <dd>
                {practices.length ? practices.join(", ") : t.summaryNotAdded}
              </dd>
            </div>
            <div className={styles.summaryItem}>
              <dt>{t.summaryKnownLanguages}</dt>
              <dd>
                {knownLanguages.length
                  ? knownLanguages.join(", ")
                  : t.summaryNotAdded}
              </dd>
            </div>
          </dl>

          <p
            className={styles.localNote}
            role={saveError ? "status" : undefined}
          >
            {saveError ? t.saveError : t.localOnly}
          </p>
          <div className={styles.comingActions}>
            <button
              type="button"
              className={styles.primary}
              onClick={onContinue}
            >
              {availability === "available"
                ? t.summaryStart
                : t.summaryComingSoon}{" "}
              <span aria-hidden="true">→</span>
            </button>
            <button type="button" className={styles.back} onClick={onEdit}>
              {t.summaryEdit}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export function CourseComingSoon({
  language,
  targetLanguageCode,
  saveError,
  onLanguageChange,
  onPreviewJapanese,
  onEditSetup,
}: ComingSoonProps) {
  const t = onboardingCopy[language];
  const option = targetLanguages.find(
    (languageOption) => languageOption.code === targetLanguageCode,
  );
  const courseName = option?.title[language] ?? targetLanguageCode;

  return (
    <main className={styles.page} lang={language}>
      <div className={styles.comingShell}>
        <header className={styles.header}>
          <Link className={styles.brand} href="/" aria-label={t.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              S
            </span>
            <span>{t.brand}</span>
          </Link>
          <div className={styles.headerActions}>
            <ThemeToggle language={language} />
            <div className={styles.languageControl}>
              <span>{t.language}</span>
              <div className={styles.languageSwitch} role="group" aria-label={t.language}>
                <button
                  type="button"
                  aria-pressed={language === "en"}
                  onClick={() => onLanguageChange("en")}
                >
                  EN
                </button>
                <button
                  type="button"
                  aria-pressed={language === "hi"}
                  onClick={() => onLanguageChange("hi")}
                >
                  हिंदी
                </button>
              </div>
            </div>
          </div>
        </header>
        <section className={styles.comingCard}>
          <span className={styles.comingMark} aria-hidden="true">✳</span>
          <p className={styles.eyebrow}>{t.comingSoon}</p>
          <h1>{t.comingSoonTitle.replace("{language}", courseName)}</h1>
          <p className={styles.description}>{t.comingSoonDescription}</p>
          <p className={styles.localNote} role={saveError ? "status" : undefined}>
            {saveError ? t.saveError : t.localOnly}
          </p>
          <div className={styles.comingActions}>
            <button
              type="button"
              className={styles.primary}
              onClick={onPreviewJapanese}
            >
              {t.previewJapanese} <span aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              className={styles.back}
              onClick={onEditSetup}
            >
              {t.editSetup}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
