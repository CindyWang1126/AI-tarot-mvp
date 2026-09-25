# AI Tarot Interactive Experience

**LLM × Structured Knowledge Prototype by Timeflow**

[Production：timeflow-ai-tarot.vercel.app](https://timeflow-ai-tarot.vercel.app)

Planned custom domain: `ai-tarot.timeflow.tw`（等待 DNS CNAME 設定）

一個以三張牌陣為核心的匿名互動式反思體驗。使用者提出問題後，系統會固定抽出三張不重複的牌與正逆位，再由伺服器端 AI 結合可信的結構化牌義、牌位與問題脈絡產生繁體中文解讀。

這不是預測引擎，也不宣稱塔羅能客觀預知未來；產品重點是穩定流程、資料一致性與清楚的自我反思介面。

## 核心體驗

1. 輸入問題並選擇感情、工作、財務、人際或一般類別。
2. 確認問題後，以 Web Crypto 產生三張不重複的牌與獨立正逆位。
3. 依序翻開「背景／過去影響」、「現況／核心能量」、「建議／發展方向」。
4. AI 逐牌解讀，再整理三牌關係、整體解讀、行動建議與一個反思問題。
5. 當次 reading 保存於瀏覽器；重新整理與 AI retry 都沿用相同牌組。

## 技術棧

- Next.js 16、React 19、TypeScript、App Router
- Tailwind CSS 4 與產品級自訂 responsive design system
- OpenAI Responses API、Structured Outputs、Zod
- Vitest、ESLint、TypeScript strict mode
- Vercel production deployment

## 架構

```text
Browser
  ├─ Web Crypto：只執行一次的抽牌與正逆位
  ├─ localStorage：版本化 reading persistence
  └─ POST /api/readings（只傳 question/category/readingId/card IDs/orientation）
         ├─ Zod request validation
         ├─ server-side trusted Tarot lookup
         ├─ per-IP best-effort throttle + duplicate request guard
         └─ OpenAI Responses API + Structured Outputs
                └─ Zod parse + immutable card consistency check
```

瀏覽器不能指定 model、system prompt、token limit 或 raw meanings。API route 會依 `cardId` 從伺服器端資料重新取得可信牌義，並驗證三張牌、牌位、牌名與正逆位完全一致。結構或卡牌一致性失敗時只針對同一牌組 repair 一次，不會重新抽牌。

## Tarot Knowledge

正式單一資料來源位於 [`data/tarot-cards.json`](data/tarot-cards.json)，欄位包含：

```text
id, name, nameZh, arcana, suit, number, keywords,
meaningUpright, meaningReversed, reflection, image, legacyImage
```

來源稽核與完整性修復確認：

- Major Arcana：22 筆完整。
- Minor Arcana：56 筆完整；權杖、聖杯、寶劍、錢幣各 14 筆。
- 「寶劍 10 / Ten of Swords」已補入正式資料，包含正位、逆位、反思提示與既有 legacy image mapping。
- 正式資料、server-side lookup 與瀏覽器抽牌候選池皆直接使用同一份 78 張 canonical dataset，沒有額外 filter。
- Production UI 使用 CSS fallback card visual，因此不會因正式圖片欄位為空而排除任何牌。
- 舊 repo 有 78 張一致的 Rider–Waite–Smith 風格 JPEG，但未附足以確認正式使用權利的來源／授權文件，因此新版 UI 使用自製抽象牌面；原圖只保留在 `legacy/assets/cards/`，不會由正式頁面載入。

完整稽核記錄見 [`docs/source-audit.md`](docs/source-audit.md)。

## Local development

需求：Node.js 24。

```bash
npm install
cp .env.example .env.local
npm run dev
```

必要環境變數：

```bash
OPENAI_API_KEY=replace-with-a-server-side-key
```

可選：

```bash
OPENAI_MODEL=gpt-5.4-mini
NEXT_PUBLIC_SITE_URL=https://ai-tarot.timeflow.tw
```

`OPENAI_API_KEY` 僅由 server route 讀取，不可改成 `NEXT_PUBLIC_*`。若本機沒有 key，首頁仍可載入與抽牌，AI route 會回傳不含 stack trace 的安全錯誤。

## Quality checks

```bash
npm run data:validate
npm run lint
npm run typecheck
npm test
npm run build
```

## 隱私與公開 Demo 保護

- 不需帳號，沒有資料庫，也不保存閱讀歷史到伺服器。
- 問題與 reading 只保存於目前瀏覽器的 `localStorage`。
- 產生解讀時，問題與固定三張牌會傳至 OpenAI API 處理。
- API 不記錄完整問題或 AI 回應；錯誤 UI 不揭露 provider raw error。
- 問題上限 260 字，前端防重複送出，伺服器有 request validation、timeout、同 reading request guard 與每 IP 每分鐘 4 次的記憶體型 throttle。
- 記憶體 rate limit 是 serverless instance 內的 best-effort 保護，不保證跨 instance 全域一致；高流量正式服務應改用共享 rate-limit store。

## SEO 與 accessibility

- Metadata、canonical、robots、sitemap、Open Graph、favicon、WebApplication JSON-LD。
- Semantic headings、keyboard focus、可讀的正／逆位文字標示、ARIA card label。
- 支援 `prefers-reduced-motion`。
- 已針對 1440、1024、768 與 390px 檢查水平溢出與主要流程。

## Legacy history

舊 Streamlit 與 Notebook prototype 已降級並保留：

- `legacy/app.py`
- `legacy/requirements.txt`
- `research/Demo_Tarot_streamlit.ipynb`
- [Previous prototype demo on YouTube](https://youtu.be/SkfL9ziMDfk)

正式產品入口是 Next.js，不再使用 `streamlit run app.py`。

## 限制與聲明

- 正式 Tarot knowledge 與 draw pool 目前皆為完整 78 張；完整性由 runtime schema、資料驗證腳本與回歸測試共同保護。
- 未導入帳號、資料庫、跨裝置同步或長期閱讀歷史。
- 公開 Demo 的 instance-local rate limiting 不是 enterprise-grade abuse protection。
- AI 輸出可能仍有誤差；產品透過 schema 與 immutable card checks 降低漏牌、換牌和正逆位不一致，但不宣稱解讀「準確預測」。
- 本體驗只供反思與娛樂，不應作為醫療、法律、投資或重大人生決策的唯一依據。

## Asset attribution

舊版圖片檔名與風格顯示為 1909 Rider–Waite–Smith deck，但 repo 沒有包含完整的來源 URL 或授權證明。這些檔案被視為 legacy/demo assets；本專案不對其商業使用權作保證，新版正式 UI 也不使用它們。

---

Built by [Timeflow 時序](https://timeflow.tw)
