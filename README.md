
# AI Tarot MVP — Streamlit-based LLM Application Demo

This repository presents an AI application MVP demo illustrating how large language models (LLMs) can be combined with structured domain knowledge to build an interactive prototype.

The project focuses on AI application design, prompt orchestration, and rapid prototyping, rather than commercial product development or backend deployment.

---

The AI Tarot MVP explores how symbolic knowledge (Tarot cards) can be represented as structured data and interpreted dynamically using LLMs.

The purpose of this project is to demonstrate:

* Building an interactive AI application with Streamlit
* Integrating structured JSON data into LLM-based reasoning
* Designing prompts for multi-step interpretation
* Rapidly prototyping an AI MVP without API service refactoring

This project is positioned as a course project and portfolio-level AI application demo.

---

The demo includes:

* An interactive Tarot card selection interface
* LLM-generated interpretations guided by structured Tarot knowledge
* Support for both Major and Minor Arcana
* JSON-based separation of data and logic
* A Streamlit-based UI for fast experimentation and presentation

---

Repository contents:

```
app.py                          Streamlit application entry point
Demo_Tarot_streamlit.ipynb      Runnable demo notebook (Colab / local)
tarot_cards.json                Major Arcana structured data
tarot_minor_arcana_final_56.json
cards/                          Tarot card image assets
requirements.txt
```

---

To run the demo locally:

Install dependencies:

```bash
pip install -r requirements.txt
```

Set the OpenAI API key (for local demo only):

```bash
export OPENAI_API_KEY="your_api_key_here"
```

Run the Streamlit application:

```bash
streamlit run app.py
```

API configuration is required only for execution.
The project structure and logic can be reviewed independently without running the model.

---

All Tarot knowledge is stored in structured JSON format, separating card metadata, symbolic meanings, and upright or reversed interpretations.

This design keeps AI logic decoupled from domain knowledge and allows the project to be easily extended to other symbolic or knowledge-driven applications.

---

No backend API refactor (FastAPI / Flask) was performed intentionally.
The project is treated as an MVP demo, focusing on AI application logic rather than deployment infrastructure.

Streamlit was selected to prioritize clarity, speed, and iteration efficiency.
Tarot images are included solely for UI completeness and demonstration purposes.

---

This project is not intended as a production system or predictive model.
It serves as an educational and demonstrative AI application prototype.

---

Developed by **Cindy Wang**
Computer Science / AI Application Project
