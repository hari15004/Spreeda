import type { PracticeMode } from "@/features/profile/types/learner-profile";

export type MissionBlockKind =
  | "review"
  | "learn"
  | "practice"
  | "recall"
  | "result";

export type MissionBlock = {
  kind: MissionBlockKind;
  minutes: number;
  practiceMode?: PracticeMode;
};

export type DailyMission = {
  dayIndex: number;
  totalMinutes: number;
  blocks: readonly MissionBlock[];
};

const defaultModes: readonly PracticeMode[] = [
  "listen",
  "read",
  "speak",
  "write",
];

function allocateMinutes(totalMinutes: number): readonly number[] {
  if (totalMinutes <= 10) {
    const remaining = totalMinutes - 5;
    const review = 1;
    const learn = 1 + Math.round(remaining * 0.35);
    const practice = 1 + Math.round(remaining * 0.2);
    const recall = 1 + Math.round(remaining * 0.35);
    const result = totalMinutes - review - learn - practice - recall;
    return [review, learn, practice, recall, result];
  }

  const review = Math.max(2, Math.round(totalMinutes * 0.12));
  const learn = Math.max(5, Math.round(totalMinutes * 0.35));
  const practice = Math.max(3, Math.round(totalMinutes * 0.28));
  const recall = Math.max(3, Math.round(totalMinutes * 0.18));
  const result = Math.max(
    1,
    totalMinutes - review - learn - practice - recall,
  );
  return [review, learn, practice, recall, result];
}

export function createDailyMission(
  dayIndex: number,
  totalMinutes: number,
  selectedModes: readonly PracticeMode[] = defaultModes,
): DailyMission {
  const normalizedDay = Number.isInteger(dayIndex) ? Math.max(1, dayIndex) : 1;
  const normalizedMinutes =
    [5, 10, 15, 20, 30, 40, 45, 60].find((minutes) => minutes === totalMinutes) ??
    15;
  const modes =
    selectedModes.length > 0
      ? selectedModes.filter((mode, index) =>
          selectedModes.indexOf(mode) === index,
        )
      : [...defaultModes];
  const allocations = allocateMinutes(normalizedMinutes);
  const kinds: readonly MissionBlockKind[] = [
    "review",
    "learn",
    "practice",
    "recall",
    "result",
  ];
  const practiceMode = modes[(normalizedDay - 1) % modes.length];

  const blocks = kinds
    .map((kind, index) => {
      if (allocations[index] === 0) return null;
      return {
        kind,
        minutes: allocations[index],
        ...(kind === "practice" ? { practiceMode } : {}),
      };
    })
    .filter((block): block is MissionBlock => block !== null);

  return {
    dayIndex: normalizedDay,
    totalMinutes: normalizedMinutes,
    blocks,
  };
}

export function getMissionDuration(
  mission: DailyMission,
): number {
  return mission.blocks.reduce((total, block) => total + block.minutes, 0);
}
