import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { drawThreeCards } from "@/lib/reading";
import { tarotCardIds, tarotCardMap, tarotCards } from "@/lib/tarot";

const suitCounts = Object.fromEntries(
  ["wands", "cups", "swords", "pentacles"].map((suit) => [
    suit,
    tarotCards.filter((card) => card.suit === suit).length,
  ]),
);

describe("canonical Tarot knowledge", () => {
  it("contains the complete standard 78-card deck", () => {
    expect(tarotCards).toHaveLength(78);
    expect(tarotCards.filter((card) => card.arcana === "major")).toHaveLength(22);
    expect(tarotCards.filter((card) => card.arcana === "minor")).toHaveLength(56);
    expect(suitCounts).toEqual({
      wands: 14,
      cups: 14,
      swords: 14,
      pentacles: 14,
    });
  });

  it("contains exactly one complete Ten of Swords record", () => {
    const matches = tarotCards.filter(
      (card) =>
        card.id === "swords-10-ten" &&
        card.name === "Ten of Swords" &&
        card.nameZh === "寶劍10" &&
        card.suit === "swords" &&
        card.number === 10,
    );

    expect(matches).toHaveLength(1);
    expect(matches[0].meaningUpright.trim()).not.toBe("");
    expect(matches[0].meaningReversed.trim()).not.toBe("");
  });

  it("has unique IDs and complete meanings for every card", () => {
    expect(new Set(tarotCards.map((card) => card.id)).size).toBe(78);
    expect(
      tarotCards.every(
        (card) =>
          card.keywords.length > 0 &&
          card.meaningUpright.trim().length > 0 &&
          card.meaningReversed.trim().length > 0 &&
          card.reflection.trim().length > 0,
      ),
    ).toBe(true);
  });

  it("maps every card to an existing legacy image or the production fallback", () => {
    expect(tarotCards.every((card) => existsSync(resolve(card.legacyImage)))).toBe(true);
    expect(tarotCards.every((card) => card.image === null)).toBe(true);
  });
});

describe("production draw pool", () => {
  it("contains all 78 canonical cards exactly once", () => {
    expect(tarotCardIds).toHaveLength(78);
    expect(new Set(tarotCardIds).size).toBe(78);
    expect(tarotCardMap.size).toBe(78);
    expect(tarotCardIds).toEqual(tarotCards.map((card) => card.id));
  });

  it("allows every canonical card to be selected by the production draw function", () => {
    for (const [targetIndex, cardId] of tarotCardIds.entries()) {
      let callIndex = 0;
      const drawn = drawThreeCards(tarotCardIds, () => {
        const value = callIndex === 0 ? targetIndex : 0;
        callIndex += 1;
        return value;
      });

      expect(drawn[0].cardId).toBe(cardId);
    }
  });
});
