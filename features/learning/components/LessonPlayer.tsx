"use client";

import { useEffect, useRef, useState } from "react";
import { uiCopy } from "@/shared/data/ui-copy";
import { speak } from "@/features/learning/lib/speech";
import type { DailyMission } from "@/features/learning/lib/daily-mission";
import type {
  Lesson,
  LessonCheckpoint,
  LearningSkill,
  LearningItem,
  UiLanguage,
} from "@/features/learning/types/learning";
import type { PracticeMode } from "@/features/profile/types/learner-profile";
import styles from "./LessonPlayer.module.css";

type Props = {
  lesson: Lesson;
  dailyMission: DailyMission;
  language: UiLanguage;
  targetLanguageCode: string;
  speechLocale: string;
  currentStreak: number;
  initialCheckpoint: LessonCheckpoint | null;
  onComplete: (score: number, durationSeconds: number) => void;
  onAssessment: (
    itemId: string,
    skill: LearningSkill,
    correct: boolean,
    isReview: boolean,
  ) => void;
  onCheckpoint: (checkpoint: LessonCheckpoint) => void;
  onClose: () => void;
};

type Phase = LessonCheckpoint["phase"] | "result";

const sessionPhases: readonly LessonCheckpoint["phase"][] = [
  "intro",
  "review",
  "learn",
  "practice",
  "quiz",
];

function getElapsedSeconds(
  lessonStartedAt: number | null,
  previousDuration: number,
) {
  const currentSessionSeconds =
    lessonStartedAt === null
      ? 0
      : Math.floor((performance.now() - lessonStartedAt) / 1000);
  return previousDuration + currentSessionSeconds;
}

