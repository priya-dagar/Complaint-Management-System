import ComplaintUploadForm from "./components/ComplaintUploadForm";
import ComplaintLogForm from "./components/ComplaintLogForm";
import ComplaintList from "./components/ComplaintList";

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Customer Complaint Management</h1>
          <div className="subtitle">AIVOA · Pharmaceutical Quality Management System</div>
        </div>
      </header>

      <div className="main-grid">
        <ComplaintLogForm />
        <ComplaintUploadForm />
      </div>

      <ComplaintList />
    </div>
  );
}