from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ComplaintAnalyzeRequest(BaseModel):
    """What the frontend sends when submitting raw complaint text."""
    raw_text: str


class ComplaintAnalyzeResponse(BaseModel):
    """
    What the backend returns after LangGraph runs.
    Frontend uses this to auto-fill the Log Complaint form
    and the AI risk/priority fields.
    """
    id: int
    complaint_source: Optional[str] = None
    customer_name: Optional[str] = None
    product_name: Optional[str] = None
    product_strength: Optional[str] = None
    batch_number: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    quantity_affected: Optional[str] = None
    complaint_type: Optional[str] = None
    complaint_date: Optional[str] = None
    description: Optional[str] = None
    risk_level: Optional[str] = None
    risk_score: Optional[float] = None
    risk_reasoning: Optional[str] = None
    priority: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ComplaintListItem(BaseModel):
    """Lightweight shape for listing complaints in a table view."""
    id: int
    product_name: Optional[str] = None
    complaint_type: Optional[str] = None
    risk_level: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ComplaintStatusUpdate(BaseModel):
    """Used by the 'Save Complaint' action to move it out of Pending Triage."""
    status: str