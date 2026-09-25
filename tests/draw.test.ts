import { describe, expect, it } from "vitest";
import { drawThreeCards } from "@/lib/reading";

describe("drawThreeCards", () => {
  it("draws exactly three unique cards with independently selected orientations", () => {
    const values = [2, 1, 0, 0, 1, 1];
    let cursor = 0;
    const randomInt = (maxExclusive: number) => {
      const value = values[cursor++] % maxExclusive;
      return value;
    };

    const result = drawThreeCards(["a", "b", "c", "d", "e"], randomInt);

    expect(result).toHaveLength(3);
    expect(new Set(result.map((card) => card.cardId)).size).toBe(3);
    expect(result.map((card) => card.orientation)).toEqual([
      "reversed",
      "upright",
      "reversed",
    ]);
  });

  it("does not mutate the source card list", () => {
    const source = ["a", "b", "c"];
    drawThreeCards(source, () => 0);
    expect(source).toEqual(["a", "b", "c"]);
  });

  it("rejects a deck with fewer than three cards", () => {
    expect(() => drawThreeCards(["a", "b"], () => 0)).toThrow(
      "At least three cards are required.",
    );
  });
});
