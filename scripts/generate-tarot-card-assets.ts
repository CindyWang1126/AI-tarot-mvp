import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Card = {
  id: string;
  name: string;
  nameZh: string;
  arcana: "major" | "minor";
  suit: "cups" | "pentacles" | "swords" | "wands" | null;
  number: number;
  image: string | null;
  [key: string]: unknown;
};

const root = process.cwd();
const dataPath = join(root, "data", "tarot-cards.json");
const outputDir = join(root, "public", "cards");
const cards = JSON.parse(readFileSync(dataPath, "utf8")) as Card[];

mkdirSync(outputDir, { recursive: true });

const palettes = {
  major: {
    top: "#5b204f",
    middle: "#281431",
    bottom: "#101a34",
    accent: "#e6c57d",
    secondary: "#9bd6ef",
    glow: "#c56da8",
  },
  cups: {
    top: "#273f69",
    middle: "#29204c",
    bottom: "#17112a",
    accent: "#b9e5f7",
    secondary: "#d6b0d2",
    glow: "#70badd",
  },
  pentacles: {
    top: "#29483f",
    middle: "#242f39",
    bottom: "#17162a",
    accent: "#e3c77f",
    secondary: "#9fcfc4",
    glow: "#b49b55",
  },
  swords: {
    top: "#24405a",
    middle: "#202742",
    bottom: "#141226",
    accent: "#d9e8f1",
    secondary: "#9fc9e0",
    glow: "#779fc3",
  },
  wands: {
    top: "#682c43",
    middle: "#3d1c35",
    bottom: "#17142a",
    accent: "#edc074",
    secondary: "#d89aae",
    glow: "#d16c72",
  },
} as const;

const majorSymbols = [
  "○", "✦", "◐", "❋", "△", "◇", "∞", "⌁", "☼", "☽", "✺",
  "⚖", "⌛", "✧", "◈", "⚡", "✶", "☾", "☀", "◉", "✹", "◎",
];

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return entities[character];
  });
}

function hash(value: string): number {
  return [...value].reduce((total, character) => {
    return (total * 31 + character.charCodeAt(0)) >>> 0;
  }, 2166136261);
}

function roman(value: number): string {
  if (value === 0) return "0";
  const numerals: Array<[number, string]> = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let remaining = value;
  let result = "";
  for (const [amount, symbol] of numerals) {
    while (remaining >= amount) {
      result += symbol;
      remaining -= amount;
    }
  }
  return result;
}

function radialBeams(accent: string): string {
  return Array.from({ length: 44 }, (_, index) => {
    const angle = (index / 44) * Math.PI * 2;
    const inner = 92;
    const outer = index % 2 === 0 ? 310 : 265;
    const x1 = 300 + Math.cos(angle) * inner;
    const y1 = 402 + Math.sin(angle) * inner;
    const x2 = 300 + Math.cos(angle) * outer;
    const y2 = 402 + Math.sin(angle) * outer;
    const opacity = index % 4 === 0 ? 0.2 : 0.08;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${accent}" stroke-opacity="${opacity}" stroke-width="1" />`;
  }).join("");
}

function flowMark(secondary: string): string {
  return `
    <circle cx="300" cy="405" r="112" fill="none" stroke="${secondary}" stroke-opacity=".7" stroke-width="3" />
    <path d="M211 430 C248 478 327 478 389 418 C357 443 296 450 246 420" fill="none" stroke="${secondary}" stroke-width="10" stroke-linecap="round" opacity=".82" />
    <path d="M300 356 L300 407 L348 378" fill="none" stroke="${secondary}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity=".9" />
  `;
}

