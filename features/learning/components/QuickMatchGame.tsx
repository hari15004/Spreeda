"use client";

import { useEffect, useRef, useState } from "react";
import { uiCopy } from "@/shared/data/ui-copy";
import {
  createQuickMatchRounds,
  type QuickMatchRound,
} from "@/features/learning/lib/quick-match";
import { stopSpeaking, speak } from "@/features/learning/lib/speech";
import type {
  LearningSkill,
  Lesson,
  UiLanguage,
} from "@/features/learning/types/learning";
import styles from "./QuickMatchGame.module.css";

type Props = {
  lesson: Lesson;
  courseTitle: string;
  language: UiLanguage;
  targetLanguageCode: string;
  speechLocale: string;
  onAssessment: (
    itemId: string,
    skill: LearningSkill,
    correct: boolean,
    isReview: boolean,
  ) => void;
  onClose: () => void;
};

type Phase = "intro" | "playing" | "results";

function skillForItem(kind: Lesson["items"][number]["kind"]): LearningSkill {
  if (kind === "script-character") return "reading";
  if (kind === "grammar") return "grammar";
  return "vocabulary";
}

export function QuickMatchGame({
  lesson,
  courseTitle,
  language,
  targetLanguageCode,
  speechLocale,
  onAssessment,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [rounds, setRounds] = useState<QuickMatchRound[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [speechMessage, setSpeechMessage] = useState<string | null>(null);
  const copy = uiCopy[language].quickGame;
  const round = rounds[roundIndex];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
      stopSpeaking();
    };
  }, []);

  function startGame() {
    setRounds(createQuickMatchRounds(lesson.items, language));
    setRoundIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setSpeechMessage(null);
    setPhase("playing");
  }

  function chooseAnswer(option: string) {
    if (!round || selectedAnswer !== null) return;
    const correct = option === round.item.targetText;
    setSelectedAnswer(option);
    if (correct) setScore((previous) => previous + 1);
    onAssessment(
      round.item.id,
      skillForItem(round.item.kind),
      correct,
      Boolean(round.item.isReview),
    );
  }

  function continueGame() {
    if (roundIndex === rounds.length - 1) {
      setPhase("results");
      return;
    }
    setRoundIndex((previous) => previous + 1);
    setSelectedAnswer(null);
    setSpeechMessage(null);
  }

  function listenToAnswer() {
    if (!round) return;
    const started = speak(round.item.audioText, speechLocale, (reason) => {
      setSpeechMessage(
        uiCopy[language].lesson.unavailable.replace("{reason}", reason),
      );
    });
    if (!started) {
      setSpeechMessage(
        uiCopy[language].lesson.unavailable.replace(
          "{reason}",
          "speech synthesis is unavailable",
        ),
      );
      return;
    }
    setSpeechMessage(null);
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="quick-match-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{courseTitle}</p>
            <h2 id="quick-match-title" className={styles.title}>
              {copy.title}
            </h2>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={copy.close}
          >
            ×
          </button>
        </header>

        {phase === "intro" && (
          <section className={styles.intro}>
            <p>{copy.intro}</p>
            <p className={styles.lessonTitle}>{lesson.title[language]}</p>
            <button type="button" className={styles.primary} onClick={startGame}>
              {copy.start}
              <span aria-hidden="true">→</span>
            </button>
          </section>
        )}

        {phase === "playing" && round && (
          <section className={styles.game} aria-live="polite">
            <div className={styles.roundMeta}>
              {copy.round
                .replace("{current}", String(roundIndex + 1))
                .replace("{total}", String(rounds.length))}
            </div>
            <div
              className={styles.progress}
              role="progressbar"
              aria-label={copy.progressLabel}
              aria-valuenow={roundIndex + 1}
              aria-valuemin={0}
              aria-valuemax={rounds.length}
            >
              <span
                style={{
                  width: `${((roundIndex + 1) / rounds.length) * 100}%`,
                }}
              />
            </div>
            <p className={styles.promptLabel}>
              {round.promptType === "meaning"
                ? copy.meaningPrompt
                : copy.readingPrompt}
            </p>
            <p
              className={styles.prompt}
              lang={round.promptType === "reading" ? targetLanguageCode : undefined}
            >
              {round.prompt}
            </p>
            <div className={styles.options}>
              {round.options.map((option, index) => {
                const isCorrect = option === round.item.targetText;
                const isSelected = option === selectedAnswer;
                const optionClass =
                  selectedAnswer === null
                    ? ""
                    : isCorrect
                      ? styles.correct
                      : isSelected
                        ? styles.incorrect
                        : "";
                return (
                  <button
                    type="button"
                    key={`${round.item.id}-${option}`}
                    className={`${styles.option} ${optionClass}`}
                    onClick={() => chooseAnswer(option)}
                    disabled={selectedAnswer !== null}
                    aria-pressed={isSelected}
                    lang={targetLanguageCode}
                  >
                    <span className={styles.optionIndex} aria-hidden="true">
                      {index + 1}
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
            {selectedAnswer !== null && (
              <div
                className={`${styles.feedback} ${
                  selectedAnswer === round.item.targetText
                    ? styles.feedbackCorrect
                    : styles.feedbackIncorrect
                }`}
                role="status"
              >
                <strong>
                  {selectedAnswer === round.item.targetText
                    ? copy.correct
                    : copy.incorrect}
                </strong>
                <span lang={targetLanguageCode}>{round.item.targetText}</span>
                <button
                  type="button"
                  className={styles.listen}
                  onClick={listenToAnswer}
                >
                  {copy.listen}
                  <span aria-hidden="true">▶</span>
                </button>
              </div>
            )}
            {speechMessage && (
              <p className={styles.notice} role="status">
                {speechMessage}
              </p>
            )}
            {selectedAnswer !== null && (
              <button
                type="button"
                className={styles.primary}
                onClick={continueGame}
              >
                {roundIndex === rounds.length - 1 ? copy.finish : copy.next}
                <span aria-hidden="true">→</span>
              </button>
            )}
          </section>
        )}

        {phase === "results" && (
          <section className={styles.results} aria-live="polite">
            <p className={styles.eyebrow}>{copy.results}</p>
            <p className={styles.score}>
              {copy.score
                .replace("{score}", String(score))
                .replace("{total}", String(rounds.length))}
            </p>
            <div className={styles.resultActions}>
              <button
                type="button"
                className={styles.primary}
                onClick={startGame}
              >
                {copy.playAgain}
              </button>
              <button
                type="button"
                className={styles.secondary}
                onClick={onClose}
              >
                {copy.close}
              </button>
            </div>
          </section>
        )}
      </div>
    </dialog>
  );
}
