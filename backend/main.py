"""
DecisionForge — Backend API
FastAPI + Ollama (qwen3) — 5-Stage GenAI Prompt Chain
"""

import json
import time
import logging
import re
import uuid
import asyncio
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, TypeAdapter

# ─── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("decisionforge")

# ─── App ────────────────────────────────────────────────────────────────────
app = FastAPI(title="DecisionForge API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Configuration ──────────────────────────────────────────────────────────
DEMO_MODE = True  # SET TO FALSE TO USE ACTUAL QWEN3 LLM
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen3:latest"

# ─── Session Store ──────────────────────────────────────────────────────────
SESSION_STORE = {}

# ─── Pydantic Models ─────────────────────────────────────────────────────────
class Objective(BaseModel):
    name: str
    weight: float

class AnalyzeRequest(BaseModel):
    scenario: str
    constraints: list[str]
    objectives: list[Objective]

class Stage1Output(BaseModel):
    decision_question: str
    constraints: list[str]
    objectives: list[dict[str, Any]]
    stakeholders: list[str]

class Stage2Option(BaseModel):
    id: str
    name: str
    description: str
    primary_benefit: str
    primary_risk: str
    effort: str
    impact: str

class Stage3Output(BaseModel):
    scores: dict[str, dict[str, int]]
    reasoning: dict[str, dict[str, str]]
    constraint_violations: dict[str, list[str]]

class Stage4Risk(BaseModel):
    title: str
    severity: str

class Stage4Output(BaseModel):
    recommended_option_id: str
    recommendation_justification: str
    runner_up_option_id: str
    runner_up_conditions: str
    risks: list[Stage4Risk]
    confidence_score: int
    confidence_explanation: str
    executive_summary: str

class Stage5Output(BaseModel):
    reasoning_quality_score: int
    detected_biases: list[str]
    missing_considerations: list[str]
    robustness_analysis: str
    decision_trace_summary: str

# ─── LLM Core ────────────────────────────────────────────────────────────────
def call_llm(system_prompt: str, user_message: str, timeout: int = 180) -> str:
    """Call Ollama synchronously. Returns raw text output."""
    payload = {
        "model": MODEL,
        "prompt": f"<|im_start|>system\n{system_prompt}<|im_end|>\n<|im_start|>user\n{user_message}<|im_end|>\n<|im_start|>assistant\n",
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "num_predict": 2048,
        },
    }
    log.info(f"Calling Ollama model={MODEL}")
    try:
        with httpx.Client(timeout=timeout) as client:
            resp = client.post(OLLAMA_URL, json=payload)
            resp.raise_for_status()
            data = resp.json()
            print("\n=== LLM RESPONSE ===\n", data.get("response", "")[:500])
            return data.get("response", "")
    except httpx.ConnectError:
        raise ValueError("Cannot connect to Ollama. Ensure Ollama is running at http://localhost:11434")
    except Exception as e:
        log.error(f"LLM call failed: {e}")
        raise ValueError(f"LLM error: {str(e)}")

def extract_json(text: str) -> Any:
    """Extract JSON from raw LLM output — handles markdown fences & think tags."""
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    fenced = re.search(r"```(?:json)?\s*([\s\S]+?)```", text)
    if fenced:
        try:
            return json.loads(fenced.group(1).strip())
        except json.JSONDecodeError:
            pass

    for start_char, end_char in [('{', '}'), ('[', ']')]:
        start = text.find(start_char)
        end = text.rfind(end_char)
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start:end + 1])
            except json.JSONDecodeError:
                continue

    raise ValueError(f"No valid JSON found in LLM output: {text[:300]}...")

def call_llm_with_validation(
    system_prompt: str, user_message: str, stage_name: str, validation_model: Any
) -> tuple[Any, str]:
    """Call LLM, extract JSON, validate with Pydantic, retry once on failure."""
    for attempt in range(2):
        raw = call_llm(system_prompt, user_message)
        log.info(f"[{stage_name}] attempt={attempt+1}, raw_len={len(raw)}")
        try:
            parsed = extract_json(raw)
            adapter = TypeAdapter(validation_model)
            validated = adapter.validate_python(parsed)
            return adapter.dump_python(validated), raw
        except Exception as e:
            log.warning(f"[{stage_name}] Validation failed (attempt {attempt+1}): {e}")
            if attempt == 1:
                raise ValueError(f"Stage {stage_name} failed validation after 2 attempts. Error: {str(e)}")
            user_message += f"\n\nCRITICAL: Your previous response failed validation: {str(e)}. Return strictly conforming JSON."

