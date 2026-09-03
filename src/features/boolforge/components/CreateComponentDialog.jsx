import { useState } from "react";

export function CreateComponentDialog({ open, onClose, onCreate, portCount }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await onCreate(name.trim());
      setName("");
      onClose();
    } catch (err) {
      setError(err?.message || "Could not save this component. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="rename-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="rename-title">📦 Create Custom Component</h3>
        <p className="rename-text">
          <strong className="gate-type">
            {portCount.inputs} input{portCount.inputs !== 1 ? "s" : ""}, {portCount.outputs} output{portCount.outputs !== 1 ? "s" : ""}
          </strong>{" "}
          detected in your selection.
        </p>
        <input
          autoFocus
          className="rename-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Component name"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
            if (e.key === "Escape") onClose();
          }}
        />
        {error && (
          <p className="rename-text" style={{ color: "var(--accent-danger, #ff3366)" }}>
            {error}
          </p>
        )}
        <div className="rename-actions">
          <button className="btn cancel-btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn rename-btn" onClick={handleCreate} disabled={saving || !name.trim()}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}