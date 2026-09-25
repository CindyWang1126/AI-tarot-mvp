import {
  orientationLabel,
  spreadPositions,
  type DrawnCard,
} from "@/lib/reading";
import type { TarotCard } from "@/lib/tarot";

const suitSymbols: Record<string, string> = {
  cups: "◡",
  pentacles: "◇",
  swords: "†",
  wands: "│",
};

type TarotCardProps = {
  card: TarotCard;
  drawn: DrawnCard;
  index: number;
  revealed: boolean;
  onReveal?: () => void;
  disabled?: boolean;
};

export function TarotCardVisual({
  card,
  drawn,
  index,
  revealed,
  onReveal,
  disabled,
}: TarotCardProps) {
  const position = spreadPositions[index];
  const symbol = card.suit ? suitSymbols[card.suit] : "✦";
  const orientation = orientationLabel(drawn.orientation);

  return (
    <article className="drawn-card-wrap">
      <p className="position-index">0{index + 1}</p>
      <h3>{position.label}</h3>
      <p className="position-copy">{position.description}</p>
      <button
        type="button"
        className={`tarot-card ${revealed ? "is-revealed" : "is-hidden"}`}
        onClick={onReveal}
        disabled={disabled || revealed}
        aria-label={
          revealed
            ? `${position.label}：${card.nameZh}，${orientation}`
            : `翻開${position.label}的牌`
        }
      >
        <span className="card-inner">
          <span className="card-back" aria-hidden={revealed}>
            <span className="card-back-frame">
              <span className="orbit orbit-one" />
              <span className="orbit orbit-two" />
              <span className="orbit-core">T</span>
            </span>
            <span className="reveal-hint">點擊翻牌</span>
          </span>
          <span className="card-face" aria-hidden={!revealed}>
            <span className="card-meta">
              {card.arcana === "major" ? "MAJOR ARCANA" : "MINOR ARCANA"}
            </span>
            <span
              className={`card-symbol ${
                drawn.orientation === "reversed" ? "is-reversed" : ""
              }`}
              aria-hidden="true"
            >
              {symbol}
            </span>
            <span className="card-name-en">{card.name}</span>
            <strong>{card.nameZh}</strong>
            <span className="orientation-pill">{orientation}</span>
          </span>
        </span>
      </button>
    </article>
  );
}
