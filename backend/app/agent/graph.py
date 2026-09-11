"""
Builds the LangGraph StateGraph: extract_fields -> classify_risk -> END.

This is intentionally a simple linear graph for the MVP. It's easy to
extend later (e.g. add a duplicate-detection or CAPA-suggestion node
branching off classify_risk) without restructuring anything here.
"""
from langgraph.graph import StateGraph, END

from app.agent.nodes import ComplaintState, extract_fields, classify_risk


def build_complaint_graph():
    graph = StateGraph(ComplaintState)

    graph.add_node("extract_fields", extract_fields)
    graph.add_node("classify_risk", classify_risk)

    graph.set_entry_point("extract_fields")
    graph.add_edge("extract_fields", "classify_risk")
    graph.add_edge("classify_risk", END)

    return graph.compile()


# Compiled once at import time, reused across requests.
complaint_graph = build_complaint_graph()