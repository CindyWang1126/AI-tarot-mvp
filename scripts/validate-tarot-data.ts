import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { tarotCardIds, tarotCardMap, tarotCards } from "../lib/tarot";

const counts = {
  major: tarotCards.filter((card) => card.arcana === "major").length,
  minor: tarotCards.filter((card) => card.arcana === "minor").length,
  cups: tarotCards.filter((card) => card.suit === "cups").length,
  pentacles: tarotCards.filter((card) => card.suit === "pentacles").length,
  swords: tarotCards.filter((card) => card.suit === "swords").length,
  wands: tarotCards.filter((card) => card.suit === "wands").length,
};

const missingLegacyImages = tarotCards.filter(
  (card) => !existsSync(resolve(card.legacyImage)),
);
if (missingLegacyImages.length > 0) {
  throw new Error(
    `Missing legacy image mappings: ${missingLegacyImages
      .map((card) => `${card.id} -> ${card.legacyImage}`)
      .join(", ")}`,
  );
}

if (tarotCardIds.length !== 78 || tarotCardMap.size !== 78) {
  throw new Error("The production draw pool must contain exactly 78 unique cards.");
}

console.log(
  `Tarot knowledge validated: ${tarotCards.length} cards; ` +
    `${counts.major} Major; ${counts.minor} Minor; ` +
    `Cups ${counts.cups}; Pentacles ${counts.pentacles}; ` +
    `Swords ${counts.swords}; Wands ${counts.wands}; ` +
    `draw pool ${tarotCardIds.length}; missing legacy images ${missingLegacyImages.length}.`,
);