function suitGlyph(suit: NonNullable<Card["suit"]>, x: number, y: number, scale = 1): string {
  const transform = `translate(${x} ${y}) scale(${scale})`;
  if (suit === "cups") {
    return `<g transform="${transform}" fill="none" stroke="currentColor" stroke-width="5"><path d="M-28 -28 H28 C28 8 17 29 0 31 C-17 29 -28 8 -28 -28 Z"/><path d="M0 31 V51 M-19 53 H19"/></g>`;
  }
  if (suit === "pentacles") {
    const points = Array.from({ length: 5 }, (_, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 4) / 5;
      return `${(Math.cos(angle) * 31).toFixed(1)},${(Math.sin(angle) * 31).toFixed(1)}`;
    }).join(" ");
    return `<g transform="${transform}" fill="none" stroke="currentColor" stroke-width="4"><circle r="39"/><polyline points="${points}"/></g>`;
  }
  if (suit === "swords") {
    return `<g transform="${transform}" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><path d="M0 -47 L8 28 L0 42 L-8 28 Z"/><path d="M-25 24 H25"/></g>`;
  }
  return `<g transform="${transform}" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"><path d="M-8 48 C-2 14 -12 -17 8 -49"/><path d="M2 -22 C24 -30 23 -45 29 -53 M-4 6 C-23 -1 -25 -18 -31 -24"/></g>`;
}

function minorMotif(card: Card, accent: string, secondary: string): string {
  const suit = card.suit as NonNullable<Card["suit"]>;
  if (card.number <= 10) {
    const columns = card.number <= 3 ? card.number : card.number <= 6 ? 3 : 4;
    const rows = Math.ceil(card.number / columns);
    const gapX = columns === 1 ? 0 : 190 / (columns - 1);
    const gapY = rows === 1 ? 0 : 210 / (rows - 1);
    const glyphs = Array.from({ length: card.number }, (_, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = columns === 1 ? 300 : 205 + column * gapX;
      const y = rows === 1 ? 405 : 300 + row * gapY;
      const scale = card.number <= 3 ? 1.12 : card.number <= 6 ? 0.78 : 0.61;
      return suitGlyph(suit, x, y, scale);
    }).join("");
    return `<g style="color:${accent}" filter="url(#softGlow)">${glyphs}</g>`;
  }

  const courtLabels: Record<number, string> = {
    11: "PAGE",
    12: "KNIGHT",
    13: "QUEEN",
    14: "KING",
  };
  return `
    <g style="color:${accent}" filter="url(#softGlow)">
      <path d="M213 326 L250 272 L300 314 L350 272 L387 326 L370 370 H230 Z" fill="none" stroke="${accent}" stroke-width="5" />
      ${suitGlyph(suit, 300, 427, 1.55)}
      <path d="M230 520 Q300 565 370 520" fill="none" stroke="${secondary}" stroke-width="3" opacity=".75" />
    </g>
    <text x="300" y="595" fill="${secondary}" text-anchor="middle" font-size="22" letter-spacing="8">${courtLabels[card.number]}</text>
  `;
}

function majorMotif(card: Card, accent: string, secondary: string): string {
  const seed = hash(card.id);
  const nodes = 4 + (card.number % 6);
  const nodeMarkup = Array.from({ length: nodes }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / nodes;
    const radius = 120 + ((seed + index) % 3) * 11;
    const x = 300 + Math.cos(angle) * radius;
    const y = 402 + Math.sin(angle) * radius;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${index % 2 === 0 ? 5 : 3}" fill="${index % 2 === 0 ? accent : secondary}" opacity=".82" />`;
  }).join("");
  return `
    ${flowMark(secondary)}
    <circle cx="300" cy="402" r="149" fill="none" stroke="${accent}" stroke-opacity=".36" stroke-width="2" stroke-dasharray="3 12" />
    ${nodeMarkup}
    <text x="300" y="424" fill="${accent}" text-anchor="middle" font-family="Georgia, serif" font-size="88" filter="url(#softGlow)">${majorSymbols[card.number]}</text>
  `;
}

