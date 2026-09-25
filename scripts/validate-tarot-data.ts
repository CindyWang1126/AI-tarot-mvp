import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

const CardSchema = z.object({
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

const cards = z
  .array(CardSchema)
  .parse(JSON.parse(readFileSync(resolve("data/tarot-cards.json"), "utf8")));

const ids = new Set(cards.map((card) => card.id));
if (ids.size !== cards.length) {
  throw new Error("Tarot card IDs must be unique.");
}

const names = new Set(cards.map((card) => card.nameZh));
if (names.size !== cards.length) {
  throw new Error("Tarot card names must be unique.");
}

const knownGap = !cards.some((card) => card.nameZh === "寶劍10");
if (cards.length !== 77 || !knownGap) {
  throw new Error(
    "Expected 77 verified source records with the documented 寶劍10 gap.",
  );
}

console.log(
  "Tarot knowledge validated: 77 unique records; 寶劍10 remains excluded because no source meanings exist.",
);
