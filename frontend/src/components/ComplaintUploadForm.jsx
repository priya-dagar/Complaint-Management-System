import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitComplaintForAnalysis, submitComplaintFile } from "../store/complaintSlice";

const SAMPLE_TEXT =
  "Hi, I'm Rajesh Kumar from ABC Pharmacy. We received Batch #B2024-0451 of " +
  "Paracetamol 500mg tablets and noticed several tablets were discolored and " +
  "had an unusual odor. Please investigate urgently.";

export default function ComplaintUploadForm() {
  const dispatch = useDispatch();
  const { analyzeStatus, analyzeError } = useSelector((s) => s.complaint);
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const isLoading = analyzeStatus === "loading";

  // Clear local input state whenever the form is reset (analyzeStatus goes
  // back to "idle" via the resetForm action in the slice).
  useEffect(() => {
    if (analyzeStatus === "idle") {
      setText("");
      setShowPasteBox(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [analyzeStatus]);

  const handleFile = (file) => {
    if (!file) return;
    dispatch(submitComplaintFile(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handlePasteSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch(submitComplaintForAnalysis(text));
  };

  let assistantMessage =
    "Upload a complaint document or paste text below. I will automatically extract the details and populate the form for you.";
  if (isLoading) {
    assistantMessage = "Analyzing document content and extracting key details. This may take a few moments.";
  } else if (analyzeStatus === "succeeded") {
    assistantMessage = "Done — I've extracted the complaint details and filled in the form. Review and edit anything that needs correcting before saving.";
  } else if (analyzeStatus === "failed") {
    assistantMessage = `I couldn't process that complaint: ${String(analyzeError)}`;
  }

  return (
    <div className="card">
      <div className="ai-panel-header">
        <div className="ai-panel-title">AI Complaint Intake Assistant</div>
        <span className="beta-tag">BETA</span>
      </div>

      <div
        className={`dropzone ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div style={{ fontSize: 22 }}>&#8593;</div>
        <div className="dropzone-title">Drag &amp; drop complaint document here</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
          or <span className="dropzone-link">click to browse</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.eml"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 8 }}>
        Supported formats: PDF, TXT, EML &middot; Max file size 10MB
      </div>

      <div className="divider-or">OR</div>

      {!showPasteBox ? (
        <button
          type="button"
          className="btn-secondary"
          style={{ width: "100%" }}
          onClick={() => setShowPasteBox(true)}
        >
          Paste Complaint Text / Email
        </button>
      ) : (
        <form onSubmit={handlePasteSubmit}>
          <div className="field">
            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the complaint email or description here..."
              style={{ minHeight: 110 }}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Analyze complaint"}
          </button>
          <button
            type="button"
            onClick={() => setText(SAMPLE_TEXT)}
            style={{
              marginTop: 10,
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: 12,
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            Use sample complaint
          </button>
        </form>
      )}

      {isLoading && (
        <>
          <div className="progress-label">
            <span>EXTRACTION PROGRESS</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: "60%" }} />
          </div>
        </>
      )}

      <div className="assistant-bubble">{assistantMessage}</div>
    </div>
  );
}