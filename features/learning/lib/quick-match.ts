import type {
  LearningItem,
  UiLanguage,
} from "@/features/learning/types/learning";

export type QuickMatchRound = {
  item: LearningItem;
  prompt: string;
  promptType: "meaning" | "reading";
  options: string[];
};

const maxRounds = 5;
const maxOptions = 4;

function shuffle<T>(values: readonly T[], random: () => number) {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled;
}

export function createQuickMatchRounds(
  items: readonly LearningItem[],
  language: UiLanguage,
  random: () => number = Math.random,
): QuickMatchRound[] {
  const seenTargetTexts = new Set<string>();
  const uniqueItems = items.filter((item) => {
    const targetText = item.targetText.trim();
    if (!targetText || seenTargetTexts.has(targetText)) return false;
    seenTargetTexts.add(targetText);
    return true;
  });

  if (uniqueItems.length < 2) return [];

  return shuffle(uniqueItems, random)
    .slice(0, maxRounds)
    .map((item) => {
      const meaning = item.meaning?.[language] ?? item.meaning?.en;
      const distractors = uniqueItems.filter(
        (candidate) => candidate.targetText !== item.targetText,
      );
      const options = shuffle(
        [
          item.targetText,
          ...shuffle(distractors, random)
            .slice(0, maxOptions - 1)
            .map((candidate) => candidate.targetText),
        ],
        random,
      );

      return {
        item,
        prompt: meaning ?? item.reading,
        promptType: meaning ? "meaning" : "reading",
        options,
      };
    });
}
