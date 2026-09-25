import Image from "next/image";
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
              <span className="oracle-seal">
                <span className="oracle-ring" />
                <span className="oracle-hand" />
                <span className="oracle-wave" />
                <span className="oracle-star" />
              </span>
            </span>
            <span className="reveal-hint">輕觸揭開</span>
          </span>
          <span className="card-face" aria-hidden={!revealed}>
            {card.image ? (
              <Image
                src={card.image}
                alt=""
                width={600}
                height={1000}
                sizes="(max-width: 768px) 78vw, 245px"
                className={`card-art ${
                  drawn.orientation === "reversed" ? "is-reversed" : ""
                }`}
              />
            ) : (
              <span className="card-art-fallback" aria-hidden="true">
                <span className="card-meta">
                  {card.arcana === "major" ? "MAJOR ARCANA" : "MINOR ARCANA"}
                </span>
                <span
                  className={`card-symbol ${
                    drawn.orientation === "reversed" ? "is-reversed" : ""
                  }`}
                >
                  {symbol}
                </span>
                <span className="card-name-en">{card.name}</span>
                <strong>{card.nameZh}</strong>
              </span>
            )}
            <span className="card-face-caption">
              <span>{card.nameZh}</span>
              <span className="orientation-pill">{orientation}</span>
            </span>
          </span>
        </span>
      </button>
    </article>
  );
}
