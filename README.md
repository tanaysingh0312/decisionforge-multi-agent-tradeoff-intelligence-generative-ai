# DecisionForge — Multi-Agent Tradeoff Intelligence System

> **Production-grade GenAI system that transforms ambiguous product decisions into structured, explainable, CPO-level recommendations through a 4-stage multi-agent reasoning pipeline.**

---

<!-- Add screenshot: Input Panel — "Define the Strategic Frontier" -->
![Input Panel]()

---

## 🧠 Architecture

```
User Scenario + Constraints + Weighted Objectives
        │
        ▼
┌──────────────────────────────────────────────────────┐
│                   FastAPI Backend                     │
│                                                      │
│  Stage 1 — Problem Decomposition Agent               │
│    Persona: Structured Product Analyst               │
│    → decision_question, constraints[],               │
│      objectives[], stakeholders[]                    │
│                         │                            │
│  Stage 2 — Options Generation Agent                  │
│    Persona: Product Strategy Expert                  │
│    → 4 distinct options with effort / impact / risk  │
│                         │                            │
│  Stage 3 — Trade-off Scoring Agent                   │
│    Persona: Decision Intelligence Engine             │
│    → scores matrix, per-cell reasoning,              │
│      constraint violations                           │
│                         │                            │
│  Stage 4 — Recommendation Synthesis Agent            │
│    Persona: Chief Product Officer (CPO)              │
│    → top pick, runner-up, risks[], confidence score, │
│      executive summary, bias filter                  │
└──────────────────────────────────────────────────────┘
        │
        ▼
React + TypeScript Frontend (6 Screens)
+ Prompt Inspector Sidebar
        │
        ▼
Exportable JSON Decision Artifact
```

---

## 🖥️ Screens

| Screen | Component | Description |
|--------|-----------|-------------|
| 1 | `InputScreen.tsx` | Decision scenario textarea, constraint chips, weighted objective sliders (must sum to 100%) |
| 2 | `ThinkingScreen.tsx` | Live 4-stage pipeline progress, forge-engine latency, real-time reasoning stream |
| 3 | `ExplorerScreen.tsx` | 4 generated strategy cards with effort / impact badges, benefit, risk |
| 4 | `AnalysisScreen.tsx` | Trade-off heatmap matrix + radar chart (Equilibrium Analysis) |
| 5 | `RecommendationScreen.tsx` | CPO directive, confidence score arc, strategic criticalities, runner-up vector |
| 6 | Recommendation scroll | Synthesized executive summary, bias filter tags, cryptographic audit hash |

---
![WhatsApp Image 2026-04-07 at 10 46 14 PM](https://github.com/user-attachments/assets/e93e8510-0e73-4364-8494-f65268287b19)


## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | FastAPI (Python 3.10+) |
| Local LLM | Ollama — Qwen3-8B (latest) |
| Agent Orchestration | LangChain |
| Vector Store | ChromaDB |
| Charts | Chart.js (radar / spider) |
| Build Tool | Vite |
| State | In-memory session (no DB required) |
| Export | JSON decision artifact |

---

## 📁 Project Structure

```
decisionforge/
├── AIML-frontend-main/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── InputScreen.tsx
│   │   │   ├── ThinkingScreen.tsx
│   │   │   ├── ExplorerScreen.tsx
│   │   │   ├── AnalysisScreen.tsx
│   │   │   ├── RecommendationScreen.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── utils.ts
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── backend/
│   ├── main.py                  # FastAPI — /api/analyze endpoint
│   └── requirements.txt
├── start_forge.bat              # One-click startup (Windows)
├── Cache_FlowDoc.pdf            # System flow documentation
├── Cache_PromptDoc.pdf          # Prompt chain documentation
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- [Ollama](https://ollama.com) installed and running

### 1. Pull the model
```bash
ollama pull qwen3:8b
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend
```bash
cd AIML-frontend-main
npm install
npm run dev
```

### Or — one click (Windows)
```bash
start_forge.bat
```

App runs at `http://localhost:3000`

---

## 🔗 Prompt Chain Design

Each stage has a distinct AI persona and a strict JSON output contract. Every prompt sent, token count, and raw stage output is visible in the collapsible **Prompt Inspector** sidebar.

| Stage | Persona | Output Contract |
|-------|---------|----------------|
| 1 | Structured Product Analyst | `decision_question`, `constraints[]`, `objectives[]`, `stakeholders[]` |
| 2 | Product Strategy Expert | `options[]` — 4 choices with effort / impact / risk |
| 3 | Decision Intelligence Engine | `scores{}`, `reasoning{}`, `constraint_violations{}` |
| 4 | Chief Product Officer | `recommendation`, `runner_up`, `risks[]`, `confidence_score`, `executive_summary` |

> All prompts use XML-tagged structure: `<context>`, `<constraints>`, `<options>`, `<instructions>`  
> Invalid JSON triggers an automatic retry with an explicit correction prefix.

---
![WhatsApp Image 2026-04-07 at 10 46 43 PM](https://github.com/user-attachments/assets/2a4391ca-f3c5-464d-bfbe-fdceb2f58cbb)


## 🔑 Key Features

- **4-stage agent pipeline** — each stage has a distinct reasoning persona, not a monolithic prompt
- **Weighted objectives** — user-defined priorities (must sum to 100%) drive all scoring logic
- **Trade-off heatmap** — color-coded matrix with per-cell AI reasoning on hover
- **Radar chart** — visual equilibrium analysis overlaying all options simultaneously
- **Prompt Inspector** — see exact prompts, token counts, and raw outputs per stage live
- **Prompt Playground** — edit any stage's system prompt and re-run that stage only
- **Bias Filter** — Stage 4 explicitly detects and filters Sunk Cost Bias, Optimism Bias
- **Cryptographic audit hash** — every decision session-signed for full reproducibility
- **JSON export** — complete decision artifact downloadable for audit and documentation
- **One-click startup** — `start_forge.bat` spins up backend + frontend together on Windows

---

## 👤 Author

**Tanay Singh**  
B.Tech Computer Science (AI/ML Specialization)  
Sir Padampat Singhania University, Udaipur

[![GitHub](https://img.shields.io/badge/GitHub-tanaysingh0312-181717?style=flat&logo=github)](https://github.com/tanaysingh0312)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-stanay657-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/stanay657)
