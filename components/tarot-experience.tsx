"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ReadingResult } from "@/components/reading-result";
import { TarotCardVisual } from "@/components/tarot-card";
import { PROMPT_VERSION } from "@/lib/version";
import {
  MAX_QUESTION_LENGTH,
  READING_VERSION,
  ReadingResultSchema,
  categories,
  categoryLabel,
  createSelectionDeck,
  orientationLabel,
  type Category,
  type ReadingResult as ReadingResultData,
  type StoredReading,
} from "@/lib/reading";
import {
  clearStoredReading,
  readStoredReading,
  writeStoredReading,
} from "@/lib/storage";
import { tarotCardIds, tarotCardMap } from "@/lib/tarot";

type Phase =
  | "idle"
  | "question_ready"
  | "shuffling"
  | "selecting"
  | "cards_drawn"
  | "revealing"
  | "generating"
  | "complete"
  | "error";

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

function resultMatchesDraw(
  result: ReadingResultData,
  reading: StoredReading,
): boolean {
  return result.cards.every((card, index) => {
    const drawn = reading.cards[index];
    const trustedCard = tarotCardMap.get(drawn.cardId);
    return (
      card.cardId === drawn.cardId &&
      card.orientation === drawn.orientation &&
      card.cardName === trustedCard?.nameZh
    );
  });
}

