# DecisionForge — Promptathon 2024 Entry

**DecisionForge** is a GenAI-Powered Product Decision & Trade-off Intelligence System that solves the "GenAI output opacity" problem. It uses a structured 5-stage prompt chain to decompose problems, generate strategic options, score them against weighted objectives, synthesize recommendations, and audit the entire reasoning process for bias and robustness.

## 🚀 Key Features
- **Structured 5-Stage Pipeline:** Analyst -> Strategist -> Intelligence Engine -> CPO -> Auditor.
- **Explainable AI (XAI):** Stage 5 provides a meta-audit of the model's own reasoning.
- **Dynamic Trade-off Matrix:** Color-coded scoring with hover-over reasoning and radar chart visualization.
- **Professional UX:** Glassmorphism UI, smooth transitions, and live objective weight balancing.
- **Production-Grade Backend:** FastAPI with automated JSON validation, retry logic, and stage-level latency tracking.

## 🛠️ Stack
- **Frontend:** React, Tailwind CSS, Chart.js, Vite.
- **Backend:** FastAPI, Python 3.10+.
- **AI Core:** Ollama (Local LLM - Qwen3).

## 🏃 How to Run

### 1. Requirements
- **Ollama** installed and running.
- **Qwen3** model pulled: `ollama pull qwen3`
- Node.js & Python installed.

### 2. Start Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Accessible at: `http://localhost:5173`

## 🧩 The Prompt Chain
1. **Decomposition:** Breaks the scenario into core questions, constraints, and stakeholders.
2. **Expansion:** Generates 4 distinct, non-overlapping product strategies.
3. **Intelligence:** Assigns 1-10 scores and provides per-cell justifications referencing constraints.
4. **Synthesis:** Makes a high-stakes recommendation with a runner-up and risk profile.
5. **Audit:** Inspects the prior 4 stages for reasoning quality, bias, and robustness.
