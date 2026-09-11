"""
The two nodes of our LangGraph agent.

Flow:  raw_text -> [extract_fields] -> [classify_risk] -> final state

Each node calls Groq via langchain_groq, asks for strict JSON output,
and parses it into the shared graph state.
"""
import json
from typing import TypedDict, Optional

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from app.config import settings
from app.agent.prompts import EXTRACTION_SYSTEM_PROMPT, RISK_CLASSIFICATION_SYSTEM_PROMPT


class ComplaintState(TypedDict, total=False):
    raw_text: str
    complaint_source: Optional[str]
    customer_name: Optional[str]
    product_name: Optional[str]
    product_strength: Optional[str]
    batch_number: Optional[str]
    manufacturing_date: Optional[str]
    expiry_date: Optional[str]
    quantity_affected: Optional[str]
    complaint_type: Optional[str]
    complaint_date: Optional[str]
    description: Optional[str]
    risk_level: Optional[str]
    risk_score: Optional[float]
    risk_reasoning: Optional[str]
    priority: Optional[str]


def _call_llm_json(system_prompt: str, user_content: str, model: str) -> dict:
    """Call Groq with a system+user message, expect strict JSON back."""
    llm = ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=model,
        temperature=0.1,
        model_kwargs={"response_format": {"type": "json_object"}},
    )
    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_content),
    ])
    text = response.content.strip()

    if text.startswith("```"):
        text = text.strip("`")
        text = text.replace("json\n", "", 1) if text.startswith("json\n") else text

    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start:end + 1]

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Model returned invalid JSON: {e}. Raw output: {text[:300]}")


def extract_fields(state: ComplaintState) -> ComplaintState:
    """Node 1: pull structured complaint fields out of raw text."""
    parsed = _call_llm_json(
        EXTRACTION_SYSTEM_PROMPT,
        state["raw_text"],
        model=settings.GROQ_MODEL_EXTRACT,
    )
    return {
        **state,
        "complaint_source": parsed.get("complaint_source"),
        "customer_name": parsed.get("customer_name"),
        "product_name": parsed.get("product_name"),
        "product_strength": parsed.get("product_strength"),
        "batch_number": parsed.get("batch_number"),
        "manufacturing_date": parsed.get("manufacturing_date"),
        "expiry_date": parsed.get("expiry_date"),
        "quantity_affected": parsed.get("quantity_affected"),
        "complaint_type": parsed.get("complaint_type"),
        "complaint_date": parsed.get("complaint_date"),
        "description": parsed.get("description"),
    }


def classify_risk(state: ComplaintState) -> ComplaintState:
    """Node 2: assess risk level + priority based on the extracted complaint."""
    summary_for_llm = json.dumps({
        "product_name": state.get("product_name"),
        "complaint_type": state.get("complaint_type"),
        "description": state.get("description"),
        "raw_text": state["raw_text"],
    })
    parsed = _call_llm_json(
        RISK_CLASSIFICATION_SYSTEM_PROMPT,
        summary_for_llm,
        model=settings.GROQ_MODEL_CONTEXT,
    )
    return {
        **state,
        "risk_level": parsed.get("risk_level"),
        "risk_score": parsed.get("risk_score"),
        "risk_reasoning": parsed.get("risk_reasoning"),
        "priority": parsed.get("priority"),
    }