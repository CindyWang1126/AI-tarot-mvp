import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";

type Suit = "cups" | "pentacles" | "swords" | "wands";

type Card = {
  id: string;
  name: string;
  nameZh: string;
  arcana: "major" | "minor";
  suit: Suit | null;
  number: number;
  image: string | null;
  legacyImage: string;
  [key: string]: unknown;
};

const root = process.cwd();
const dataPath = join(root, "data", "tarot-cards.json");
const outputDir = join(root, "public", "cards");
const cards = JSON.parse(readFileSync(dataPath, "utf8")) as Card[];

const suitNames: Record<Suit, string> = {
  wands: "權杖",
  cups: "聖杯",
  swords: "寶劍",
  pentacles: "星幣",
};

const rankNames: Record<number, string> = {
  1: "一",
  2: "二",
  3: "三",
  4: "四",
  5: "五",
  6: "六",
  7: "七",
  8: "八",
  9: "九",
  10: "十",
  11: "侍者",
  12: "騎士",
  13: "皇后",
  14: "國王",
};

mkdirSync(outputDir, { recursive: true });

for (const card of cards) {
  const filename = `${card.id}.jpeg`;
  copyFileSync(resolve(root, card.legacyImage), join(outputDir, filename));
  card.image = `/cards/${filename}`;

  if (card.arcana === "minor" && card.suit) {
    card.nameZh = `${suitNames[card.suit]}${rankNames[card.number]}`;
  }
}

writeFileSync(dataPath, `${JSON.stringify(cards, null, 2)}\n`, "utf8");
console.log(
  `Prepared ${cards.length} fixed illustrated Tarot assets in public/cards.`,
);