export function TarotExperience() {
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState<Category>("general");
  const [phase, setPhase] = useState<Phase>("idle");
  const [reading, setReading] = useState<StoredReading | null>(null);
  const [selectionDeck, setSelectionDeck] = useState<StoredReading["cards"]>([]);
  const [selectedDeckIndices, setSelectedDeckIndices] = useState<number[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const activeRequest = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const restored = readStoredReading(window.localStorage);
      if (restored) {
        setReading(restored);
        setQuestion(restored.question);
        setCategory(restored.category);
        setRevealedCount(restored.result ? 3 : 0);
        setPhase(restored.result ? "complete" : "cards_drawn");
      }
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const requestReading = useCallback(async (currentReading: StoredReading) => {
    if (activeRequest.current) return;
    activeRequest.current = true;
    setPhase("generating");
    setErrorMessage("");

    try {
      const response = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentReading.question,
          category: currentReading.category,
          readingId: currentReading.readingId,
          cards: currentReading.cards,
        }),
      });

      const payload = (await response.json()) as
        | { data?: unknown }
        | ApiError;

      if (!response.ok) {
        const apiError = payload as ApiError;
        throw new Error(
          apiError.error?.message ||
            "解讀暫時沒有完成，您可以用原本的三張牌再試一次。",
        );
      }

      const parsedResult = ReadingResultSchema.safeParse(
        (payload as { data?: unknown }).data,
      );
      if (
        !parsedResult.success ||
        !resultMatchesDraw(parsedResult.data, currentReading)
      ) {
        throw new Error("解讀暫時沒有完成，您可以用原本的三張牌再試一次。");
      }

      const completedReading: StoredReading = {
        ...currentReading,
        result: parsedResult.data,
      };
      setReading(completedReading);
      writeStoredReading(window.localStorage, completedReading);
      setPhase("complete");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "解讀暫時沒有完成，您可以用原本的三張牌再試一次。",
      );
      setPhase("error");
    } finally {
      activeRequest.current = false;
    }
  }, []);

  useEffect(() => {
    if (phase !== "revealing" || revealedCount !== 3 || !reading) return;
    const timer = window.setTimeout(() => {
      void requestReading(reading);
    }, 550);
    return () => window.clearTimeout(timer);
  }, [phase, reading, requestReading, revealedCount]);

  useEffect(() => {
    if (
      phase !== "selecting" ||
      selectedDeckIndices.length !== 3 ||
      selectionDeck.length !== tarotCardIds.length
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      const nextReading: StoredReading = {
        version: READING_VERSION,
        readingId: crypto.randomUUID(),
        question: question.trim(),
        category,
        cards: selectedDeckIndices.map((index) => selectionDeck[index]),
        createdAt: new Date().toISOString(),
        promptVersion: PROMPT_VERSION,
        result: null,
      };

      setReading(nextReading);
      setRevealedCount(0);
      setPhase("cards_drawn");
      writeStoredReading(window.localStorage, nextReading);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [category, phase, question, selectedDeckIndices, selectionDeck]);

  function prepareQuestion() {
    const normalizedQuestion = question.trim();
    if (!normalizedQuestion) {
      setErrorMessage("請先寫下此刻想釐清的問題。");
      return;
    }
    setQuestion(normalizedQuestion);
    setErrorMessage("");
    setPhase("question_ready");
  }

  async function prepareDeckSelection() {
    if (phase === "shuffling") return;
    setPhase("shuffling");
    setErrorMessage("");
    await new Promise((resolve) => window.setTimeout(resolve, 900));

    setSelectionDeck(createSelectionDeck(tarotCardIds));
    setSelectedDeckIndices([]);
    setPhase("selecting");
  }

  function selectDeckCard(index: number) {
    if (phase !== "selecting" || selectedDeckIndices.length >= 3) return;
    setSelectedDeckIndices((current) =>
      current.includes(index) ? current : [...current, index],
    );
  }

  function revealCard(index: number) {
    if (phase !== "cards_drawn" && phase !== "revealing") return;
    if (index !== revealedCount) return;
    setRevealedCount((count) => count + 1);
    setPhase("revealing");
  }

  function retryReading() {
    if (!reading || activeRequest.current) return;
    void requestReading({ ...reading, result: null });
  }

  function resetExperience() {
    clearStoredReading(window.localStorage);
    setQuestion("");
    setCategory("general");
    setReading(null);
    setSelectionDeck([]);
    setSelectedDeckIndices([]);
    setRevealedCount(0);
    setErrorMessage("");
    setCopied(false);
    setPhase("idle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function copyReading() {
    if (!reading?.result) return;
    const cards = reading.cards.map((drawn, index) => {
      const card = tarotCardMap.get(drawn.cardId);
      return `${index + 1}. ${card?.nameZh ?? drawn.cardId}（${orientationLabel(
        drawn.orientation,
      )}）`;
    });
    const advice = reading.result.actionAdvice
      .map((item, index) => `${index + 1}. ${item}`)
      .join("\n");
    const text = [
      "AI Tarot · Interactive Reflection",
      `問題：${reading.question}`,
      `分類：${categoryLabel(reading.category)}`,
      "",
      ...cards,
      "",
      `整體解讀：${reading.result.overallReading}`,
      "",
      "可以帶走的方向：",
      advice,
      "",
      "本內容僅供反思與娛樂用途。",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setErrorMessage("瀏覽器無法存取剪貼簿，請手動選取內容複製。");
    }
  }

  const isBusy = phase === "shuffling" || phase === "generating";
  const isReadingVisible = Boolean(reading && phase !== "idle" && phase !== "question_ready");

  return (
    <>
      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow-row">
            <span />
            <p>INTERACTIVE REFLECTION · TIMEFLOW</p>
          </div>
          <h1>
            留下一個問題，
            <br />
            <span className="hero-second-line">從三張牌裡，</span>
            <br />
            <span className="hero-third-line">看見另一種理解。</span>
          </h1>
          <p className="hero-lead">
            抽取三張牌，讓 AI 結合牌義、位置與您的問題脈絡，整理出一段更貼近當下的理解與反思。
          </p>
          <p className="hero-meta">三張牌 · 一次固定 · 留在這次閱讀裡</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-radiance" />
          <div className="hero-flow flow-a" />
          <div className="hero-flow flow-b" />
          <div className="hero-orbit orbit-a" />
          <div className="hero-orbit orbit-b" />
          <div className="hero-card hero-card-left" />
          <div className="hero-card hero-card-center" />
          <div className="hero-card hero-card-right" />
        </div>
      </section>

      <section className="experience-shell" aria-labelledby="experience-title">
        {!hydrated ? (
          <div className="restore-state" role="status">
            正在恢復體驗…
          </div>
        ) : (
          <>
            {(phase === "idle" || phase === "question_ready") && (
              <div className="question-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">OPEN THE READING</p>
                    <h2 id="experience-title">把此刻想問的，留在這裡。</h2>
                  </div>
                  <span className="step-indicator">01 / 03</span>
                </div>

                {phase === "idle" ? (
                  <>
                    <label className="question-label" htmlFor="tarot-question">
                      <span>寫下問題</span>
                      <span>
                        {question.length} / {MAX_QUESTION_LENGTH}
                      </span>
                    </label>
                    <textarea
                      id="tarot-question"
                      value={question}
                      maxLength={MAX_QUESTION_LENGTH}
                      rows={4}
                      placeholder="例如：我最近在工作方向上有些猶豫，接下來可以從哪些角度思考？"
                      onChange={(event) => {
                        setQuestion(event.target.value);
                        if (errorMessage) setErrorMessage("");
                      }}
                    />
                    <fieldset className="category-fieldset">
                      <legend>這個問題比較接近哪個面向？</legend>
                      <div className="category-grid">
                        {categories.map((item) => (
                          <label key={item.value}>
                            <input
                              type="radio"
                              name="category"
                              value={item.value}
                              checked={category === item.value}
                              onChange={() => setCategory(item.value)}
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    {errorMessage && (
                      <p className="inline-error" role="alert">{errorMessage}</p>
                    )}
                    <button
                      type="button"
                      className="button primary full"
                      onClick={prepareQuestion}
                      disabled={!question.trim()}
                    >
                      準備這次抽牌 <span aria-hidden="true">→</span>
                    </button>
                  </>
                ) : (
                  <div className="confirmation-card">
                    <span>{categoryLabel(category)}</span>
                    <blockquote>「{question}」</blockquote>
                    <p>確認後，三張牌與正逆位會固定，陪您完成這次閱讀。</p>
                    <div className="confirmation-actions">
                      <button
                        type="button"
                        className="button ghost"
                        onClick={() => setPhase("idle")}
                      >
                        返回修改
                      </button>
                      <button
                        type="button"
                        className="button primary"
                        onClick={() => void prepareDeckSelection()}
                      >
                        展開牌庫 <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {phase === "shuffling" && (
              <div className="shuffle-stage" role="status" aria-live="polite">
                <div className="shuffle-stack" aria-hidden="true">
                  <span /><span /><span />
                </div>
                <p className="eyebrow">THE CARDS ARE TURNING</p>
                <h2>正在為這次問題洗牌…</h2>
                <p>三張牌與正逆位將在抽出後固定。</p>
              </div>
            )}

            {phase === "selecting" && (
              <section className="deck-selection-stage" aria-labelledby="deck-selection-title">
                <div className="panel-heading deck-selection-heading">
                  <div>
                    <p className="eyebrow">CHOOSE YOUR CARDS</p>
                    <h2 id="deck-selection-title">從牌庫中，親手選出三張牌。</h2>
                  </div>
                  <span className="step-indicator">02 / 03</span>
                </div>
                <p className="deck-selection-copy">
                  牌面仍然隱藏。憑第一眼的感覺，從半圓牌庫依序點選三張。
                </p>
                <div
                  className="deck-fan"
                  role="group"
                  aria-label={`78 張牌庫，已選 ${selectedDeckIndices.length} 張`}
                >
                  {selectionDeck.map((_, index) => {
                    const angle = -66 + (132 * index) / (selectionDeck.length - 1);
                    const radians = (angle * Math.PI) / 180;
                    const mobileAngle =
                      -68 + (136 * index) / (selectionDeck.length - 1);
                    const mobileRadians = (mobileAngle * Math.PI) / 180;
                    const selectedOrder = selectedDeckIndices.indexOf(index);
                    return (
                      <button
                        key={index}
                        type="button"
                        className={`deck-fan-card ${
                          selectedOrder >= 0 ? "is-selected" : ""
                        }`}
                        style={
                          {
                            "--fan-rotation": `${angle * 0.72}deg`,
                            "--fan-left": `${50 + Math.sin(radians) * 42}%`,
                            "--fan-top": `${72 - Math.cos(radians) * 52}%`,
                            "--fan-mobile-rotation": `${90 + mobileAngle * 0.72}deg`,
                            "--fan-mobile-left": `${10 + Math.cos(mobileRadians) * 74}%`,
                            "--fan-mobile-top": `${49 + Math.sin(mobileRadians) * 33}%`,
                            "--fan-index": index,
                          } as CSSProperties
                        }
                        onClick={() => selectDeckCard(index)}
                        disabled={selectedOrder >= 0 || selectedDeckIndices.length >= 3}
                        aria-label={
                          selectedOrder >= 0
                            ? `第 ${selectedOrder + 1} 張已選取`
                            : `選擇牌庫中的第 ${index + 1} 張牌`
                        }
                      >
                        <span aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
                <div className="deck-selection-progress" aria-live="polite">
                  {[0, 1, 2].map((index) => (
                    <span
                      className={index < selectedDeckIndices.length ? "is-filled" : ""}
                      key={index}
                    >
                      {index < selectedDeckIndices.length ? "✦" : `0${index + 1}`}
                    </span>
                  ))}
                  <p>
                    {selectedDeckIndices.length < 3
                      ? `再選 ${3 - selectedDeckIndices.length} 張`
                      : "三張牌已選定，正在為您展開…"}
                  </p>
                </div>
              </section>
            )}

            {isReadingVisible && reading && (
              <section className="cards-stage" aria-labelledby="cards-title">
                <div className="panel-heading cards-heading">
                  <div>
                    <p className="eyebrow">YOUR THREE CARDS</p>
                    <h2 id="cards-title">
                      {revealedCount === 0
                        ? "三張牌已經抽出。"
                        : revealedCount < 3
                          ? "依序翻開這次的三張牌"
                          : "牌面已經展開。"}
                    </h2>
                  </div>
                  <div className="step-actions">
                    <span className="step-indicator">02 / 03</span>
                    <button type="button" className="text-button" onClick={resetExperience}>
                      重新開始
                    </button>
                  </div>
                </div>
                <div className="drawn-card-grid">
                  {reading.cards.map((drawn, index) => {
                    const card = tarotCardMap.get(drawn.cardId);
                    if (!card) return null;
                    return (
                      <TarotCardVisual
                        key={`${drawn.cardId}-${index}`}
                        card={card}
                        drawn={drawn}
                        index={index}
                        revealed={index < revealedCount}
                        onReveal={() => revealCard(index)}
                        disabled={
                          isBusy ||
                          phase === "complete" ||
                          phase === "error" ||
                          index !== revealedCount
                        }
                      />
                    );
                  })}
                </div>

                {phase === "generating" && (
                  <div className="generation-state" role="status" aria-live="polite">
                    <span className="generation-pulse" aria-hidden="true" />
                    <div>
                      <strong>正在整理三張牌之間的關係…</strong>
                      <p>這次解讀會沿用眼前的牌面，不會重新抽牌。</p>
                    </div>
                  </div>
                )}

                {phase === "error" && (
                  <div className="error-panel" role="alert">
                    <div>
                      <strong>解讀暫時沒有完成</strong>
                      <p>{errorMessage}</p>
                    </div>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={retryReading}
                    >
                      使用原牌重新解讀
                    </button>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </section>

      {reading?.result && phase === "complete" && (
        <ReadingResult
          reading={reading}
          copied={copied}
          onCopy={() => void copyReading()}
          onReset={resetExperience}
        />
      )}

      <section className="how-it-works" id="how-it-works">
        <div>
          <p className="eyebrow">THE READING RITUAL</p>
          <h2>不是預言，而是換一個角度重新看見當下。</h2>
        </div>
        <ol>
          <li><span>01</span><strong>提出問題</strong><p>把注意力放回此刻，寫下真正想釐清的情境。</p></li>
          <li><span>02</span><strong>抽取三張牌</strong><p>牌面與正逆位在抽取後固定，依序展開閱讀的節奏。</p></li>
          <li><span>03</span><strong>展開解讀</strong><p>從牌義、位置與問題之間，整理出另一個可供思考的角度。</p></li>
        </ol>
      </section>

      <aside className="disclaimer">
        <span aria-hidden="true">i</span>
        <div>
          <p>
            這是一個以 AI 與塔羅牌義為基礎的互動反思體驗，適合用來整理想法與探索不同角度；不應作為醫療、法律、投資或重大人生決策的唯一依據。
          </p>
          <p>
            您的問題只保留在目前瀏覽器中；產生解讀時會傳送至 AI 服務處理，本站不會建立個人帳號，也不會在伺服器保存閱讀紀錄。
          </p>
        </div>
      </aside>

      <span className="sr-only" aria-live="polite">
        {isBusy ? "操作處理中" : ""}
      </span>
    </>
  );
}
