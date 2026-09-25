import {
  categoryLabel,
  orientationLabel,
  spreadPositions,
  type StoredReading,
} from "@/lib/reading";
import { tarotCardMap } from "@/lib/tarot";

type ReadingResultProps = {
  reading: StoredReading;
  copied: boolean;
  onCopy: () => void;
  onReset: () => void;
};

export function ReadingResult({
  reading,
  copied,
  onCopy,
  onReset,
}: ReadingResultProps) {
  if (!reading.result) return null;

  return (
    <section className="result-shell" aria-labelledby="result-title">
      <div className="result-heading">
        <div>
          <p className="eyebrow">YOUR READING</p>
          <h2 id="result-title">這次的三張牌</h2>
        </div>
        <div className="result-actions">
          <button type="button" className="button ghost" onClick={onCopy}>
            {copied ? "已複製" : "複製解讀"}
          </button>
          <button type="button" className="button secondary" onClick={onReset}>
            重新開始
          </button>
        </div>
      </div>

      <div className="question-summary">
        <span>{categoryLabel(reading.category)}</span>
        <blockquote>「{reading.question}」</blockquote>
        <p>{reading.result.questionSummary}</p>
      </div>

      <div className="result-card-grid">
        {reading.result.cards.map((interpretation, index) => {
          const drawn = reading.cards[index];
          const card = tarotCardMap.get(drawn.cardId);
          const position = spreadPositions[index];
          if (!card) return null;

          return (
            <article className="interpretation-card" key={interpretation.cardId}>
              <div className="interpretation-topline">
                <span>0{index + 1}</span>
                <span>{position.label}</span>
              </div>
              <div className="mini-card-mark" aria-hidden="true">
                <span>{card.arcana === "major" ? "✦" : "◇"}</span>
              </div>
              <div className="card-title-row">
                <div>
                  <p>{card.name}</p>
                  <h3>{card.nameZh}</h3>
                </div>
                <span className="orientation-pill">
                  {orientationLabel(drawn.orientation)}
                </span>
              </div>
              <p>{interpretation.interpretation}</p>
              <div className="connection-block">
                <strong>與問題的連結</strong>
                <p>{interpretation.connectionToQuestion}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="analysis-grid">
        <article className="analysis-panel">
          <p className="section-label">牌與牌之間</p>
          <h3>脈絡、張力與新的線索</h3>
          <p>{reading.result.relationship}</p>
        </article>
        <article className="analysis-panel emphasis">
          <p className="section-label">整體解讀</p>
          <h3>{reading.result.readingTone}</h3>
          <p>{reading.result.overallReading}</p>
        </article>
      </div>

      <div className="advice-grid">
        <article>
          <p className="section-label">可以帶走的幾個方向</p>
          <h3>接下來，可以從這裡開始</h3>
          <ol>
            {reading.result.actionAdvice.map((advice, index) => (
              <li key={advice}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{advice}</p>
              </li>
            ))}
          </ol>
        </article>
        <aside className="reflection-panel">
          <span aria-hidden="true">?</span>
          <p className="section-label">留給您的問題</p>
          <blockquote>{reading.result.reflectionQuestion}</blockquote>
        </aside>
      </div>
    </section>
  );
}