function normalizedAnswer(value: string) {
  return value
    .normalize("NFC")
    .toLocaleLowerCase()
    .replace(/[.,!?¿¡。、！？'’‘]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function LessonPlayer({
  lesson,
  dailyMission,
  language,
  targetLanguageCode,
  speechLocale,
  currentStreak,
  initialCheckpoint,
  onComplete,
  onAssessment,
  onCheckpoint,
  onClose,
}: Props) {
  const checkpointQuestion =
    initialCheckpoint?.questionIndex === undefined
      ? undefined
      : lesson.questions[initialCheckpoint.questionIndex];
  const checkpointAnswerIsValid =
    initialCheckpoint?.answer === null ||
    (checkpointQuestion?.interaction === "type" &&
      typeof initialCheckpoint?.answer === "string" &&
      initialCheckpoint.answer.length <= 300) ||
    (typeof initialCheckpoint?.answer === "string" &&
      checkpointQuestion?.options.includes(initialCheckpoint.answer));
  const restoredCheckpoint =
    initialCheckpoint?.lessonId === lesson.id &&
    checkpointQuestion !== undefined &&
    initialCheckpoint.score <=
      initialCheckpoint.questionIndex +
        (initialCheckpoint.answer === null ? 0 : 1) &&
    checkpointAnswerIsValid &&
    (initialCheckpoint.phase === "quiz" ||
      (initialCheckpoint.phase === "practice" &&
        initialCheckpoint.questionIndex < lesson.items.length &&
        initialCheckpoint.answer === null &&
        initialCheckpoint.score === 0) ||
      (initialCheckpoint.phase !== "practice" &&
        initialCheckpoint.questionIndex === 0 &&
        initialCheckpoint.answer === null &&
        initialCheckpoint.score === 0))
      ? initialCheckpoint
      : null;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lessonStartedAtRef = useRef<number | null>(null);
  const previousDurationRef = useRef(restoredCheckpoint?.elapsedSeconds ?? 0);
  const [phase, setPhase] = useState<Phase>(
    restoredCheckpoint?.phase ?? "intro",
  );
  const [questionIndex, setQuestionIndex] = useState(
    restoredCheckpoint?.questionIndex ?? 0,
  );
  const [answer, setAnswer] = useState<string | null>(
    restoredCheckpoint?.answer ?? null,
  );
  const [typedDraft, setTypedDraft] = useState("");
  const [selectedTileIndices, setSelectedTileIndices] = useState<number[]>([]);
  const [practiceIndex, setPracticeIndex] = useState(
    restoredCheckpoint?.phase === "practice"
      ? Math.min(restoredCheckpoint.questionIndex, lesson.items.length - 1)
      : 0,
  );
  const [practiceAnswer, setPracticeAnswer] = useState<string | null>(null);
  const [practiceDraft, setPracticeDraft] = useState("");
  const [score, setScore] = useState(restoredCheckpoint?.score ?? 0);
  const [elapsedSeconds, setElapsedSeconds] = useState(
    restoredCheckpoint?.elapsedSeconds ?? 0,
  );
  const [completedDurationSeconds, setCompletedDurationSeconds] = useState<
    number | null
  >(null);
  const [speechMessage, setSpeechMessage] = useState("");
  const t = uiCopy[language].lesson;
  const missionCopy = uiCopy[language].missionBlock;
  const eyebrow = t.eyebrow.replace("{day}", String(lesson.sequence));

  useEffect(() => {
    const dialog = dialogRef.current;
    lessonStartedAtRef.current = performance.now();
    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog?.open) {
        dialog.close();
      }
    };
  }, []);

  useEffect(() => {
    if (phase === "quiz" && lessonStartedAtRef.current === null) {
      lessonStartedAtRef.current = performance.now();
    }
    if (phase === "review") {
      lessonStartedAtRef.current = performance.now();
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "intro" || phase === "result") return;
    const updateElapsed = () => {
      setElapsedSeconds(
        getElapsedSeconds(
          lessonStartedAtRef.current,
          previousDurationRef.current,
        ),
      );
    };
    updateElapsed();
    const intervalId = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(intervalId);
  }, [phase]);

  const currentQuestion = lesson.questions[questionIndex];
  const interaction = currentQuestion.interaction ?? "recall";
  const rolePlayLine = lesson.curriculum?.dialogue[0];
  const wordTiles = currentQuestion.correctAnswer.split(/\s+/);
  const shuffledWordTiles =
    wordTiles.length > 1 ? [...wordTiles].reverse() : wordTiles;
  const total = lesson.questions.length;
  const passed = Math.round((score / total) * 100) >= 80;
  const needed = Math.ceil(total * 0.8);
  const practiceBlock = dailyMission.blocks.find(
    (block) => block.kind === "practice",
  );
  const practiceMode: PracticeMode = practiceBlock?.practiceMode ?? "listen";
  const practiceItemCount = Math.min(
    lesson.items.length,
    Math.max(1, practiceBlock?.minutes ?? 1),
  );
  const practiceItems = lesson.items.slice(0, practiceItemCount);
  const activePracticeIndex = Math.min(
    practiceIndex,
    Math.max(0, practiceItems.length - 1),
  );
  const practiceItem = practiceItems[activePracticeIndex];
  const practiceChoiceItems: LearningItem[] = practiceItem
    ? Array.from(
        new Map<string, LearningItem>(
          [...lesson.items.slice(0, 4), practiceItem].map((item) => [
            item.id,
            item,
          ]),
        ).values(),
      )
    : [];
  const practiceOptions =
    practiceMode === "listen"
      ? practiceChoiceItems.map((item) => item.targetText)
      : practiceChoiceItems.map(
          (item) =>
            item.meaning?.[language] ??
            item.meaning?.en ??
            item.reading,
        );
  const uniquePracticeOptions = [...new Set(practiceOptions)];
  const practiceExpected = practiceItem
    ? practiceMode === "listen" || practiceMode === "write"
      ? practiceItem.targetText
      : practiceItem.meaning?.[language] ??
        practiceItem.meaning?.en ??
        practiceItem.reading
    : "";
  const reviewItems = lesson.items.filter((item) => item.isReview);
  const warmupItems =
    reviewItems.length > 0 ? reviewItems : lesson.items.slice(0, 2);
  const currentStepIndex = sessionPhases.indexOf(phase as LessonCheckpoint["phase"]);
  const currentStepLabel = t.sessionStages[
    phase === "result" ? "quiz" : phase
  ];
  const actualMinutes =
    completedDurationSeconds === null
      ? 0
      : Math.floor(completedDurationSeconds / 60);
  const actualMinutesLabel =
    completedDurationSeconds !== null && completedDurationSeconds < 60
      ? uiCopy[language].lessThanMinute
      : new Intl.NumberFormat(language === "hi" ? "hi-IN" : "en-US").format(
          actualMinutes,
        );

  function saveCheckpoint(
    nextPhase: LessonCheckpoint["phase"],
    nextQuestionIndex: number,
    nextAnswer: string | null,
    nextScore: number,
  ) {
    onCheckpoint({
      lessonId: lesson.id,
      phase: nextPhase,
      questionIndex: nextQuestionIndex,
      answer: nextAnswer,
      score: nextScore,
      elapsedSeconds: getElapsedSeconds(
        lessonStartedAtRef.current,
        previousDurationRef.current,
      ),
    });
  }

  function closeLesson() {
    if (phase !== "result") {
      saveCheckpoint(
        phase,
        phase === "practice" ? activePracticeIndex : questionIndex,
        phase === "practice" ? null : answer,
        score,
      );
    }
    onClose();
  }

  function playAudio(text: string) {
    const started = speak(text, speechLocale, (reason) =>
      setSpeechMessage(t.unavailable.replace("{reason}", reason)),
    );
    setSpeechMessage(
      started ? "" : t.unavailable.replace("{reason}", "unsupported"),
    );
  }

  function chooseAnswer(choice: string) {
    if (answer !== null) return;
    setAnswer(choice);
    const correct =
      normalizedAnswer(choice) ===
      normalizedAnswer(currentQuestion.correctAnswer);
    const nextScore =
      correct ? score + 1 : score;
    onAssessment(
      currentQuestion.itemId,
      currentQuestion.skill ?? "vocabulary",
      correct,
      lesson.items.find((item) => item.id === currentQuestion.itemId)?.isReview ??
        false,
    );
    if (correct) setScore(nextScore);
    saveCheckpoint("quiz", questionIndex, choice, nextScore);
  }

  function choosePracticeAnswer(choice: string) {
    if (!practiceItem || practiceAnswer !== null) return;
    const correct =
      normalizedAnswer(choice) === normalizedAnswer(practiceExpected);
    setPracticeAnswer(choice);
    if (practiceMode === "speak") return;
    const skill: LearningSkill =
      practiceMode === "listen"
        ? "listening"
        : practiceMode === "read"
          ? "reading"
          : practiceMode === "write"
            ? "writing"
            : "speaking";
    onAssessment(practiceItem.id, skill, correct, Boolean(practiceItem.isReview));
  }

  function submitPracticeWriting(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (practiceDraft.trim()) choosePracticeAnswer(practiceDraft);
  }

  function continuePractice() {
    if (!practiceItem || practiceAnswer === null) return;
    if (activePracticeIndex === practiceItems.length - 1) {
      setQuestionIndex(0);
      setAnswer(null);
      setTypedDraft("");
      setSelectedTileIndices([]);
      setPhase("quiz");
      saveCheckpoint("quiz", 0, null, score);
      return;
    }
    const nextPracticeIndex = activePracticeIndex + 1;
    setPracticeIndex(nextPracticeIndex);
    setPracticeAnswer(null);
    setPracticeDraft("");
    saveCheckpoint("practice", nextPracticeIndex, null, score);
  }

  function recordSpeakingPractice() {
    if (!practiceItem || practiceAnswer !== null) return;
    setPracticeAnswer(practiceItem.targetText);
  }

  function chooseWordTile(tileIndex: number) {
    if (selectedTileIndices.includes(tileIndex)) return;
    const nextIndices = [...selectedTileIndices, tileIndex];
    setSelectedTileIndices(nextIndices);
    if (nextIndices.length === shuffledWordTiles.length) {
      chooseAnswer(nextIndices.map((index) => shuffledWordTiles[index]).join(" "));
    }
  }

  function nextQuestion() {
    if (questionIndex === lesson.questions.length - 1) {
      const durationSeconds = getElapsedSeconds(
        lessonStartedAtRef.current,
        previousDurationRef.current,
      );
      onComplete(score, durationSeconds);
      setCompletedDurationSeconds(durationSeconds);
      setElapsedSeconds(durationSeconds);
      setPhase("result");
      return;
    }

    const nextQuestionIndex = questionIndex + 1;
    setQuestionIndex(nextQuestionIndex);
    setAnswer(null);
    setTypedDraft("");
    setSelectedTileIndices([]);
    saveCheckpoint("quiz", nextQuestionIndex, null, score);
  }

  function retryQuiz() {
    previousDurationRef.current = 0;
    setElapsedSeconds(0);
    lessonStartedAtRef.current = null;
    setQuestionIndex(0);
    setAnswer(null);
    setTypedDraft("");
    setSelectedTileIndices([]);
    setScore(0);
    setCompletedDurationSeconds(null);
    setSpeechMessage("");
    setPhase("quiz");
    saveCheckpoint("quiz", 0, null, 0);
  }

  function startMission() {
    setQuestionIndex(0);
    setAnswer(null);
    setScore(0);
    setCompletedDurationSeconds(null);
    setPracticeIndex(0);
    setPracticeAnswer(null);
    setPracticeDraft("");
    setPhase("review");
    previousDurationRef.current = 0;
    setElapsedSeconds(0);
    onCheckpoint({
      lessonId: lesson.id,
      phase: "review",
      questionIndex: 0,
      answer: null,
      score: 0,
      elapsedSeconds: 0,
    });
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      lang={language}
      aria-labelledby="lesson-title"
      onCancel={(event) => {
        event.preventDefault();
        closeLesson();
      }}
    >
      <div className={styles.lesson}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h2 id="lesson-title" className={styles.title}>
              {phase === "intro"
                ? t.sessionTitle
                : phase === "review"
                  ? t.sessionStages.review
                  : phase === "learn"
                    ? lesson.title[language]
                    : phase === "practice"
                      ? t.sessionStages.practice
                      : phase === "quiz"
                        ? t.quizTitle
                        : t.resultTitle}
            </h2>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={closeLesson}
            aria-label={t.close}
          >
            ×
          </button>
        </header>

        {phase !== "result" && (
          <div className={styles.sessionProgress}>
            <div className={styles.sessionProgressLabel}>
              <span>{currentStepLabel}</span>
              <span>
                {t.sessionStep
                  .replace("{current}", String(currentStepIndex + 1))
                  .replace("{total}", String(sessionPhases.length))}
              </span>
            </div>
            <div
              className={styles.progress}
              role="progressbar"
              aria-label={t.sessionTitle}
              aria-valuenow={currentStepIndex + 1}
              aria-valuemin={0}
              aria-valuemax={sessionPhases.length}
            >
              <span
                style={{
                  width: `${((currentStepIndex + 1) / sessionPhases.length) * 100}%`,
                }}
              />
            </div>
            {phase !== "intro" && (
              <>
                <div className={styles.sessionProgressLabel}>
                  <span>{t.sessionFocusProgress}</span>
                  <span>
                    {t.sessionClock
                      .replace(
                        "{elapsed}",
                        String(Math.floor(elapsedSeconds / 60)),
                      )
                      .replace(
                        "{target}",
                        String(dailyMission.totalMinutes),
                      )}
                  </span>
                </div>
                <div
                  className={styles.focusProgress}
                  role="progressbar"
                  aria-label={t.sessionFocusProgress}
                  aria-valuenow={Math.min(
                    elapsedSeconds,
                    dailyMission.totalMinutes * 60,
                  )}
                  aria-valuemin={0}
                  aria-valuemax={dailyMission.totalMinutes * 60}
                >
                  <span
                    style={{
                      width: `${Math.min(
                        100,
                        (elapsedSeconds / (dailyMission.totalMinutes * 60)) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {phase === "intro" && (
          <section className={styles.missionIntro}>
            <p className={styles.eyebrow}>{t.sessionTitle}</p>
            <h3>
              {t.sessionTime.replace(
                "{minutes}",
                String(dailyMission.totalMinutes),
              )}
            </h3>
            <p className={styles.intro}>{lesson.description[language]}</p>
            <ol className={styles.missionSteps}>
              {dailyMission.blocks.map((block) => {
                const label =
                  block.kind === "practice" && block.practiceMode
                    ? missionCopy[block.practiceMode]
                    : missionCopy[block.kind];
                return (
                  <li key={block.kind}>
                    <span>{label}</span>
                    <strong>
                      {uiCopy[language].missionMinute.replace(
                        "{minutes}",
                        String(block.minutes),
                      )}
                    </strong>
                  </li>
                );
              })}
            </ol>
            <p className={styles.sessionNote}>
              {language === "en"
                ? "These are focus-time estimates, not forced waiting timers. Go at your pace."
                : "ये अभ्यास समय के अनुमान हैं, इंतज़ार करने वाले टाइमर नहीं। अपनी गति से सीखें।"}
            </p>
            <button type="button" className={styles.primary} onClick={startMission}>
              {t.sessionStart} <span aria-hidden="true">→</span>
            </button>
          </section>
        )}

        {phase === "review" && (
          <section className={styles.sessionStage}>
            <h3>{t.sessionStages.review}</h3>
            <p className={styles.intro}>
              {reviewItems.length > 0
                ? t.sessionReviewIntro
                : t.sessionNoReview}
            </p>
            <div className={styles.warmupList}>
              {warmupItems.map((item) => (
                <details className={styles.warmupItem} key={item.id}>
                  <summary lang={targetLanguageCode}>
                    {item.meaning?.[language] ?? item.reading}
                  </summary>
                  <p lang={targetLanguageCode}>
                    {item.targetText} · {item.reading}
                  </p>
                </details>
              ))}
            </div>
            <button
              type="button"
              className={styles.primary}
              onClick={() => {
                setPhase("learn");
                saveCheckpoint("learn", 0, null, 0);
              }}
            >
              {t.sessionContinue} <span aria-hidden="true">→</span>
            </button>
          </section>
        )}

        {phase === "learn" && (
          <>
            <p className={styles.intro}>{lesson.description[language]}</p>
            <p className={styles.sessionNote}>{t.sessionLearnIntro}</p>
            {lesson.mission && (
              <p className={styles.mission}>
                <strong>{uiCopy[language].missionLabel}</strong>{" "}
                {lesson.mission[language]}
              </p>
            )}
            {lesson.curriculum && (
              <section className={styles.curriculum} aria-label={
                language === "en" ? "Lesson guide" : "पाठ मार्गदर्शिका"
              }>
                  <details className={styles.lessonPlan}>
                    <summary>
                      {language === "en" ? "Lesson guide" : "पाठ मार्गदर्शिका"}
                    </summary>
                  <ol>
                    {lesson.curriculum.segments.map((segment, index) => (
                      <li key={`${segment.title.en}-${index}`}>
                          <strong>{segment.title[language]}</strong>
                        <p>{segment.task[language]}</p>
                      </li>
                    ))}
                  </ol>
                </details>
                <article>
                  <h3>{language === "en" ? "Today's goal" : "आज का लक्ष्य"}</h3>
                  <p>{lesson.curriculum.objective[language]}</p>
                </article>
                <article>
                  <h3>{language === "en" ? "Notice the pattern" : "व्याकरण का पैटर्न"}</h3>
                  <p>{lesson.curriculum.grammar[language]}</p>
                </article>
                <article>
                  <h3>{language === "en" ? "Sound to notice" : "उच्चारण पर ध्यान दें"}</h3>
                  <p>{lesson.curriculum.pronunciation[language]}</p>
                </article>
                {lesson.curriculum.dialogue.length > 0 && (
                  <article>
                    <h3>{language === "en" ? "A real exchange" : "वास्तविक बातचीत"}</h3>
                    <div className={styles.dialogue}>
                      {lesson.curriculum.dialogue.map((line, index) => (
                        <button
                          type="button"
                          key={`${line.speaker}-${index}`}
                          onClick={() => playAudio(line.targetText)}
                          aria-label={`${line.speaker}: ${line.targetText}. ${line.meaning[language]}. ${t.listen}`}
                        >
                          <span className={styles.speaker}>{line.speaker}</span>
                          <span lang={targetLanguageCode}>{line.targetText}</span>
                          <span>{line.meaning[language]}</span>
                          <span aria-hidden="true">▶</span>
                        </button>
                      ))}
                    </div>
                  </article>
                )}
                <article>
                  <h3>{language === "en" ? "Try it" : "अभ्यास करें"}</h3>
                  <p>{lesson.curriculum.activity.instruction[language]}</p>
                  <span className={styles.skillTags}>
                    {lesson.curriculum.activity.skills
                      .map((skill) => skill.replace("-", " "))
                      .join(" · ")}
                  </span>
                </article>
              </section>
            )}
            <div className={styles.kanaGrid}>
              {lesson.items.map((item) => (
                <button
                  type="button"
                  className={`${styles.kanaCard} ${
                    item.isReview ? styles.reviewCard : ""
                  }`}
                  key={item.id}
                  onClick={() => playAudio(item.audioText)}
                  aria-label={`${item.targetText}, ${item.reading}, ${item.meaning?.[language] ?? ""}; ${t.listen}`}
                >
                  <span className={styles.itemType}>
                    {item.isReview ? t.reviewItem : t.newItem}
                  </span>
                  <span lang={targetLanguageCode} className={styles.character}>
                    {item.targetText}
                  </span>
                  <span className={styles.romaji}>{item.reading}</span>
                  <span className={styles.hindi}>
                    {item.meaning?.[language] ??
                      item.pronunciationCue[language]}
                  </span>
                  <span className={styles.listen}>{t.listen} ↗</span>
                </button>
              ))}
            </div>
            <p className={styles.tip}>
              <span aria-hidden="true">◉</span> {t.tip}
            </p>
            {speechMessage && (
              <p className={styles.notice} role="status">
                {speechMessage}
              </p>
            )}
            <button
              type="button"
              className={styles.primary}
              onClick={() => {
                setPracticeIndex(0);
                setPracticeAnswer(null);
                setPracticeDraft("");
                setPhase("practice");
                setSpeechMessage("");
                saveCheckpoint("practice", 0, null, score);
              }}
            >
              {t.sessionContinue} <span aria-hidden="true">→</span>
            </button>
          </>
        )}

        {phase === "practice" && practiceItem && (
          <section className={styles.sessionStage} aria-live="polite">
            <p className={styles.eyebrow}>
              {missionCopy[practiceMode]} · {activePracticeIndex + 1} /{" "}
              {practiceItems.length}
            </p>
            <p className={styles.intro}>{t.sessionPracticeIntro}</p>
            <div className={styles.practiceCard}>
              {practiceMode === "listen" && (
                <>
                  <p className={styles.question}>
                    {practiceItem.meaning?.[language] ??
                      t.practiceListenPrompt}
                  </p>
                  <button
                    type="button"
                    className={styles.audioPrompt}
                    onClick={() => playAudio(practiceItem.audioText)}
                  >
                    ▶ {t.listen}
                  </button>
                  <div className={styles.answerGrid}>
                    {uniquePracticeOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={styles.answer}
                        disabled={practiceAnswer !== null}
                        onClick={() => choosePracticeAnswer(option)}
                        lang={targetLanguageCode}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {practiceMode === "read" && (
                <>
                  <p className={styles.question}>{t.practiceReadPrompt}</p>
                  <p className={styles.practiceTarget} lang={targetLanguageCode}>
                    {practiceItem.targetText}
                  </p>
                  <div className={styles.answerGrid}>
                    {uniquePracticeOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={styles.answer}
                        disabled={practiceAnswer !== null}
                        onClick={() => choosePracticeAnswer(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {practiceMode === "speak" && (
                <>
                  <p className={styles.question}>{t.practiceSpeakPrompt}</p>
                  <p className={styles.practiceTarget} lang={targetLanguageCode}>
                    {practiceItem.targetText}
                  </p>
                  <button
                    type="button"
                    className={styles.audioPrompt}
                    onClick={() => playAudio(practiceItem.audioText)}
                  >
                    ▶ {t.listen}
                  </button>
                  <button
                    type="button"
                    className={styles.primary}
                    disabled={practiceAnswer !== null}
                    onClick={recordSpeakingPractice}
                  >
                    {t.practiceI_said} <span aria-hidden="true">→</span>
                  </button>
                  <p className={styles.selfAssessment}>{t.practiceSelfCheck}</p>
                </>
              )}

              {practiceMode === "write" && practiceAnswer === null && (
                <>
                  <p className={styles.question}>{t.practiceWritePrompt}</p>
                  <p>{practiceItem.meaning?.[language] ?? practiceItem.reading}</p>
                  <form
                    className={styles.typingForm}
                    onSubmit={submitPracticeWriting}
                  >
                    <input
                      autoComplete="off"
                      className={styles.typingInput}
                      value={practiceDraft}
                      onChange={(event) => setPracticeDraft(event.target.value)}
                      aria-label={t.practiceWriteLabel}
                      lang={targetLanguageCode}
                    />
                    <button
                      type="submit"
                      className={styles.primary}
                      disabled={!practiceDraft.trim()}
                    >
                      {t.practiceCheck} <span aria-hidden="true">→</span>
                    </button>
                  </form>
                </>
              )}

              {practiceAnswer !== null && practiceMode !== "speak" && (
                <p
                  className={`${styles.feedback} ${
                    normalizedAnswer(practiceAnswer) ===
                    normalizedAnswer(practiceExpected)
                      ? styles.feedbackCorrect
                      : styles.feedbackIncorrect
                  }`}
                  role="status"
                >
                  {normalizedAnswer(practiceAnswer) ===
                  normalizedAnswer(practiceExpected)
                    ? t.correct
                    : `${t.incorrect} ${practiceItem.targetText}`}
                </p>
              )}
              {practiceAnswer !== null && practiceMode === "speak" && (
                <p className={styles.feedback} role="status">
                  {t.practiceDone}
                </p>
              )}
            </div>
            {speechMessage && (
              <p className={styles.notice} role="status">
                {speechMessage}
              </p>
            )}
            {practiceAnswer !== null && (
              <button
                type="button"
                className={styles.primary}
                onClick={continuePractice}
              >
                {activePracticeIndex === practiceItems.length - 1
                  ? t.startQuiz
                  : t.sessionContinue}
                <span aria-hidden="true">→</span>
              </button>
            )}
          </section>
        )}

        {phase === "quiz" && (
          <section className={styles.quiz} aria-live="polite">
            <div className={styles.quizMeta}>
              <span>
                {language === "en" ? "Question" : "प्रश्न"} {questionIndex + 1} /{" "}
                {lesson.questions.length}
              </span>
              <span>
                {score} {t.correctCount}
              </span>
            </div>
            <div
              className={styles.progress}
              role="progressbar"
              aria-label={language === "en" ? "Lesson progress" : "पाठ में प्रगति"}
              aria-valuenow={questionIndex + 1}
              aria-valuemin={0}
              aria-valuemax={lesson.questions.length}
            >
              <span
                style={{
                  width: `${((questionIndex + 1) / lesson.questions.length) * 100}%`,
                }}
              />
            </div>
            <p className={styles.question}>
              {currentQuestion.prompt?.[language] ??
                `${t.question} ${currentQuestion.reading} ${t.questionEnd}`}
            </p>
            {interaction === "role-play" && rolePlayLine && (
                <button
                  type="button"
                  className={styles.audioPrompt}
                  onClick={() => playAudio(rolePlayLine.targetText)}
                >
                  <span lang={targetLanguageCode}>
                    {rolePlayLine.targetText}
                  </span>
                  <span>
                    · {rolePlayLine.meaning[language]} · ▶
                  </span>
                </button>
              )}
            {interaction === "listen" && (
              <button
                type="button"
                className={styles.audioPrompt}
                onClick={() => playAudio(currentQuestion.correctAnswer)}
              >
                ▶ {language === "en" ? "Play the phrase" : "वाक्यांश सुनें"}
              </button>
            )}
            {interaction === "type" && answer === null && (
              <form
                className={styles.typingForm}
                onSubmit={(event) => {
                  event.preventDefault();
                  if (typedDraft.trim()) chooseAnswer(typedDraft);
                }}
              >
                <input
                  autoComplete="off"
                  className={styles.typingInput}
                  value={typedDraft}
                  onChange={(event) => setTypedDraft(event.target.value)}
                  aria-label={
                    language === "en"
                      ? "Type the phrase in the target language"
                      : "लक्ष्य भाषा में वाक्यांश लिखें"
                  }
                  lang={targetLanguageCode}
                />
                <button
                  type="submit"
                  className={styles.primary}
                  disabled={!typedDraft.trim()}
                >
                  {language === "en" ? "Check answer" : "उत्तर जाँचें"}
                  <span aria-hidden="true">→</span>
                </button>
              </form>
            )}
            {interaction === "sentence-build" && (
              <div className={styles.wordBuild}>
                <div
                  className={styles.wordTiles}
                  aria-label={
                    language === "en" ? "Build the phrase" : "वाक्यांश बनाएँ"
                  }
                >
                  {shuffledWordTiles.map((word, index) => {
                    const selected = selectedTileIndices.includes(index);
                    return (
                      <button
                        type="button"
                        key={`${word}-${index}`}
                        className={styles.wordTile}
                        onClick={() => chooseWordTile(index)}
                        disabled={selected || answer !== null}
                        lang={targetLanguageCode}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
                {answer === null && selectedTileIndices.length > 0 && (
                  <button
                    type="button"
                    className={styles.resetBuild}
                    onClick={() => setSelectedTileIndices([])}
                  >
                    {language === "en" ? "Start over" : "फिर से शुरू करें"}
                  </button>
                )}
              </div>
            )}
            {interaction === "speak" && answer === null && (
              <div className={styles.speakPrompt}>
                <button
                  type="button"
                  className={styles.audioPrompt}
                  onClick={() => playAudio(currentQuestion.correctAnswer)}
                >
                  ▶{" "}
                  {language === "en"
                    ? "Listen, then repeat aloud"
                    : "सुनें, फिर ज़ोर से दोहराएँ"}
                </button>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => chooseAnswer(currentQuestion.correctAnswer)}
                >
                  {language === "en"
                    ? "I practiced saying it"
                    : "मैंने बोलकर अभ्यास किया"}
                  <span aria-hidden="true">→</span>
                </button>
                <p className={styles.selfAssessment}>
                  {language === "en"
                    ? "Self-check only; speech recognition is not available here."
                    : "यह स्वयं-जाँच है; यहाँ स्वचालित आवाज़ पहचान उपलब्ध नहीं है।"}
                </p>
              </div>
            )}
            {(interaction === "recall" ||
              interaction === "listen" ||
              interaction === "role-play") && (
              <div className={styles.answerGrid}>
                {currentQuestion.options.map((option) => {
                  const isCorrect =
                    normalizedAnswer(option) ===
                    normalizedAnswer(currentQuestion.correctAnswer);
                  const isSelected = option === answer;
                  const answerClass =
                    answer === null
                      ? ""
                      : isCorrect
                        ? styles.correct
                        : isSelected
                          ? styles.incorrect
                          : "";

                  return (
                    <button
                      type="button"
                      key={option}
                      className={`${styles.answer} ${answerClass}`}
                      onClick={() => chooseAnswer(option)}
                      disabled={answer !== null}
                      aria-label={`${t.option} ${option}`}
                    >
                      <span lang={targetLanguageCode}>{option}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {answer !== null && (
              <div
                className={`${styles.feedback} ${
                  normalizedAnswer(answer) ===
                  normalizedAnswer(currentQuestion.correctAnswer)
                    ? styles.feedbackCorrect
                    : styles.feedbackIncorrect
                }`}
                role="status"
              >
                <div>
                  <strong>
                    {normalizedAnswer(answer) ===
                    normalizedAnswer(currentQuestion.correctAnswer)
                      ? t.correct
                      : t.incorrect}
                  </strong>
                  <span>
                    {currentQuestion.correctAnswer}
                    {currentQuestion.answerMeaning ? null : ` · ${currentQuestion.reading}`}
                    {" · "}
                    {currentQuestion.answerMeaning?.[language] ??
                      lesson.items.find(
                        (item) => item.id === currentQuestion.itemId,
                      )?.meaning?.[language]}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.audioButton}
                  onClick={() => {
                    const item = lesson.items.find(
                      (item) => item.id === currentQuestion.itemId,
                    );
                    if (currentQuestion.answerAudioText) {
                      playAudio(currentQuestion.answerAudioText);
                    } else if (item) {
                      playAudio(item.audioText);
                    }
                  }}
                  aria-label={t.listen}
                >
                  ▶
                </button>
              </div>
            )}
            {speechMessage && (
              <p className={styles.notice} role="status">
                {speechMessage}
              </p>
            )}
            {answer !== null && (
              <button
                type="button"
                className={styles.primary}
                onClick={nextQuestion}
              >
                {questionIndex === lesson.questions.length - 1
                  ? t.results
                  : t.next}
                <span aria-hidden="true">→</span>
              </button>
            )}
          </section>
        )}

        {phase === "result" && (
          <section className={styles.result}>
            <p className={styles.eyebrow}>{t.sessionOutcome}</p>
            <p className={styles.intro}>
              {lesson.curriculum?.objective[language] ??
                lesson.mission?.[language] ??
                lesson.description[language]}
            </p>
            <p className={styles.sessionNote}>
              {t.sessionActualTime
                .replace("{actual}", actualMinutesLabel)
                .replace("{target}", String(dailyMission.totalMinutes))}
            </p>
            <p className={styles.resultScore}>
              {score}<span> / {lesson.questions.length}</span>
            </p>
            <p className={styles.intro}>
              {score === lesson.questions.length
                ? t.allCorrect
                : t.keepPracticing}
            </p>
            <p className={styles.streakMessage} role="status">
              {passed
                ? language === "en"
                  ? "Passed! Next day unlocked."
                  : "पास! अगला दिन खुल गया।"
                : language === "en"
                  ? `You need at least ${needed} of ${total} correct to unlock the next day. Try again!`
                  : `अगला दिन खोलने के लिए कम से कम ${needed} / ${total} सही चाहिए। फिर से कोशिश करो!`}
            </p>
            {passed && (
              <p className={styles.streakMessage}>
                {t.streakLine.replace("{count}", String(currentStreak))}
              </p>
            )}
            <div className={styles.resultList}>
              {lesson.items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => playAudio(item.audioText)}
                  aria-label={`${item.targetText} · ${t.replay}`}
                >
                  <span lang={targetLanguageCode}>{item.targetText}</span>
                  <span>{item.reading}</span>
                  <span>{item.meaning?.[language] ?? item.pronunciationCue[language]}</span>
                  <span aria-hidden="true">▶</span>
                </button>
              ))}
            </div>
            {speechMessage && (
              <p className={styles.notice} role="status">
                {speechMessage}
              </p>
            )}
            {!passed && (
              <button type="button" className={styles.primary} onClick={retryQuiz}>
                {language === "en" ? "Try again" : "फिर से कोशिश करो"}{" "}
                <span aria-hidden="true">→</span>
              </button>
            )}
            <button type="button" className={styles.primary} onClick={closeLesson}>
              {t.return} <span aria-hidden="true">→</span>
            </button>
          </section>
        )}
      </div>
    </dialog>
  );
}