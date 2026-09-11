import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadComplaintList, loadComplaintDetail } from "../store/complaintSlice";

const RISK_STYLE = { Low: "low", Medium: "medium", High: "high", Critical: "critical" };

export default function ComplaintList() {
  const dispatch = useDispatch();
  const { list, listStatus, current } = useSelector((s) => s.complaint);

  // Reload the list whenever a new complaint is successfully analyzed,
  // so the table stays in sync with what was just logged.
  useEffect(() => {
    dispatch(loadComplaintList());
  }, [dispatch, current]);

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="card-title">Logged complaints</div>
      <div className="card-subtitle">All complaints processed so far.</div>

      {listStatus === "succeeded" && list.length === 0 && (
        <div className="empty-state">No complaints logged yet.</div>
      )}

      {list.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Type</th>
              <th>Risk</th>
              <th>Status</th>
              <th>Logged</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr
                key={c.id}
                onClick={() => {
                  dispatch(loadComplaintDetail(c.id));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                style={{ cursor: "pointer" }}
              >
                <td>#{c.id}</td>
                <td>{c.product_name || "—"}</td>
                <td>{c.complaint_type || "—"}</td>
                <td>
                  <span className={`risk-badge ${RISK_STYLE[c.risk_level] || "medium"}`}>
                    <span className="risk-dot" />
                    {c.risk_level || "—"}
                  </span>
                </td>
                <td>
                  <span className="status-pill">{c.status}</span>
                </td>
                <td>{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}