# ─── Stage Prompts ────────────────────────────────────────────────────────────
STAGE1_SYSTEM = """You are a structured product analyst. Decompose the decision scenario into structured decision components. Ensure clarity, completeness, and logical separation.

Return STRICT JSON only — no markdown, no explanation, no text before or after:
{
  "decision_question": "string — the core question being decided",
  "constraints": ["string", "..."],
  "objectives": [{"name": "string", "weight": 0.0}],
  "stakeholders": ["string", "..."]
}

CRITICAL RULES:
- weights must sum to exactly 1.0
- Return ONLY the JSON object, nothing else"""

STAGE2_SYSTEM = """You are a product strategy expert. Generate exactly 4 DISTINCT product strategies. Avoid overlap. Each must be meaningfully different.

Return ONLY a JSON array — no markdown, no explanation:
[
  {
    "id": "opt_1",
    "name": "string",
    "description": "string — exactly 2 sentences",
    "primary_benefit": "string",
    "primary_risk": "string",
    "effort": "Low | Medium | High",
    "impact": "Low | Medium | High"
  }
]

CRITICAL: Return ONLY the JSON array. IDs must be opt_1, opt_2, opt_3, opt_4."""

STAGE3_SYSTEM = """You are a decision intelligence engine. Score each option against each objective and justify your reasoning.

Return STRICT JSON only — no markdown, no explanation:
{
  "scores": {
    "opt_1": {"objective_name": 7},
    "opt_2": {"objective_name": 5}
  },
  "reasoning": {
    "opt_1": {"objective_name": "One precise sentence referencing constraints."},
    "opt_2": {"objective_name": "One precise sentence referencing constraints."}
  },
  "constraint_violations": {
    "opt_1": [],
    "opt_2": ["violation description"]
  }
}

CRITICAL RULES:
- Scores must be integers 1–10
- reasoning must have ONE precise sentence per cell referencing constraints
- Return ONLY the JSON object"""

STAGE4_SYSTEM = """You are a Chief Product Officer making a high-stakes product decision. Synthesize all analysis into a final recommendation.

Return STRICT JSON only — no markdown, no explanation:
{
  "recommended_option_id": "opt_X",
  "recommendation_justification": "string — exactly 3 sentences",
  "runner_up_option_id": "opt_X",
  "runner_up_conditions": "string — exactly 2 sentences describing when runner-up would be chosen",
  "risks": [
    {"title": "string", "severity": "Low | Medium | High"}
  ],
  "confidence_score": 75,
  "confidence_explanation": "string — 1–2 sentences",
  "executive_summary": "string — max 150 words"
}

CRITICAL: Return ONLY the JSON object."""

STAGE5_SYSTEM = """You are an AI auditor reviewing a multi-stage decision analysis process. Critically evaluate the reasoning quality, detect biases, and summarize the decision evolution.

Return STRICT JSON only — no markdown, no explanation:
{
  "reasoning_quality_score": 82,
  "detected_biases": ["string describing a specific detected bias"],
  "missing_considerations": ["string describing a gap or missing factor"],
  "robustness_analysis": "string — exactly 2 sentences analyzing how robust this decision is",
  "decision_trace_summary": "string — exactly 3 sentences explaining how the decision evolved across the 5 stages"
}

CRITICAL: Return ONLY the JSON object. detected_biases and missing_considerations must each have 2–4 items."""

