from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.sql import func

from app.database import Base


class Complaint(Base):
    """
    One row per customer complaint. Fields below match what the
    'Log Customer Complaint' form in the reference UI needs, plus
    what the AI Copilot risk assessment produces.
    """
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)

    # --- Raw input (what the user uploaded/pasted) ---
    raw_text = Column(Text, nullable=False)

    # --- Fields extracted by the LangGraph "extract_fields" node ---
    complaint_source = Column(String(100), nullable=True)   # e.g. Email, Phone, Portal
    customer_name = Column(String(255), nullable=True)
    product_name = Column(String(255), nullable=True)
    product_strength = Column(String(100), nullable=True)   # e.g. "500mg"
    batch_number = Column(String(100), nullable=True)
    manufacturing_date = Column(String(50), nullable=True)  # stored as text (varied formats from source docs)
    expiry_date = Column(String(50), nullable=True)
    quantity_affected = Column(String(50), nullable=True)   # e.g. "12 units" - kept as text, unit varies
    complaint_type = Column(String(100), nullable=True)   # e.g. Quality, Packaging, Adverse Event
    complaint_date = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)

    # --- Fields produced by the "classify_risk" node ---
    risk_level = Column(String(50), nullable=True)   # Low / Medium / High / Critical - shown as "Initial Severity"
    risk_score = Column(Float, nullable=True)         # 0-1 confidence/severity score
    risk_reasoning = Column(Text, nullable=True)      # short explanation from the LLM
    priority = Column(String(50), nullable=True)      # Low / Medium / High / Urgent

    # --- Workflow metadata ---
    status = Column(String(50), default="New")  # New, Under Review, Closed
    created_at = Column(DateTime(timezone=True), server_default=func.now())