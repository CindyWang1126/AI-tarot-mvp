# -*- coding: utf-8 -*-
import streamlit as st
import json
import random
from PIL import Image, ImageOps, ImageDraw, ImageFont
import os
from openai import OpenAI
from dotenv import load_dotenv

# 載入 API 金鑰
load_dotenv(dotenv_path="/content/tarot_mvp/.env")  # 寫完整路徑！
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 讀取塔羅牌資料
with open("tarot_cards.json", "r", encoding="utf-8") as f:
    tarot_cards = json.load(f)

# 設定中文字體
FONT_PATH = "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc"
FONT_SIZE = 40

# Streamlit UI
st.set_page_config(page_title="AI 塔羅牌占卜", page_icon="🔮")
st.title("🔮 AI 塔羅牌占卜")
question = st.text_input("請輸入你的問題（例如：我該轉職嗎？）")

if st.button("開始占卜") and question:
    selected_cards = random.sample(tarot_cards, 3)
    results = []

    for card in selected_cards:
        is_reversed = random.choice([True, False])
        image_path = os.path.join("cards", os.path.basename(card["image"]))
        image = Image.open(image_path).convert("RGB")

        # 如果逆位則旋轉圖片
        if is_reversed:
            image = ImageOps.flip(ImageOps.mirror(image))
            meaning = card["meaning_rev"]
        else:
            meaning = card["meaning_up"]

        # 在圖片下方寫上牌名與說明
        # font = ImageFont.truetype(FONT_PATH, FONT_SIZE)
        text = f"{card['name']}（{'逆位' if is_reversed else '正位'}）"
        st.image(image, use_container_width=True)
        st.markdown(f"<h3 style='text-align: center'>{text}</h3>", unsafe_allow_html=True)
        st.write(f"📖 解釋：{meaning}")
        results.append(f"{text}：{meaning}")

    # GPT 占卜解釋
    full_prompt = f"使用者問：「{question}」\n以下是抽到的三張塔羅牌與其含義：\n" + "\n".join(results) + "\n請用中文幫我做一段有深度的占卜解釋。"

    with st.spinner("AI 解讀中…"):
        response = client.chat.completions.create(
            #model="gpt-3.5-turbo",'
            model="gpt-4o",
            messages=[
                {"role": "user", "content": full_prompt}
            ]
        )
        answer = response.choices[0].message.content.strip()
        st.subheader("🧙‍♀️ AI 占卜結果")
        st.write(answer)
