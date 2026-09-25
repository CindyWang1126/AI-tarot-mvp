"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ReadingResult } from "@/components/reading-result";
import { TarotCardVisual } from "@/components/tarot-card";
import { PROMPT_VERSION } from "@/lib/version";
import {
  MAX_QUESTION_LENGTH,
  READING_VERSION,
  ReadingResultSchema,
  categories,
  categoryLabel,
  drawThreeCards,
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
            "這次解讀暫時沒有完成，請使用原本的三張牌重新解讀。",
        );
      }

      const parsedResult = ReadingResultSchema.safeParse(
        (payload as { data?: unknown }).data,
      );
      if (
        !parsedResult.success ||
        !resultMatchesDraw(parsedResult.data, currentReading)
      ) {
        throw new Error("解讀內容未通過一致性驗證，請重新解讀。");
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
          : "這次解讀暫時沒有完成，請使用原本的三張牌重新解讀。",
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

  function prepareQuestion() {
    const normalizedQuestion = question.trim();
    if (!normalizedQuestion) {
      setErrorMessage("請先輸入想探索的問題。");
      return;
    }
    setQuestion(normalizedQuestion);
    setErrorMessage("");
    setPhase("question_ready");
  }

  async function drawCards() {
    if (phase === "shuffling") return;
    setPhase("shuffling");
    setErrorMessage("");
    await new Promise((resolve) => window.setTimeout(resolve, 900));

    const nextReading: StoredReading = {
      version: READING_VERSION,
      readingId: crypto.randomUUID(),
      question: question.trim(),
      category,
      cards: drawThreeCards(tarotCardIds),
      createdAt: new Date().toISOString(),
      promptVersion: PROMPT_VERSION,
      result: null,
    };

    setReading(nextReading);
    setRevealedCount(0);
    setPhase("cards_drawn");
    writeStoredReading(window.localStorage, nextReading);
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
      "AI Tarot Interactive Reflection Experience",
      `問題：${reading.question}`,
      `分類：${categoryLabel(reading.category)}`,
      "",
      ...cards,
      "",
      `整體解讀：${reading.result.overallReading}`,
      "",
      "行動建議：",
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
            <p>AI × STRUCTURED TAROT KNOWLEDGE</p>
          </div>
          <h1>
            問一個問題，
            <br />
            <span className="hero-second-line">
              看見另一個<span className="mobile-break"><br /></span>思考角度。
            </span>
          </h1>
          <p className="hero-lead">
            抽取三張牌，由 AI 結合結構化牌義與問題脈絡，整理出一段清楚、連貫且不武斷的自我反思。
          </p>
          <div className="hero-meta">
            <span>03-CARD SPREAD</span>
            <span>PRIVATE BY DEFAULT</span>
            <span>NO SIGN-IN</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-orbit orbit-a" />
          <div className="hero-orbit orbit-b" />
          <div className="hero-card hero-card-left"><span>Ⅰ</span></div>
          <div className="hero-card hero-card-center"><span>Ⅱ</span></div>
          <div className="hero-card hero-card-right"><span>Ⅲ</span></div>
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
                    <p className="eyebrow">BEGIN YOUR READING</p>
                    <h2 id="experience-title">想探索什麼？</h2>
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
                      <legend>選擇問題類型</legend>
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
                      確認問題 <span aria-hidden="true">→</span>
                    </button>
                  </>
                ) : (
                  <div className="confirmation-card">
                    <span>{categoryLabel(category)}</span>
                    <blockquote>「{question}」</blockquote>
                    <p>問題確認後，會一次固定抽出三張不重複的牌與正逆位。</p>
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
                        onClick={() => void drawCards()}
                      >
                        抽取三張牌 <span aria-hidden="true">→</span>
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
                <p className="eyebrow">SHUFFLING</p>
                <h2>正在整理牌序…</h2>
                <p>抽牌結果會在這一步固定，後續解讀與重試都不會改變。</p>
              </div>
            )}

            {isReadingVisible && reading && (
              <section className="cards-stage" aria-labelledby="cards-title">
                <div className="panel-heading cards-heading">
                  <div>
                    <p className="eyebrow">YOUR THREE CARDS</p>
                    <h2 id="cards-title">
                      {revealedCount < 3 ? "依序翻開三張牌" : "三張牌已經就位"}
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
                      <strong>正在整理三張牌的關係…</strong>
                      <p>AI 正在依照固定牌面生成完整解讀。</p>
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
          <p className="eyebrow">HOW IT WORKS</p>
          <h2>不是預言，而是一種結構化的觀看方式。</h2>
        </div>
        <ol>
          <li><span>01</span><strong>提出問題</strong><p>把注意力放在真正想釐清的情境。</p></li>
          <li><span>02</span><strong>抽取三張牌</strong><p>牌面與正逆位只產生一次，立即固定。</p></li>
          <li><span>03</span><strong>AI 整理解讀</strong><p>結合牌義、牌位與問題，形成連貫觀點。</p></li>
        </ol>
      </section>

      <aside className="disclaimer">
        <span aria-hidden="true">i</span>
        <p>
          本體驗以 AI 與塔羅牌義提供反思與娛樂用途，不應作為醫療、法律、投資或重大人生決策的唯一依據。問題只保存在目前瀏覽器；送出解讀時會傳至 OpenAI API 處理，不會存入本站資料庫。
        </p>
      </aside>

      <span className="sr-only" aria-live="polite">
        {isBusy ? "操作處理中" : ""}
      </span>
    </>
  );
}
