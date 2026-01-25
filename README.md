# 🔮 AI 塔羅牌占卜（Tarot GPT App）

本專案為一款結合 Streamlit 介面與 OpenAI GPT API 的 AI 塔羅牌占卜應用，支援中文問題輸入、隨機抽三張大阿爾克那塔羅牌，並透過 GPT 生成深度解讀。

## 📦 專案內容

- 使用者輸入問題
- 隨機抽三張塔羅牌（含正位/逆位）
- 顯示牌面圖像與解釋
- 由 GPT 給出完整中文占卜分析
- MVP 支援本地圖片、JSON 牌義檔讀取

---

## 🚀 安裝與執行方式

### 🔧 1. 安裝依賴套件（建議建立虛擬環境）

```bash
pip install -r requirements.txt
```

或手動安裝：

```bash
pip install streamlit openai python-dotenv Pillow
```

### 🔑 2. 設定 OpenAI API 金鑰

在專案根目錄建立 `.env` 檔案，內容如下：

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

（請替換為您的實際 API 金鑰）

### 📂 3. 專案結構

```
tarot_mvp/
├── app.py
├── tarot_cards.json
├── cards/                # 儲存塔羅牌圖片（檔名需為 RWS1909_-_XX_Name.jpeg）
├── requirements.txt
└── .env
```

### ▶️ 4. 執行方式（本機）

```bash
streamlit run app.py
```

若成功執行，預設網址會為：

```
http://localhost:8501
```

---

## 📖 JSON 格式（tarot_cards.json）

```json
[
  {
    "name": "愚者",
    "filename": "RWS1909_-_00_Fool.jpeg",
    "upright": "新的開始、自由、冒險。",
    "reversed": "魯莽、逃避現實、缺乏準備。"
  },
  ...
]
```

---

## 🌟 未來可擴充方向

- 支援占卜分類（愛情、事業、健康）
- 回應語氣客製化（MBTI、星座、人格偏好、八字、解夢）
- 使用者占卜紀錄與分析
- 加入繁中→GPT prompt 最佳化設計

---

## 🧙‍♀️ 作者

由Cindy Wang(進化版的貓貓蟲)發想與開發  
塔羅圖像使用 Rider-Waite 1909 公版版本。
