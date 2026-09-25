import { z } from "zod";

export const MAX_QUESTION_LENGTH = 260;
export const READING_STORAGE_KEY = "timeflow.ai-tarot.current-reading";
export const READING_VERSION = 1 as const;

export const categories = [
  { value: "love", label: "感情", context: "不要假設第三方未表達的想法或意圖。" },
  { value: "career", label: "工作", context: "提供可實踐、但不武斷的職涯反思。" },
  { value: "finance", label: "財務", context: "不得提供特定投資買賣或報酬保證。" },
  { value: "relationship", label: "人際", context: "避免替他人下定論，聚焦可觀察的互動。" },
  { value: "general", label: "一般", context: "聚焦情境釐清與下一個可控步驟。" },
] as const;

export const CategorySchema = z.enum([
  "love",
  "career",
  "finance",
  "relationship",
  "general",
]);
export type Category = z.infer<typeof CategorySchema>;

export const spreadPositions = [
  {
    id: "background",
    label: "背景 / 過去影響",
    description: "看見塑造目前情境的脈絡與既有慣性。",
  },
  {
    id: "present",
    label: "現況 / 核心能量",
    description: "辨認此刻最需要理解的核心狀態。",
  },
  {
    id: "direction",
    label: "建議 / 發展方向",
    description: "探索可以採取的方向與值得留意的訊號。",
  },
] as const;

export const PositionIdSchema = z.enum([
  "background",
  "present",
  "direction",
]);
export const OrientationSchema = z.enum(["upright", "reversed"]);

export const DrawnCardSchema = z.object({
  cardId: z.string().min(1),
  orientation: OrientationSchema,
});
export type DrawnCard = z.infer<typeof DrawnCardSchema>;

export const ReadingRequestSchema = z
  .object({
    question: z.string().trim().min(1).max(MAX_QUESTION_LENGTH),
    category: CategorySchema,
    readingId: z.uuid(),
    cards: z.array(DrawnCardSchema).length(3),
  })
  .superRefine((value, context) => {
    if (new Set(value.cards.map((card) => card.cardId)).size !== 3) {
      context.addIssue({
        code: "custom",
        path: ["cards"],
        message: "Cards must be unique.",
      });
    }
  });
export type ReadingRequest = z.infer<typeof ReadingRequestSchema>;

export const CardInterpretationSchema = z.object({
  position: PositionIdSchema,
  cardId: z.string().min(1),
  cardName: z.string().min(1),
  orientation: OrientationSchema,
  interpretation: z.string().min(1),
  connectionToQuestion: z.string().min(1),
});

export const ReadingResultSchema = z.object({
  questionSummary: z.string().min(1),
  readingTone: z.string().min(1),
  cards: z.array(CardInterpretationSchema).length(3),
  relationship: z.string().min(1),
  overallReading: z.string().min(1),
  actionAdvice: z.array(z.string().min(1)).min(2).max(4),
  reflectionQuestion: z.string().min(1),
});
export type ReadingResult = z.infer<typeof ReadingResultSchema>;

export const StoredReadingSchema = z.object({
  version: z.literal(READING_VERSION),
  readingId: z.uuid(),
  question: z.string().trim().min(1).max(MAX_QUESTION_LENGTH),
  category: CategorySchema,
  cards: z.array(DrawnCardSchema).length(3),
  createdAt: z.iso.datetime(),
  promptVersion: z.string().min(1),
  result: ReadingResultSchema.nullable(),
});
export type StoredReading = z.infer<typeof StoredReadingSchema>;

export function secureRandomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new RangeError("maxExclusive must be a positive integer.");
  }

  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - ((maxUint32 + 1) % maxExclusive);
  const values = new Uint32Array(1);
  let value = 0;

  do {
    crypto.getRandomValues(values);
    value = values[0];
  } while (value > limit);

  return value % maxExclusive;
}

export function drawThreeCards(
  cardIds: readonly string[],
  randomInt: (maxExclusive: number) => number = secureRandomInt,
): DrawnCard[] {
  if (cardIds.length < 3) {
    throw new Error("At least three cards are required.");
  }

  const pool = [...cardIds];
  const drawn: DrawnCard[] = [];

  for (let index = 0; index < 3; index += 1) {
    const selectedIndex = randomInt(pool.length);
    const [cardId] = pool.splice(selectedIndex, 1);
    drawn.push({
      cardId,
      orientation: randomInt(2) === 0 ? "upright" : "reversed",
    });
  }

  return drawn;
}

export function createSelectionDeck(
  cardIds: readonly string[],
  randomInt: (maxExclusive: number) => number = secureRandomInt,
): DrawnCard[] {
  if (cardIds.length < 3) {
    throw new Error("At least three cards are required.");
  }

  const shuffledIds = [...cardIds];
  for (let index = shuffledIds.length - 1; index > 0; index -= 1) {
    const selectedIndex = randomInt(index + 1);
    [shuffledIds[index], shuffledIds[selectedIndex]] = [
      shuffledIds[selectedIndex],
      shuffledIds[index],
    ];
  }

  return shuffledIds.map((cardId) => ({
    cardId,
    orientation: randomInt(2) === 0 ? "upright" : "reversed",
  }));
}

export function categoryLabel(category: Category): string {
  return categories.find((item) => item.value === category)?.label ?? "一般";
}

export function orientationLabel(orientation: DrawnCard["orientation"]): string {
  return orientation === "upright" ? "正位" : "逆位";
}
