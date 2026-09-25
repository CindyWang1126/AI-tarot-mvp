import { describe, expect, it } from "vitest";
import {
  ReadingRequestSchema,
  ReadingResultSchema,
  spreadPositions,
} from "@/lib/reading";
import { tarotCards } from "@/lib/tarot";

describe("ReadingRequestSchema", () => {
  const validRequest = {
    question: "我接下來可以從哪些角度思考？",
    category: "general",
    readingId: crypto.randomUUID(),
    cards: tarotCards.slice(0, 3).map((card) => ({
      cardId: card.id,
      orientation: "upright",
    })),
  };

  it("accepts a valid three-card request", () => {
    expect(ReadingRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  it("rejects duplicate card IDs", () => {
    const duplicate = {
      ...validRequest,
      cards: [validRequest.cards[0], validRequest.cards[0], validRequest.cards[2]],
    };
    expect(ReadingRequestSchema.safeParse(duplicate).success).toBe(false);
  });

  it("rejects oversized questions", () => {
    expect(
      ReadingRequestSchema.safeParse({ ...validRequest, question: "問".repeat(261) }).success,
    ).toBe(false);
  });
});

describe("ReadingResultSchema", () => {
  it("requires exactly three structured card interpretations", () => {
    const card = tarotCards[0];
    const result = {
      questionSummary: "問題摘要",
      readingTone: "清楚而務實",
      cards: spreadPositions.map((position) => ({
        position: position.id,
        cardId: card.id,
        cardName: card.nameZh,
        orientation: "upright",
        interpretation: "個別解讀",
        connectionToQuestion: "與問題的連結",
      })),
      relationship: "三張牌的互動",
      overallReading: "整體解讀",
      actionAdvice: ["先整理現況", "再確認下一步"],
      reflectionQuestion: "最值得先改變的是什麼？",
    };

    expect(ReadingResultSchema.safeParse(result).success).toBe(true);
    expect(
      ReadingResultSchema.safeParse({ ...result, cards: result.cards.slice(0, 2) }).success,
    ).toBe(false);
  });
});
