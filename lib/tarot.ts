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

export const tarotCards = z.array(TarotCardSchema).parse(tarotCardData);
export const tarotCardIds = tarotCards.map((card) => card.id);
export const tarotCardMap = new Map(
  tarotCards.map((card) => [card.id, card] as const),
);

export function getTarotCard(cardId: string): TarotCard | undefined {
  return tarotCardMap.get(cardId);
}
