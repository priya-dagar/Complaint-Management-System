from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pypdf import PdfReader
import io

from app.database import get_db
from app.models import Complaint
from app.schemas import (
    ComplaintAnalyzeRequest,
    ComplaintAnalyzeResponse,
    ComplaintListItem,
    ComplaintStatusUpdate,
)
from app.agent.graph import complaint_graph

router = APIRouter(prefix="/complaints", tags=["complaints"])


def _run_agent_and_save(raw_text: str, db: Session) -> Complaint:
    """Shared by both the text and file-upload endpoints: run the LangGraph
    agent on raw text, save the result, return the saved row."""
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="No text found to analyze")

    try:
        result = complaint_graph.invoke({"raw_text": raw_text})
    except Exception as e:
        # Covers Groq API errors, malformed JSON from the LLM, etc.
        raise HTTPException(status_code=502, detail=f"AI agent failed: {e}")

    complaint = Complaint(
        raw_text=raw_text,
        complaint_source=result.get("complaint_source"),
        customer_name=result.get("customer_name"),
        product_name=result.get("product_name"),
        product_strength=result.get("product_strength"),
        batch_number=result.get("batch_number"),
        manufacturing_date=result.get("manufacturing_date"),
        expiry_date=result.get("expiry_date"),
        quantity_affected=result.get("quantity_affected"),
        complaint_type=result.get("complaint_type"),
        complaint_date=result.get("complaint_date"),
        description=result.get("description"),
        risk_level=result.get("risk_level"),
        risk_score=result.get("risk_score"),
        risk_reasoning=result.get("risk_reasoning"),
        priority=result.get("priority"),
        status="Pending Triage",
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint


def _extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    pages_text = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages_text).strip()


@router.post("/analyze", response_model=ComplaintAnalyzeResponse)
def analyze_complaint(payload: ComplaintAnalyzeRequest, db: Session = Depends(get_db)):
    """Core endpoint: takes pasted raw complaint text, runs the LangGraph
    agent, saves the result, and returns it to auto-fill the form."""
    return _run_agent_and_save(payload.raw_text, db)


@router.post("/analyze-file", response_model=ComplaintAnalyzeResponse)
async def analyze_complaint_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Takes an uploaded complaint document (PDF or plain text/.txt/.eml),
    extracts its text, then runs it through the same LangGraph agent.
    Not production-grade OCR - just enough to demo the workflow, per
    the assignment's note that production-grade parsing isn't required.
    """
    file_bytes = await file.read()
    filename = (file.filename or "").lower()

    if filename.endswith(".pdf"):
        try:
            raw_text = _extract_text_from_pdf(file_bytes)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not read PDF: {e}")
    else:
        # Treat .txt, .eml, or anything else as plain text.
        try:
            raw_text = file_bytes.decode("utf-8", errors="ignore")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not read file: {e}")

    return _run_agent_and_save(raw_text, db)


@router.get("", response_model=List[ComplaintListItem])
def list_complaints(db: Session = Depends(get_db)):
    """Lightweight list for a complaints table/dashboard view."""
    return db.query(Complaint).order_by(Complaint.created_at.desc()).all()


@router.get("/{complaint_id}", response_model=ComplaintAnalyzeResponse)
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


@router.patch("/{complaint_id}/status", response_model=ComplaintAnalyzeResponse)
def update_complaint_status(
    complaint_id: int, payload: ComplaintStatusUpdate, db: Session = Depends(get_db)
):
    """Used by the 'Save Complaint' button to move a complaint out of
    Pending Triage once QA has reviewed the auto-filled form."""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    complaint.status = payload.status
    db.commit()
    db.refresh(complaint)
    return complaint