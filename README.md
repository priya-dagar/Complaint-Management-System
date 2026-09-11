# AI-Powered Customer Complaint Management System

Built for the AIVOA Round 1 AI Product Engineer (Interns) assignment — an AI-powered
Customer Complaint Management System for the pharmaceutical manufacturing industry
(API and FDF).

## What it does

A QA team member pastes in a customer complaint (email/report text) or uploads a
complaint document (PDF/TXT/EML). An AI agent built with **LangGraph** extracts the
structured complaint details (customer, product, batch number, manufacturing/expiry
dates, etc.) and assesses the complaint's **risk level and triage priority** based on
pharma quality-risk principles (patient safety impact, product quality impact,
regulatory reportability). The results auto-populate a structured "Log Customer
Complaint" form for QA review.

## Screenshots

> _Add screenshots here before submitting._

**Main dashboard — complaint form + AI intake assistant**

[Dashboard](docs/screenshots/dashboard.png)

**A complaint analyzed from pasted text**

[Analyzed complaint](docs/screenshots/analyzed-complaint.png) 

**Uploading a PDF complaint document**

[File upload](docs/screenshots/file-upload.png)

**Logged complaints list**

[Complaints list](docs/screenshots/complaints-list.png) 

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Redux Toolkit (Vite) |
| Backend | Python, FastAPI |
| AI Agent Framework | LangGraph |
| LLM Provider | Groq |
| Database | PostgreSQL (Neon) |
| Font | Google Inter |

## Architecture

```
User (paste text / upload PDF)
        │
        ▼
FastAPI endpoint (/complaints/analyze or /complaints/analyze-file)
        │
        ▼
LangGraph agent
   ├── Node 1: extract_fields   → pulls customer/product/batch/dates/etc. from raw text
   └── Node 2: classify_risk    → assigns risk level, score, reasoning, and priority
        │
        ▼
Saved to Postgres (Neon) → returned to frontend
        │
        ▼
Redux store updates → auto-fills the "Log Customer Complaint" form
```

The two LangGraph nodes are intentionally simple (`extract_fields → classify_risk →
END`) so the flow is easy to reason about and extend — e.g. a duplicate-detection or
CAPA-recommendation node could branch off `classify_risk` without restructuring
anything.

## A note on the LLM model

The assignment specifies `gemma2-9b-it`. As of testing, **this model has been
decommissioned by Groq** (confirmed via Groq's own API error and deprecations page).
`llama-3.3-70b-versatile` has also since moved to Groq's Enterprise-only tier and is
not accessible with a standard developer API key.

This project uses **`openai/gpt-oss-20b`** (extraction) and **`openai/gpt-oss-120b`**
(risk classification) instead — both are on Groq's standard developer tier. These are
configured in `backend/app/config.py` and can be swapped for any other Groq-hosted
model by changing two lines.

## Project structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app, CORS, startup
│   ├── config.py             # env-based settings
│   ├── database.py           # Postgres/Neon connection (SQLAlchemy)
│   ├── models.py              # Complaint table
│   ├── schemas.py             # Pydantic request/response models
│   ├── routes/complaints.py  # API endpoints
│   └── agent/
│       ├── prompts.py         # extraction + risk-classification prompts
│       ├── nodes.py           # LangGraph node functions (call Groq)
│       └── graph.py           # LangGraph graph definition
└── requirements.txt

frontend/
├── src/
│   ├── App.jsx
│   ├── api/complaintApi.js       # axios calls to backend
│   ├── store/                     # Redux Toolkit store + slice
│   └── components/
│       ├── ComplaintUploadForm.jsx   # AI intake assistant (upload/paste)
│       ├── ComplaintLogForm.jsx      # auto-filled complaint form
│       └── ComplaintList.jsx         # logged complaints table
└── package.json
```

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/complaints/analyze` | Analyze pasted complaint text |
| POST | `/complaints/analyze-file` | Upload and analyze a PDF/TXT/EML complaint document |
| GET | `/complaints` | List all logged complaints |
| GET | `/complaints/{id}` | Get full details for one complaint |
| PATCH | `/complaints/{id}/status` | Update a complaint's status (used by "Save Complaint") |

Interactive API docs available at `http://localhost:8000/docs` once the backend is running.

## Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- A [Groq API key](https://console.groq.com) (free tier)
- A [Neon](https://neon.tech) Postgres database (free tier)

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

pip install -r requirements.txt

# Copy the env template and fill in your Groq key + Neon connection string
copy .env.example .env        # Windows
# cp .env.example .env        # macOS/Linux

uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`. The `complaints` table is created
automatically on first startup.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Sample complaints for testing

Three sample complaint documents (covering Critical, High, and Low risk scenarios)
are included in `sample-complaints/` for demo purposes, as permitted by the
assignment ("You may create your own realistic pharmaceutical complaint PDFs,
emails, or images for demonstration").

## Bonus features implemented

- Real file upload and parsing (PDF via `pypdf`, plain text for TXT/EML) — not just
  pasted text.

<!-- Add any additional bonus feature here, e.g.:
- Duplicate Complaint Detection
- CAPA Recommendation
-->

## Known limitations

- OCR/document parsing is not production-grade, per the assignment's note that this
  isn't required.
- The extraction schema and risk-classification logic are purpose-built for
  pharmaceutical complaints (patient safety, batch/lot tracking, regulatory
  reportability) rather than a generic complaint tool.