function renderCard(card: Card): string {
  const palette = card.arcana === "major" ? palettes.major : palettes[card.suit as NonNullable<Card["suit"]>];
  const seed = hash(card.id);
  const glowX = 30 + (seed % 40);
  const glowY = 23 + ((seed >>> 4) % 35);
  const motif = card.arcana === "major"
    ? majorMotif(card, palette.accent, palette.secondary)
    : minorMotif(card, palette.accent, palette.secondary);
  const numberLabel = card.arcana === "major" ? roman(card.number) : String(card.number).padStart(2, "0");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 1000" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(card.name)}</title>
  <desc id="desc">Original Timeflow AI Tarot card artwork for ${escapeXml(card.name)}</desc>
  <defs>
    <linearGradient id="cardBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.top}" />
      <stop offset=".5" stop-color="${palette.middle}" />
      <stop offset="1" stop-color="${palette.bottom}" />
    </linearGradient>
    <radialGradient id="innerGlow" cx="${glowX}%" cy="${glowY}%" r="72%">
      <stop offset="0" stop-color="${palette.glow}" stop-opacity=".42" />
      <stop offset=".46" stop-color="${palette.secondary}" stop-opacity=".1" />
      <stop offset="1" stop-color="#050711" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="frame" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.accent}" />
      <stop offset=".5" stop-color="${palette.secondary}" />
      <stop offset="1" stop-color="${palette.accent}" />
    </linearGradient>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="innerClip"><rect x="43" y="43" width="514" height="914" rx="24" /></clipPath>
  </defs>
  <rect width="600" height="1000" rx="32" fill="#080611" />
  <rect x="10" y="10" width="580" height="980" rx="28" fill="url(#cardBg)" stroke="${palette.accent}" stroke-opacity=".7" stroke-width="2" />
  <g clip-path="url(#innerClip)">
    <rect x="22" y="22" width="556" height="956" fill="url(#innerGlow)" />
    <g>${radialBeams(palette.accent)}</g>
    <circle cx="300" cy="402" r="250" fill="none" stroke="${palette.secondary}" stroke-opacity=".13" />
    <circle cx="300" cy="402" r="218" fill="none" stroke="${palette.accent}" stroke-opacity=".13" stroke-dasharray="2 15" />
    ${motif}
  </g>
  <rect x="28" y="28" width="544" height="944" rx="24" fill="none" stroke="url(#frame)" stroke-opacity=".78" stroke-width="2" />
  <rect x="42" y="42" width="516" height="916" rx="20" fill="none" stroke="${palette.secondary}" stroke-opacity=".22" />
  <path d="M42 103 H120 M480 103 H558 M42 897 H120 M480 897 H558" stroke="${palette.accent}" stroke-opacity=".65" stroke-width="2" />
  <path d="M92 42 V92 M508 42 V92 M92 958 V908 M508 958 V908" stroke="${palette.secondary}" stroke-opacity=".4" stroke-width="2" />
  <circle cx="300" cy="86" r="4" fill="${palette.accent}" filter="url(#softGlow)" />
  <text x="300" y="132" fill="${palette.secondary}" text-anchor="middle" font-family="Georgia, serif" font-size="17" letter-spacing="7">${card.arcana === "major" ? "MAJOR ARCANA" : card.suit?.toUpperCase()}</text>
  <text x="300" y="770" fill="${palette.accent}" text-anchor="middle" font-family="Georgia, serif" font-size="25" letter-spacing="5">${numberLabel}</text>
  <text x="300" y="842" fill="#f4edf1" text-anchor="middle" font-family="Georgia, serif" font-size="${card.name.length > 18 ? 25 : 30}" letter-spacing="2">${escapeXml(card.name.toUpperCase())}</text>
  <line x1="190" y1="873" x2="410" y2="873" stroke="url(#frame)" stroke-opacity=".55" />
  <path d="M250 914 C273 937 327 937 350 914 C326 926 274 926 250 914" fill="none" stroke="${palette.secondary}" stroke-opacity=".55" stroke-width="3" />
</svg>`;
}

for (const card of cards) {
  const filename = `${card.id}.svg`;
  writeFileSync(join(outputDir, filename), renderCard(card), "utf8");
  card.image = `/cards/${filename}`;
}

writeFileSync(dataPath, `${JSON.stringify(cards, null, 2)}\n`, "utf8");
console.log(`Generated ${cards.length} original Tarot card assets in public/cards.`);
