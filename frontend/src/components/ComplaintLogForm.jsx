import { useDispatch, useSelector } from "react-redux";
import { resetForm, saveComplaintStatus } from "../store/complaintSlice";

// Section 1
const ORIGIN_FIELDS = [
  { key: "complaint_source", label: "Complaint Source" },
  { key: "customer_name", label: "Customer Name" },
];
// Section 2
const PRODUCT_FIELDS = [
  { key: "product_name", label: "Product Name" },
  { key: "product_strength", label: "Product Strength/Grade" },
  { key: "batch_number", label: "Batch/Lot Number" },
  { key: "manufacturing_date", label: "Manufacturing Date" },
  { key: "expiry_date", label: "Expiry Date" },
  { key: "quantity_affected", label: "Quantity Affected" },
];
// Section 3
const COMPLAINT_FIELDS = [
  { key: "complaint_type", label: "Complaint Type" },
  { key: "complaint_date", label: "Complaint Date" },
];

function Field({ field, value, disabled }) {
  return (
    <div className="field">
      <label>{field.label}</label>
      <input
        defaultValue={value || ""}
        disabled={disabled}
        placeholder={disabled ? "Awaiting AI extraction..." : ""}
      />
    </div>
  );
}

export default function ComplaintLogForm() {
  const dispatch = useDispatch();
  const { current, analyzeStatus, saveStatus } = useSelector((s) => s.complaint);
  const hasData = !!current;
  const disabled = !hasData;
  const c = current || {};

  const isLogged = c.status === "Logged";

  return (
    <div className="card">
      <div className="form-header">
        <div>
          <div className="card-title">Log Customer Complaint</div>
          <div className="card-subtitle" style={{ marginBottom: 0 }}>
            API &amp; FDF Quality Assurance Module
          </div>
        </div>
        <span className={`status-badge ${isLogged ? "logged" : ""}`}>
          {hasData ? c.status : "Pending Triage"}
        </span>
      </div>

      <div className="form-section">
        <div className="section-label">1. ORIGIN &amp; CUSTOMER DETAILS</div>
        <div className="field-row">
          {ORIGIN_FIELDS.map((f) => (
            <Field key={f.key} field={f} value={c[f.key]} disabled={disabled} />
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="section-label">2. PRODUCT &amp; BATCH IDENTIFICATION</div>
        <div className="field-row">
          {PRODUCT_FIELDS.map((f) => (
            <Field key={f.key} field={f} value={c[f.key]} disabled={disabled} />
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="section-label">3. COMPLAINT DETAILS</div>
        <div className="field-row">
          {COMPLAINT_FIELDS.map((f) => (
            <Field key={f.key} field={f} value={c[f.key]} disabled={disabled} />
          ))}
        </div>
        <div className="field">
          <label>Detailed Complaint Description</label>
          <textarea
            defaultValue={c.description || ""}
            disabled={disabled}
            placeholder={disabled ? "Awaiting AI extraction..." : ""}
            style={{ minHeight: 80 }}
          />
        </div>
      </div>

      <div className="form-section">
        <div className="section-label">4. INITIAL ASSESSMENT &amp; PRIORITY</div>
        <div className="field-row">
          <div className="field">
            <label>Initial Severity</label>
            <input
              defaultValue={c.risk_level || ""}
              disabled={disabled}
              placeholder={disabled ? "Awaiting AI extraction..." : ""}
            />
          </div>
          <div className="field">
            <label>Priority</label>
            <input
              defaultValue={c.priority || ""}
              disabled={disabled}
              placeholder={disabled ? "Awaiting AI extraction..." : ""}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => dispatch(resetForm())}
        >
          Reset Form
        </button>
        <button
          type="button"
          className="btn-primary inline"
          disabled={disabled || saveStatus === "loading"}
          onClick={() =>
            hasData && dispatch(saveComplaintStatus({ id: c.id, status: "Logged" }))
          }
        >
          {saveStatus === "loading" ? "Saving..." : "Save Complaint"}
        </button>
      </div>
    </div>
  );
}