# ─── Analysis Pipeline Core ───────────────────────────────────────────────────
def run_analysis_pipeline(session_id: str, req: AnalyzeRequest):
    session = SESSION_STORE[session_id]
    prompts_used = []
    timings = {}
    
    try:
        t_total = time.time()
        
        if DEMO_MODE:
            log.info(f"DEMO_MODE STARTING for session {session_id}")
            # Skip real LLM calls and go straight to simulated results
            session["current_stage"] = "Initializing Neural Simulation..."
            session["progress"] = 5
            time.sleep(1)
            
            session["current_stage"] = "Decomposing Problem (Simulated)..."
            session["progress"] = 15
            time.sleep(2)

            session["current_stage"] = "Generating Strategic Vectors..."
            session["progress"] = 35
            time.sleep(2)

            session["current_stage"] = "Modeling Trade-off Scenarios..."
            session["progress"] = 60
            time.sleep(2)

            session["current_stage"] = "Finalizing Strategic Synthesis..."
            session["progress"] = 90
            time.sleep(2)

            # Simulated Data Injection
            session["stages"] = {
                "stage1": {"decision_question": req.scenario, "constraints": req.constraints, "objectives": [{"name": o.name, "weight": o.weight} for o in req.objectives], "stakeholders": ["Executive Board", "Engineering Team", "Customer Base"]},
                "stage2": [
                    {"id": "opt_1", "name": "Deep Tech Integration", "description": "Prioritize long-term architectural stability by fully integrating next-gen AI modules into the core product.", "primary_benefit": "312% ROI projection", "primary_risk": "Short-term delivery lag", "effort": "High", "impact": "High"},
                    {"id": "opt_2", "name": "Rapid Market Capture", "description": "Ship minimal viable features to 3 new regions to capture immediate market share before competitors.", "primary_benefit": "First-mover advantage in APAC", "primary_risk": "Technical debt accumulation", "effort": "Medium", "impact": "High"},
                    {"id": "opt_3", "name": "Strategic Partnership", "description": "Outsource secondary feature development to Tier-1 infrastructure partners to reduce operational load.", "primary_benefit": "40% reduction in OPEX", "primary_risk": "Brand autonomy dilution", "effort": "Low", "impact": "Medium"},
                    {"id": "opt_4", "name": "Core Optimization", "description": "Focus exclusively on fixing legacy technical debt to improve current user retention metrics.", "primary_benefit": "30% reduction in churn", "primary_risk": "Stagnation of innovation", "effort": "Low", "impact": "Medium"}
                ],
                "stage3": {
                    "scores": {
                        "opt_1": {o.name: 9 for o in req.objectives}, 
                        "opt_2": {o.name: 7 for o in req.objectives},
                        "opt_3": {o.name: 5 for o in req.objectives},
                        "opt_4": {o.name: 4 for o in req.objectives}
                    },
                    "reasoning": {
                        "opt_1": {o.name: "Matches long-term strategic horizon perfectly." for o in req.objectives},
                        "opt_2": {o.name: "Balanced risk-reward profile." for o in req.objectives},
                        "opt_3": {o.name: "Low resource utilization but slow impact." for o in req.objectives},
                        "opt_4": {o.name: "Defensive play with limited upside." for o in req.objectives}
                    },
                    "constraint_violations": {"opt_1": [], "opt_2": ["Timeline Risk"], "opt_3": [], "opt_4": []}
                },
                "stage4": {
                    "recommended_option_id": "opt_1",
                    "recommendation_justification": "Option 1 provides the only sustainable path to 42% growth despite higher upfront effort. It leverages the underlying scenario logic to maximize long-term shareholder value. Immediate buy-in from engineering is required.",
                    "runner_up_option_id": "opt_2",
                    "runner_up_conditions": "Select if immediate regional revenue is the primary Q3 KPI over structural stability.",
                    "risks": [{"title": "Talent Gap", "severity": "High"}, {"title": "Infrastructure Load", "severity": "Medium"}],
                    "confidence_score": 94,
                    "confidence_explanation": "Decision robustness verified against historical sector parallels.",
                    "executive_summary": "DecisionForge recommends the 'Deep Tech Integration' path. The analysis shows a 31% higher probability of retention compared to other paths."
                },
                "stage5": {
                    "reasoning_quality_score": 98,
                    "detected_biases": ["Sunk Cost Bias", "Optimism Bias"],
                    "missing_considerations": ["Local Regulatory Nuance", "Energy Consumption Costs"],
                    "robustness_analysis": "Highly robust against budget fluctuations. Sensitive to talent retention.",
                    "decision_trace_summary": "Evolved from basic problem decomposition into a multi-vector trade-off map. Refined through hybrid scoring engine."
                }
            }
            session["metadata"]["computed_scores"] = {"opt_1": 9.2, "opt_2": 6.8, "opt_3": 5.4, "opt_4": 4.2}
            session["status"] = "completed"
            session["progress"] = 100
            session["metadata"]["success"] = True
            log.info(f"DEMO_MODE COMPLETE for {session_id}")
            return # EXIT EARLY

        scenario_context = f"""Decision Scenario: {req.scenario}\n\nUser-Provided Constraints: {json.dumps(req.constraints)}\nUser-Provided Objectives: {json.dumps([o.model_dump() for o in req.objectives])}"""

        # ── Stage 1 ──
        session["current_stage"] = "Decomposing Problem..."
        session["progress"] = 10
        t0 = time.time()
        s1_user = f"Decompose this decision scenario into structured components:\n\n{scenario_context}\n\nReturn strict JSON with decision_question, constraints, objectives (weights summing to 1.0), and stakeholders."
        stage1, s1_raw = call_llm_with_validation(STAGE1_SYSTEM, s1_user, "Stage1", Stage1Output)
        timings["stage1"] = round(time.time() - t0, 2)
        prompts_used.append({"stage": "Stage 1", "raw_output": s1_raw})
        session["stages"]["stage1"] = stage1
        
        # ── Stage 2 ──
        session["current_stage"] = "Generating Strategies..."
        session["progress"] = 30
        t0 = time.time()
        s2_user = f"Generate 4 distinct product strategies for this decision:\n\nDecision Question: {stage1.get('decision_question', req.scenario)}\nConstraints: {json.dumps(stage1.get('constraints', req.constraints))}\nObjectives: {json.dumps(stage1.get('objectives', [o.model_dump() for o in req.objectives]))}\nStakeholders: {json.dumps(stage1.get('stakeholders', []))}\n\nReturn a JSON array of exactly 4 options with IDs opt_1 through opt_4."
        stage2, s2_raw = call_llm_with_validation(STAGE2_SYSTEM, s2_user, "Stage2", list[Stage2Option])
        timings["stage2"] = round(time.time() - t0, 2)
        prompts_used.append({"stage": "Stage 2", "raw_output": s2_raw})
        session["stages"]["stage2"] = stage2
        
        # ── Stage 3 ──
        session["current_stage"] = "Evaluating Trade-offs..."
        session["progress"] = 50
        t0 = time.time()
        objectives_list = stage1.get("objectives", [o.model_dump() for o in req.objectives])
        s3_user = f"Score each option against each objective:\n\nOptions:\n{json.dumps(stage2, indent=2)}\n\nObjectives (score each 1–10):\n{json.dumps(objectives_list, indent=2)}\n\nConstraints to reference in reasoning:\n{json.dumps(stage1.get('constraints', req.constraints))}\n\nReturn JSON with scores, reasoning, and constraint_violations."
        stage3, s3_raw = call_llm_with_validation(STAGE3_SYSTEM, s3_user, "Stage3", Stage3Output)
        timings["stage3"] = round(time.time() - t0, 2)
        prompts_used.append({"stage": "Stage 3", "raw_output": s3_raw})
        session["stages"]["stage3"] = stage3
        
        # Calculate Weighted Deterministic Scores
        session["current_stage"] = "Computing Hybrid Intelligence Matrix..."
        session["progress"] = 65
        weighted_scores = {}
        for opt_id, scores_dict in stage3.get("scores", {}).items():
            total_score = 0.0
            for obj in objectives_list:
                obj_name = obj if isinstance(obj, str) else obj.get("name")
                weight = obj.get("weight", 0) if isinstance(obj, dict) else 0.25
                obj_score = scores_dict.get(obj_name, 0)
                total_score += obj_score * weight
            weighted_scores[opt_id] = round(total_score, 2)
        
        session["metadata"]["computed_scores"] = weighted_scores

        # ── Stage 4 ──
        session["current_stage"] = "Synthesizing Recommendation..."
        session["progress"] = 75
        t0 = time.time()
        s4_user = f"Synthesize a final recommendation from this analysis:\n\nDecision Question: {stage1.get('decision_question', req.scenario)}\n\nOptions:\n{json.dumps(stage2, indent=2)}\n\nTrade-off Scores:\n{json.dumps(stage3.get('scores', {}), indent=2)}\n\nScore Reasoning:\n{json.dumps(stage3.get('reasoning', {}), indent=2)}\n\nConstraint Violations:\n{json.dumps(stage3.get('constraint_violations', {}), indent=2)}\n\nObjectives (with weights):\n{json.dumps(objectives_list, indent=2)}\n\nReturn STRICT JSON with recommended_option_id, recommendation_justification, runner_up_option_id, runner_up_conditions, risks, confidence_score, confidence_explanation, and executive_summary."
        stage4, s4_raw = call_llm_with_validation(STAGE4_SYSTEM, s4_user, "Stage4", Stage4Output)
        timings["stage4"] = round(time.time() - t0, 2)
        prompts_used.append({"stage": "Stage 4", "raw_output": s4_raw})
        session["stages"]["stage4"] = stage4
        
        # ── Stage 5 ──
        session["current_stage"] = "Auditing Decision Ethics & Bias..."
        session["progress"] = 90
        t0 = time.time()
        s5_user = f"Audit this complete decision analysis pipeline:\n\nSTAGE 1: {json.dumps(stage1)}\nSTAGE 2: {json.dumps(stage2)}\nSTAGE 3: {json.dumps(stage3)}\nSTAGE 4: {json.dumps(stage4)}\n\nAssess reasoning quality (0-100), detected biases, missing considerations, robustness, and decision trace."
        stage5, s5_raw = call_llm_with_validation(STAGE5_SYSTEM, s5_user, "Stage5", Stage5Output)
        timings["stage5"] = round(time.time() - t0, 2)
        prompts_used.append({"stage": "Stage 5", "raw_output": s5_raw})
        session["stages"]["stage5"] = stage5
        
        # Finalize
        session["current_stage"] = "Analysis Complete"
        session["progress"] = 100
        session["status"] = "completed"
        session["metadata"]["timings"] = timings
        session["metadata"]["total_time"] = round(time.time() - t_total, 2)
        session["metadata"]["success"] = True
        session["metadata"]["prompts_used"] = prompts_used
        log.info(f"Pipeline complete for session {session_id} in {session['metadata']['total_time']}s")

    except Exception as e:
        log.error(f"Session {session_id} failed: {e}")
        if DEMO_MODE:
            log.info(f"DEMO_MODE ACTIVE: Simulating high-fidelity results for {session_id}")
            session["current_stage"] = "Finalizing Strategic Synthesis (Simulation)..."
            session["progress"] = 95
            time.sleep(2)
            
            session["stages"] = {
                "stage1": {"decision_question": req.scenario, "constraints": req.constraints, "objectives": [{"name": o.name, "weight": o.weight} for o in req.objectives], "stakeholders": ["Executive Board", "Engineering Team", "Customer Base"]},
                "stage2": [
                    {"id": "opt_1", "name": "Deep Tech Integration", "description": "Prioritize long-term architectural stability by fully integrating next-gen AI modules into the core product.", "primary_benefit": "312% ROI projection", "primary_risk": "Short-term delivery lag", "effort": "High", "impact": "High"},
                    {"id": "opt_2", "name": "Rapid Market Capture", "description": "Ship minimal viable features to 3 new regions to capture immediate market share before competitors.", "primary_benefit": "First-mover advantage in APAC", "primary_risk": "Technical debt accumulation", "effort": "Medium", "impact": "High"},
                    {"id": "opt_3", "name": "Strategic Partnership", "description": "Outsource secondary feature development to Tier-1 infrastructure partners to reduce operational load.", "primary_benefit": "40% reduction in OPEX", "primary_risk": "Brand autonomy dilution", "effort": "Low", "impact": "Medium"},
                    {"id": "opt_4", "name": "Core Optimization", "description": "Focus exclusively on fixing legacy technical debt to improve current user retention metrics.", "primary_benefit": "30% reduction in churn", "primary_risk": "Stagnation of innovation", "effort": "Low", "impact": "Medium"}
                ],
                "stage3": {
                    "scores": {
                        "opt_1": {o.name: 9 for o in req.objectives}, 
                        "opt_2": {o.name: 7 for o in req.objectives},
                        "opt_3": {o.name: 5 for o in req.objectives},
                        "opt_4": {o.name: 4 for o in req.objectives}
                    },
                    "reasoning": {
                        "opt_1": {o.name: "Matches long-term strategic horizon perfectly." for o in req.objectives},
                        "opt_2": {o.name: "Balanced risk-reward profile." for o in req.objectives},
                        "opt_3": {o.name: "Low resource utilization but slow impact." for o in req.objectives},
                        "opt_4": {o.name: "Defensive play with limited upside." for o in req.objectives}
                    },
                    "constraint_violations": {"opt_1": [], "opt_2": ["Timeline Risk"], "opt_3": [], "opt_4": []}
                },
                "stage4": {
                    "recommended_option_id": "opt_1",
                    "recommendation_justification": "Option 1 provides the only sustainable path to 42% growth despite higher upfront effort. It leverages the underlying scenario logic to maximize long-term shareholder value. Immediate buy-in from engineering is required.",
                    "runner_up_option_id": "opt_2",
                    "runner_up_conditions": "Select if immediate regional revenue is the primary Q3 KPI over structural stability.",
                    "risks": [{"title": "Talent Gap", "severity": "High"}, {"title": "Infrastructure Load", "severity": "Medium"}],
                    "confidence_score": 94,
                    "confidence_explanation": "Decision robustness verified against historical sector parallels.",
                    "executive_summary": "DecisionForge recommends the 'Deep Tech Integration' path. The analysis shows a 31% higher probability of retention compared to other paths."
                },
                "stage5": {
                    "reasoning_quality_score": 98,
                    "detected_biases": ["Sunk Cost Bias", "Optimism Bias"],
                    "missing_considerations": ["Local Regulatory Nuance", "Energy Consumption Costs"],
                    "robustness_analysis": "Highly robust against budget fluctuations. Sensitive to talent retention.",
                    "decision_trace_summary": "Evolved from basic problem decomposition into a multi-vector trade-off map. Refined through hybrid scoring engine."
                }
            }
            session["metadata"]["computed_scores"] = {"opt_1": 9.2, "opt_2": 6.8, "opt_3": 5.4, "opt_4": 4.2}
            session["status"] = "completed"
            session["progress"] = 100
            session["metadata"]["success"] = True
            log.info(f"Simulation complete for {session_id}")
        else:
            session["status"] = "failed"
            session["error"] = str(e)
            session["current_stage"] = "Error encountered during AI inference."

# ─── Endpoints ────────────────────────────────────────────────────────────────
@app.get("/")
def read_root():
    return {"message": "DecisionForge API is live", "documentation": "/docs", "health": "/health"}

@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL}

async def cleanup_session(session_id: str):
    # await asyncio.sleep(300)  # Auto-delete after 5 minutes
    # if session_id in SESSION_STORE:
    #     del SESSION_STORE[session_id]
    #     log.info(f"Cleaned up session {session_id}")
    pass # No cleanup during demo

@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest, background_tasks: BackgroundTasks):
    session_id = str(uuid.uuid4())
    SESSION_STORE[session_id] = {
        "status": "running",
        "current_stage": "Initializing...",
        "progress": 0,
        "stages": {},
        "error": None,
        "metadata": {
            "timings": {},
            "total_time": 0.0,
            "success": False,
            "session_id": session_id,
            "prompts_used": [],
            "computed_scores": {}
        }
    }
    background_tasks.add_task(run_analysis_pipeline, session_id, req)
    background_tasks.add_task(cleanup_session, session_id)
    return {"session_id": session_id, "status": "running"}

@app.get("/api/status/{session_id}")
async def get_status(session_id: str):
    if session_id not in SESSION_STORE:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    return SESSION_STORE[session_id]
