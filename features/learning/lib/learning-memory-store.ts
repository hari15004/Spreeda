import {
  initialLearningMemory,
  parseLearningMemory,
  recordRecall,
  recordSkillResult,
} from "@/features/learning/lib/learning-memory";
import type { LearningSkill } from "@/features/learning/types/learning";

export const learningMemoryKey = "spreeda-learning-memory-v1";
const learningMemoryChangeEvent = "spreeda-learning-memory-change";

export function subscribeToLearningMemory(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(learningMemoryChangeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(learningMemoryChangeEvent, onChange);
  };
}

export function getLearningMemorySnapshot() {
  try {
    return window.localStorage.getItem(learningMemoryKey) ?? "";
  } catch {
    return "storage-error";
  }
}

export function getServerLearningMemorySnapshot() {
  return "";
}

export function saveAssessment(
  itemId: string,
  skill: LearningSkill,
  correct: boolean,
  now = new Date(),
) {
  const saved = getLearningMemorySnapshot();
  const memory =
    saved === "storage-error" ? initialLearningMemory : parseLearningMemory(saved);
  const next = recordSkillResult(
    recordRecall(memory, itemId, correct, now),
    skill,
    correct,
    now,
  );

  try {
    window.localStorage.setItem(learningMemoryKey, JSON.stringify(next));
  } catch {
    return false;
  }

  window.dispatchEvent(new Event(learningMemoryChangeEvent));
  return true;
}
