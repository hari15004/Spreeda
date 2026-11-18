"use client";

import { useEffect, useState } from "react";
import { uiCopy } from "@/shared/data/ui-copy";
import {
  speak,
  stopSpeaking,
} from "@/features/learning/lib/speech";
import type {
  LearningItem,
  UiLanguage,
} from "@/features/learning/types/learning";
import styles from "./SoundPreview.module.css";

type Props = {
  items: readonly LearningItem[];
  language: UiLanguage;
  targetLanguageCode: string;
  speechLocale: string;
};

export function SoundPreview({
  items,
  language,
  targetLanguageCode,
  speechLocale,
}: Props) {
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [audioUnavailable, setAudioUnavailable] = useState<string | null>(null);
  const t = uiCopy[language];

  useEffect(() => stopSpeaking, []);

  function revealAndSpeak(item: LearningItem) {
    setRevealedId(item.id);
    const started = speak(item.audioText, speechLocale, (reason) =>
      setAudioUnavailable(t.lesson.unavailable.replace("{reason}", reason)),
    );
    setAudioUnavailable(
      started
        ? null
        : t.lesson.unavailable.replace("{reason}", "unsupported"),
    );
  }

  return (
    <div
      className={styles.soundGrid}
      role="group"
      aria-label={t.soundPreviewLabel}
    >
      {items.map((item, index) => {
        const revealed = revealedId === item.id;

        return (
          <button
            type="button"
            className={styles.soundCard}
            key={item.id}
            onClick={() => revealAndSpeak(item)}
            aria-pressed={revealed}
            aria-label={`${item.targetText}: ${
              revealed
                ? `${item.reading}, ${item.pronunciationCue[language]}`
                : t.soundPreviewAction
            }`}
            style={{ animationDelay: `${index * 55}ms` }}
          >
            <span className={styles.character} lang={targetLanguageCode}>
              {item.targetText}
            </span>
            <span className={styles.reading} aria-live="polite">
              {revealed
                ? `${item.reading} · ${
                    item.meaning?.[language] ?? item.pronunciationCue[language]
                  }`
                : t.soundPreviewHint}
            </span>
          </button>
        );
      })}
      {audioUnavailable && (
        <p className={styles.audioNotice} role="status">
          {t.lesson.unavailable}
        </p>
      )}
    </div>
  );
}
