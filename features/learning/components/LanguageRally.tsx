import { useEffect, useRef, useState, type MouseEvent } from "react";
import { uiCopy } from "@/shared/data/ui-copy";
import type { UiLanguage } from "@/features/learning/types/learning";
import styles from "./LanguageRally.module.css";

type MissionCheckpoint = {
  label: string;
  icon: string;
};

type LanguageRallyProps = {
  language: UiLanguage;
  courseTitle: string;
  lessonTitle: string;
  lessonNumber: number;
  completedLessons: number;
  totalLessons: number;
  checkpoints: MissionCheckpoint[];
  onDrive: () => void;
};

const routeCurve = [
  [0, 78],
  [20, 59],
  [38, 60],
  [55, 76],
  [72, 66],
  [88, 52],
  [100, 38],
] as const;

function routeHeight(position: number) {
  const nextIndex = routeCurve.findIndex(([x]) => x >= position);
  if (nextIndex <= 0) return routeCurve[0][1];
  const [leftX, leftY] = routeCurve[nextIndex - 1];
  const [rightX, rightY] = routeCurve[nextIndex];
  const ratio = (position - leftX) / (rightX - leftX);
  return leftY + (rightY - leftY) * ratio;
}

export function LanguageRally({
  language,
  courseTitle,
  lessonTitle,
  lessonNumber,
  completedLessons,
  totalLessons,
  checkpoints,
  onDrive,
}: LanguageRallyProps) {
  const copy = uiCopy[language].rally;
  const [launchPoint, setLaunchPoint] = useState<{
    x: number;
    y: number;
    id: number;
  } | null>(null);
  const launchTimer = useRef<number | null>(null);
  const safeTotal = Math.max(0, totalLessons);
  const clearedLessons = Math.min(
    safeTotal,
    Math.max(0, completedLessons),
  );
  const progress = safeTotal === 0 ? 0 : (clearedLessons / safeTotal) * 100;
  const progressLabel = copy.progress
    .replace("{completed}", String(clearedLessons))
    .replace("{total}", String(safeTotal));
  const actionLabel =
    safeTotal > 0 && clearedLessons === safeTotal ? copy.replay : copy.start;
  const stageLabel = copy.stage
    .replace("{current}", String(lessonNumber))
    .replace("{total}", String(safeTotal));
  const carPosition = 8 + progress * 0.84;

  useEffect(
    () => () => {
      if (launchTimer.current !== null) {
        window.clearTimeout(launchTimer.current);
      }
    },
    [],
  );

  function launchFromTrack(event: MouseEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX
      ? ((event.clientX - bounds.left) / bounds.width) * 100
      : 50;
    const y = event.clientY
      ? ((event.clientY - bounds.top) / bounds.height) * 100
      : 50;
    setLaunchPoint({
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(12, Math.min(88, y)),
      id: Date.now(),
    });
    if (launchTimer.current !== null) {
      window.clearTimeout(launchTimer.current);
    }
    launchTimer.current = window.setTimeout(() => {
      launchTimer.current = null;
      onDrive();
    }, 520);
  }

  return (
    <section className={styles.rally} aria-label={copy.title}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true">🏁</span> {copy.title}
          </p>
          <p className={styles.courseTitle}>{courseTitle}</p>
          <h3>{lessonTitle}</h3>
        </div>
        <span className={styles.stage}>{stageLabel}</span>
      </header>

      <button
        className={styles.track}
        type="button"
        onClick={launchFromTrack}
        aria-label={`${actionLabel}: ${lessonTitle}`}
      >
        <svg
          className={styles.landscape}
          viewBox="0 0 1200 420"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="rally-sky" x2="0" y2="1">
              <stop stopColor="#52b9f4" />
              <stop offset="1" stopColor="#d0f0f3" />
            </linearGradient>
            <linearGradient id="rally-hills" x2="0" y2="1">
              <stop stopColor="#88c974" />
              <stop offset="1" stopColor="#397b53" />
            </linearGradient>
            <linearGradient id="rally-dirt" x2="0" y2="1">
              <stop stopColor="#d8a85f" />
              <stop offset="1" stopColor="#95613e" />
            </linearGradient>
            <linearGradient id="rally-road" x2="0" y2="1">
              <stop stopColor="#535b60" />
              <stop offset="1" stopColor="#292f36" />
            </linearGradient>
            <linearGradient id="buggy-body" x2="0" y2="1">
              <stop stopColor="#ffba45" />
              <stop offset=".55" stopColor="#f06435" />
              <stop offset="1" stopColor="#b93632" />
            </linearGradient>
            <linearGradient id="buggy-glass" x2="0" y2="1">
              <stop stopColor="#d5fbff" />
              <stop offset="1" stopColor="#58b9ce" />
            </linearGradient>
            <filter id="track-shadow" x="-.2" y="-.4" width="1.4" height="1.8">
              <feGaussianBlur stdDeviation="11" />
            </filter>
          </defs>
          <rect width="1200" height="420" fill="url(#rally-sky)" />
          <circle cx="1030" cy="74" r="44" fill="#ffe89a" opacity=".92" />
          <path
            d="M0 180 128 84l92 82 128-112 118 130 112-90 138 99 114-109 118 100 124-87 148 105v150H0Z"
            fill="#7eaabd"
            opacity=".6"
          />
          <path
            d="M0 230 130 142l120 95 137-125 121 132 122-92 115 108 142-123 133 102 110-72 170 112v141H0Z"
            fill="url(#rally-hills)"
          />
          <path
            d="M0 269c142-41 231 43 361 4s211-34 310 33 203 48 297-21 159-86 232-44v179H0Z"
            fill="#63a55a"
          />
          <path
            d="M-50 330C105 367 169 220 330 225s208 20 261 88 174 73 253-7 169-132 292-83 128-3 181-80"
            fill="none"
            stroke="url(#rally-dirt)"
            strokeWidth="142"
            strokeLinecap="round"
          />
          <path
            d="M-50 330C105 367 169 220 330 225s208 20 261 88 174 73 253-7 169-132 292-83 128-3 181-80"
            fill="none"
            stroke="url(#rally-road)"
            strokeWidth="106"
            strokeLinecap="round"
          />
          <path
            d="M-50 330C105 367 169 220 330 225s208 20 261 88 174 73 253-7 169-132 292-83 128-3 181-80"
            fill="none"
            stroke="#f8d77b"
            strokeWidth="5"
            strokeDasharray="24 26"
            strokeLinecap="round"
            opacity=".9"
          />
          <path
            d="M0 407c210-53 340 30 543-1s384-40 657 13"
            fill="none"
            stroke="#e5c688"
            strokeWidth="4"
            opacity=".55"
          />
          <g className={styles.finish} transform="translate(1095 74)">
            <path d="M0 0v92" stroke="#293944" strokeWidth="7" />
            <path d="M4 4h65l-11 13 11 13H4Z" fill="#fff" />
            <path d="M4 4h31v13H4Zm31 13h23l11 13H35Z" fill="#e84e44" />
          </g>
        </svg>

        {checkpoints.map((checkpoint, index) => {
          const position =
            8 + ((index + 1) / (checkpoints.length + 1)) * 82;
          const height = routeHeight(position);
          return (
            <span
              className={styles.checkpoint}
              key={`${checkpoint.label}-${index}`}
              style={{ left: `${position}%`, top: `${height}%` }}
              aria-hidden="true"
            >
              <span className={styles.checkpointLabel}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                {checkpoint.label}
              </span>
              <span className={styles.checkpointPin}>{checkpoint.icon}</span>
              <span className={styles.obstacle} />
            </span>
          );
        })}

        <span
          className={styles.buggy}
          style={{
            left: `${carPosition}%`,
            top: `${routeHeight(carPosition)}%`,
          }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 230 140">
            <defs>
              <filter id="buggy-shadow" x="-.3" y="-.5" width="1.8" height="2">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            <ellipse
              cx="116"
              cy="120"
              rx="91"
              ry="12"
              fill="#101d22"
              opacity=".44"
              filter="url(#buggy-shadow)"
            />
            <g className={styles.dust}>
              <circle cx="25" cy="92" r="10" />
              <circle cx="12" cy="82" r="7" />
              <circle cx="3" cy="99" r="5" />
            </g>
            <g className={styles.tire}>
              <circle cx="65" cy="102" r="27" fill="#20282d" />
              <circle cx="65" cy="102" r="17" fill="#e0e5d7" />
              <circle cx="65" cy="102" r="9" fill="#64747b" />
              <path d="M65 85v9m0 16v9M48 102h9m16 0h9M53 90l7 7m11 11 7 7m0-25-7 7m-11 11-7 7" stroke="#303b40" strokeWidth="4" />
            </g>
            <g className={styles.tire}>
              <circle cx="174" cy="102" r="27" fill="#20282d" />
              <circle cx="174" cy="102" r="17" fill="#e0e5d7" />
              <circle cx="174" cy="102" r="9" fill="#64747b" />
              <path d="M174 85v9m0 16v9m-17-17h9m16 0h9m-29-12 7 7m11 11 7 7m0-25-7 7m-11 11-7 7" stroke="#303b40" strokeWidth="4" />
            </g>
            <path
              d="m35 89 13-27 21-7 12-29 63-4 25 36 30 14 9 25h-15a28 28 0 0 0-48 0H89a28 28 0 0 0-48 0Z"
              fill="url(#buggy-body)"
              stroke="#26353b"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <path
              d="m82 55 11-25 46-2 17 27Z"
              fill="url(#buggy-glass)"
              stroke="#293a40"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <path
              d="m50 59 21-5 12-30m75 30 11 16"
              fill="none"
              stroke="#293a40"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M79 27 99 13h49l16 31"
              fill="none"
              stroke="#25343a"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="m99 15-3 11m48-11 7 12" stroke="#f4f3df" strokeWidth="4" />
            <path d="m46 65 21-7 7 10-28 9Z" fill="#8bc84c" />
            <path d="m190 71 15 7-2 9-17-4Z" fill="#fff2b0" />
            <circle cx="122" cy="52" r="8" fill="#f3c54c" stroke="#324248" strokeWidth="3" />
            <path d="m103 34 22-4" stroke="#3b6874" strokeWidth="4" />
          </svg>
        </span>

        <span className={styles.trackPrompt}>
          <span aria-hidden="true">▶</span> {actionLabel}
        </span>
        {launchPoint && (
          <span
            className={styles.launchBurst}
            style={{ left: `${launchPoint.x}%`, top: `${launchPoint.y}%` }}
            key={launchPoint.id}
            aria-hidden="true"
          >
            {copy.go}
          </span>
        )}
      </button>

      <ul className={styles.missionLegend} aria-label={copy.checkpoints}>
        {checkpoints.map((checkpoint, index) => (
          <li key={`${checkpoint.label}-legend-${index}`}>
            <span aria-hidden="true">{checkpoint.icon}</span>
            {checkpoint.label}
          </li>
        ))}
      </ul>

      <footer className={styles.footer}>
        <span>{progressLabel}</span>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label={copy.progress}
          aria-valuemin={0}
          aria-valuemax={safeTotal}
          aria-valuenow={clearedLessons}
          aria-valuetext={progressLabel}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      </footer>
    </section>
  );
}
