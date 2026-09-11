import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/**
 * Sends raw complaint text to the backend, which runs it through the
 * LangGraph agent (extract fields -> classify risk) and returns the
 * structured result to auto-fill the form + risk panel.
 */
export async function analyzeComplaint(rawText) {
  const response = await client.post("/complaints/analyze", { raw_text: rawText });
  return response.data;
}

/**
 * Uploads a complaint document (PDF/TXT/EML), backend extracts text and
 * runs it through the same LangGraph agent as analyzeComplaint.
 */
export async function analyzeComplaintFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await client.post("/complaints/analyze-file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

/** Updates a complaint's status - used by the "Save Complaint" action. */
export async function updateComplaintStatus(id, status) {
  const response = await client.patch(`/complaints/${id}/status`, { status });
  return response.data;
}

/** Fetches the list of previously logged complaints (dashboard/table view). */
export async function fetchComplaints() {
  const response = await client.get("/complaints");
  return response.data;
}

/** Fetches full detail for a single complaint by id. */
export async function fetchComplaintById(id) {
  const response = await client.get(`/complaints/${id}`);
  return response.data;
}