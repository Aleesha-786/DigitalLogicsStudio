import { useState } from "react";

// Mirrors SaveAndLoad.jsx's modal pattern exactly (same overlay/card
// classNames) so it looks and behaves consistently with the rest of
// Boolforge's UI.
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
    <div className="logic-circuit-project-manager-fullscreen-overlay-background-container">
      <div className="logic-circuit-project-manager-modal-window-card-container">
        <h3 className="logic-circuit-project-manager-modal-title-text-heading">
          Create Custom Component
        </h3>

        <p style={{ fontSize: "0.85rem", opacity: 0.75, marginBottom: "10px" }}>
          {portCount.inputs} input{portCount.inputs !== 1 ? "s" : ""} · {portCount.outputs} output{portCount.outputs !== 1 ? "s" : ""} detected in your selection.
        </p>

        <input
          className="logic-circuit-project-manager-project-name-text-input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Component name"
          autoFocus
        />

        {error && (
          <p className="logic-circuit-project-manager-import-error-message">{error}</p>
        )}

        <div className="logic-circuit-project-manager-modal-button-row-layout-wrapper">
          <button
            className="logic-circuit-project-manager-confirm-save-button"
            onClick={handleCreate}
            disabled={saving || !name.trim()}
          >
            {saving ? "Saving…" : "Save Component"}
          </button>
          <button
            className="logic-circuit-project-manager-cancel-close-button"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}