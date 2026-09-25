import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const sourcePath = resolve("legacy/data/tarot_cards.json");
// This utility preserves the historical 77-card import only. It must never
// overwrite the complete canonical production deck in data/tarot-cards.json.
const outputPath = resolve("legacy/data/tarot-cards.normalized.json");
const source = JSON.parse(readFileSync(sourcePath, "utf8"));

const majors = [
  ["fool", "The Fool"],
  ["magician", "The Magician"],
  ["high-priestess", "The High Priestess"],
  ["empress", "The Empress"],
  ["emperor", "The Emperor"],
  ["hierophant", "The Hierophant"],
  ["lovers", "The Lovers"],
  ["chariot", "The Chariot"],
  ["strength", "Strength"],
  ["hermit", "The Hermit"],
  ["wheel-of-fortune", "Wheel of Fortune"],
  ["justice", "Justice"],
  ["hanged-man", "The Hanged Man"],
  ["death", "Death"],
  ["temperance", "Temperance"],
  ["devil", "The Devil"],
  ["tower", "The Tower"],
  ["star", "The Star"],
  ["moon", "The Moon"],
  ["sun", "The Sun"],
  ["judgement", "Judgement"],
  ["world", "The World"],
];

const suitByZh = {
  "聖杯": ["cups", "Cups"],
  "錢幣": ["pentacles", "Pentacles"],
  "寶劍": ["swords", "Swords"],
  "權杖": ["wands", "Wands"],
};

const ranks = {
  1: ["ace", "Ace"],
  2: ["two", "Two"],
  3: ["three", "Three"],
  4: ["four", "Four"],
  5: ["five", "Five"],
  6: ["six", "Six"],
  7: ["seven", "Seven"],
  8: ["eight", "Eight"],
  9: ["nine", "Nine"],
  10: ["ten", "Ten"],
  11: ["page", "Page"],
  12: ["knight", "Knight"],
  13: ["queen", "Queen"],
  14: ["king", "King"],
};

function keywordsFrom(meaning) {
  return meaning
    .replace(/[。；]/g, "、")
    .split("、")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 4);
}

const normalized = source.map((card, index) => {
  const imageFilename = card.image.replace(/^cards\//, "");
  const keywords = keywordsFrom(card.meaning_up);

  if (index < majors.length) {
    const [slug, englishName] = majors[index];
    return {
      id: `major-${String(index).padStart(2, "0")}-${slug}`,
      name: englishName,
      nameZh: card.name,
      arcana: "major",
      suit: null,
      number: index,
      keywords,
      meaningUpright: card.meaning_up,
      meaningReversed: card.meaning_rev,
      reflection: `當「${keywords[0]}」成為線索，現在最值得重新看見的是什麼？`,
      image: null,
      legacyImage: `legacy/assets/cards/${imageFilename}`,
    };
  }

  const match = card.name.match(/^(聖杯|錢幣|寶劍|權杖)(\d+)$/);
  if (!match) {
    throw new Error(`無法解析小阿爾克那名稱：${card.name}`);
  }

  const [, suitZh, numberText] = match;
  const number = Number(numberText);
  const [suit, suitEn] = suitByZh[suitZh];
  const [rankSlug, rankEn] = ranks[number];

  return {
    id: `${suit}-${String(number).padStart(2, "0")}-${rankSlug}`,
    name: `${rankEn} of ${suitEn}`,
    nameZh: card.name,
    arcana: "minor",
    suit,
    number,
    keywords,
    meaningUpright: card.meaning_up,
    meaningReversed: card.meaning_rev,
    reflection: `當「${keywords[0]}」成為線索，這個情境還能從哪個角度理解？`,
    image: null,
    legacyImage: `legacy/assets/cards/${imageFilename}`,
  };
});

writeFileSync(outputPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
console.log(`Normalized ${normalized.length} verified cards to ${outputPath}`);
