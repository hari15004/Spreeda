"use client";

import { useEffect, useRef, useState } from "react";
import { uiCopy } from "@/data/ui-copy";
import { speak } from "@/lib/speech";
import type {
  Lesson,
  LessonCheckpoint,
  UiLanguage,
} from "@/types/learning";
import styles from "./LessonPlayer.module.css";

type Props = {
  lesson: Lesson;
  language: UiLanguage;
  targetLanguageCode: string;
  speechLocale: string;
  currentStreak: number;
  initialCheckpoint: LessonCheckpoint | null;
  onComplete: (score: number, durationSeconds: number) => void;
  onCheckpoint: (checkpoint: LessonCheckpoint) => void;
  onClose: () => void;
};

type Phase = "learn" | "quiz" | "result";

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

export function LessonPlayer({
  lesson,
  language,
  targetLanguageCode,
  speechLocale,
  currentStreak,
  initialCheckpoint,
  onComplete,
  onCheckpoint,
  onClose,
}: Props) {
  const checkpointQuestion =
    initialCheckpoint?.questionIndex === undefined
      ? undefined
      : lesson.questions[initialCheckpoint.questionIndex];
  const restoredCheckpoint =
    initialCheckpoint?.lessonId === lesson.id &&
    checkpointQuestion !== undefined &&
    initialCheckpoint.score <=
      initialCheckpoint.questionIndex +
        (initialCheckpoint.answer === null ? 0 : 1) &&
    (initialCheckpoint.answer === null ||
      checkpointQuestion.options.includes(initialCheckpoint.answer)) &&
    (initialCheckpoint.phase === "quiz" ||
      (initialCheckpoint.questionIndex === 0 &&
        initialCheckpoint.answer === null &&
        initialCheckpoint.score === 0))
      ? initialCheckpoint
      : null;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lessonStartedAtRef = useRef<number | null>(null);
  const previousDurationRef = useRef(restoredCheckpoint?.elapsedSeconds ?? 0);
  const [phase, setPhase] = useState<Phase>(
    restoredCheckpoint?.phase ?? "learn",
  );
  const [questionIndex, setQuestionIndex] = useState(
    restoredCheckpoint?.questionIndex ?? 0,
  );
  const [answer, setAnswer] = useState<string | null>(
    restoredCheckpoint?.answer ?? null,
  );
  const [score, setScore] = useState(restoredCheckpoint?.score ?? 0);
  const [speechMessage, setSpeechMessage] = useState("");
  const t = uiCopy[language].lesson;
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

  const currentQuestion = lesson.questions[questionIndex];

  function saveCheckpoint(
    nextPhase: "learn" | "quiz",
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
      saveCheckpoint(phase, questionIndex, answer, score);
    }
    onClose();
  }

  function playAudio(text: string) {
    setSpeechMessage(
      speak(text, speechLocale)
        ? ""
        : t.unavailable,
    );
  }

  function chooseAnswer(choice: string) {
    if (answer !== null) return;
    setAnswer(choice);
    const nextScore =
      choice === currentQuestion.correctAnswer ? score + 1 : score;
    if (choice === currentQuestion.correctAnswer) {
      setScore(nextScore);
    }
    saveCheckpoint("quiz", questionIndex, choice, nextScore);
  }

  function nextQuestion() {
    if (questionIndex === lesson.questions.length - 1) {
      onComplete(
        score,
        getElapsedSeconds(
          lessonStartedAtRef.current,
          previousDurationRef.current,
        ),
      );
      setPhase("result");
      return;
    }

    const nextQuestionIndex = questionIndex + 1;
    setQuestionIndex(nextQuestionIndex);
    setAnswer(null);
    saveCheckpoint("quiz", nextQuestionIndex, null, score);
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
              {phase === "learn"
                ? lesson.title[language]
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

        {phase === "learn" && (
          <>
            <p className={styles.intro}>{lesson.description[language]}</p>
            {lesson.mission && (
              <p className={styles.mission}>
                <strong>{uiCopy[language].missionLabel}</strong>{" "}
                {lesson.mission[language]}
              </p>
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
                setPhase("quiz");
                setSpeechMessage("");
                saveCheckpoint("quiz", questionIndex, null, score);
              }}
            >
              {t.startQuiz} <span aria-hidden="true">→</span>
            </button>
          </>
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
            <div className={styles.answerGrid}>
              {currentQuestion.options.map((option) => {
                const isCorrect = option === currentQuestion.correctAnswer;
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
            {answer !== null && (
              <div
                className={`${styles.feedback} ${
                  answer === currentQuestion.correctAnswer
                    ? styles.feedbackCorrect
                    : styles.feedbackIncorrect
                }`}
                role="status"
              >
                <div>
                  <strong>
                    {answer === currentQuestion.correctAnswer
                      ? t.correct
                      : t.incorrect}
                  </strong>
                  <span>
                    {currentQuestion.correctAnswer} · {currentQuestion.reading} ·{" "}
                    {
                      lesson.items.find(
                        (item) => item.id === currentQuestion.itemId,
                      )?.meaning?.[language]
                    }
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.audioButton}
                  onClick={() => {
                    const item = lesson.items.find(
                      (item) => item.id === currentQuestion.itemId,
                    );
                    if (item) playAudio(item.audioText);
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
            <p className={styles.resultScore}>
              {score}<span> / {lesson.questions.length}</span>
            </p>
            <p className={styles.intro}>
              {score === lesson.questions.length
                ? t.allCorrect
                : t.keepPracticing}
            </p>
            <p className={styles.streakMessage} role="status">
              {t.streakLine.replace("{count}", String(currentStreak))}
            </p>
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
            <button type="button" className={styles.primary} onClick={closeLesson}>
              {t.return} <span aria-hidden="true">→</span>
            </button>
          </section>
        )}
      </div>
    </dialog>
  );
}
