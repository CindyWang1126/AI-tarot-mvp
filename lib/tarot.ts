import { z } from "zod";
import tarotCardData from "@/data/tarot-cards.json";

export const TarotCardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  nameZh: z.string().min(1),
  arcana: z.enum(["major", "minor"]),
  suit: z.enum(["cups", "pentacles", "swords", "wands"]).nullable(),
  number: z.number().int().min(0).max(21),
  keywords: z.array(z.string().min(1)).min(1),
  meaningUpright: z.string().min(1),
  meaningReversed: z.string().min(1),
  reflection: z.string().min(1),
  image: z.string().nullable(),
  legacyImage: z.string().min(1),
});

export type TarotCard = z.infer<typeof TarotCardSchema>;

const suits = ["cups", "pentacles", "swords", "wands"] as const;

const suitNames = {
  cups: { en: "Cups", zh: "聖杯" },
  pentacles: { en: "Pentacles", zh: "星幣" },
  swords: { en: "Swords", zh: "寶劍" },
  wands: { en: "Wands", zh: "權杖" },
} as const;

const ranks = {
  1: { slug: "ace", name: "Ace", zh: "一" },
  2: { slug: "two", name: "Two", zh: "二" },
  3: { slug: "three", name: "Three", zh: "三" },
  4: { slug: "four", name: "Four", zh: "四" },
  5: { slug: "five", name: "Five", zh: "五" },
  6: { slug: "six", name: "Six", zh: "六" },
  7: { slug: "seven", name: "Seven", zh: "七" },
  8: { slug: "eight", name: "Eight", zh: "八" },
  9: { slug: "nine", name: "Nine", zh: "九" },
  10: { slug: "ten", name: "Ten", zh: "十" },
  11: { slug: "page", name: "Page", zh: "侍者" },
  12: { slug: "knight", name: "Knight", zh: "騎士" },
  13: { slug: "queen", name: "Queen", zh: "皇后" },
  14: { slug: "king", name: "King", zh: "國王" },
} as const;

function addDeckIssue(context: z.RefinementCtx, message: string): void {
  context.addIssue({ code: "custom", message });
}

export const TarotDeckSchema = z
  .array(TarotCardSchema)
  .superRefine((cards, context) => {
    if (cards.length !== 78) {
      addDeckIssue(context, `Tarot deck must contain 78 cards; received ${cards.length}.`);
    }

    for (const field of ["id", "name", "nameZh"] as const) {
      if (new Set(cards.map((card) => card[field])).size !== cards.length) {
        addDeckIssue(context, `Tarot card ${field} values must be unique.`);
      }
    }

    const majorCards = cards.filter((card) => card.arcana === "major");
    if (majorCards.length !== 22) {
      addDeckIssue(context, `Major Arcana must contain 22 cards; received ${majorCards.length}.`);
    }
    if (
      majorCards.some((card) => card.suit !== null) ||
      !Array.from({ length: 22 }, (_, number) => number).every((number) =>
        majorCards.some((card) => card.number === number),
      )
    ) {
      addDeckIssue(context, "Major Arcana must use a null suit and cover numbers 0 through 21.");
    }

    const minorCards = cards.filter((card) => card.arcana === "minor");
    if (minorCards.length !== 56) {
      addDeckIssue(context, `Minor Arcana must contain 56 cards; received ${minorCards.length}.`);
    }

    for (const suit of suits) {
      const suitCards = minorCards.filter((card) => card.suit === suit);
      if (suitCards.length !== 14) {
        addDeckIssue(context, `${suit} must contain 14 cards; received ${suitCards.length}.`);
      }

      for (const number of Array.from({ length: 14 }, (_, index) => index + 1)) {
        const card = suitCards.find((candidate) => candidate.number === number);
        const rank = ranks[number as keyof typeof ranks];
        const suitName = suitNames[suit];
        if (!card) {
          addDeckIssue(context, `${suit} is missing rank ${number}.`);
          continue;
        }

        const expectedId = `${suit}-${String(number).padStart(2, "0")}-${rank.slug}`;
        const expectedName = `${rank.name} of ${suitName.en}`;
        const expectedNameZh = `${suitName.zh}${rank.zh}`;
        if (
          card.id !== expectedId ||
          card.name !== expectedName ||
          card.nameZh !== expectedNameZh
        ) {
          addDeckIssue(
            context,
            `${suit} rank ${number} has an inconsistent ID, English name, or Chinese name.`,
          );
        }
      }
    }
  });

export const tarotCards = TarotDeckSchema.parse(tarotCardData);
export const tarotCardIds = tarotCards.map((card) => card.id);
export const tarotCardMap = new Map(
  tarotCards.map((card) => [card.id, card] as const),
);

export function getTarotCard(cardId: string): TarotCard | undefined {
  return tarotCardMap.get(cardId);
}
