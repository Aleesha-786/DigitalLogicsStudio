import { useState, useRef } from "react";

const STORAGE_KEY = "logic_editor_saved_projects_v1";

// `sheets` is the full multi-sheet project: [{ id, name, circuit }, ...]
// `loadSheets(sheetsArray)` replaces the whole project with the given sheets.
export function SaveAndLoad({ sheets, loadSheets }) {
  const [showSave, setShowSave] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [importError, setImportError] = useState("");
  const importFileRef = useRef(null);

  const getProjects = () =>
    JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  const setProjects = (p) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  };

  const saveProject = () => {
    if (!projectName.trim()) return;

    const projects = getProjects();

    if (projects[projectName]) {
      if (!window.confirm("Overwrite existing project?")) return;
    }

    projects[projectName] = {
      versions: [
        { sheets, time: Date.now() },
        ...(projects[projectName]?.versions || []),
      ].slice(0, 10),
    };

    setProjects(projects);
    setShowSave(false);
    setProjectName("");
  };

  const loadSnapshot = (snap) => {
    // Back-compat: older saves stored a single circuit (gates/wires/...)
    // instead of a sheets array. Wrap it into a single-sheet project.
    if (Array.isArray(snap.sheets) && snap.sheets.length > 0) {
      loadSheets(snap.sheets);
    } else if (Array.isArray(snap.gates)) {
      loadSheets([
        {
          name: "Sheet 1",
          circuit: {
            gates: snap.gates || [],
            wires: snap.wires || [],
            gateIdCounter: snap.gateIdCounter || 0,
            wireIdCounter: snap.wireIdCounter || 0,
            inputCounter: snap.inputCounter || 0,
            outputCounter: snap.outputCounter || 0,
          },
        },
      ]);
    }
    setShowLoad(false);
  };

  const deleteProject = (name) => {
    const p = getProjects();
    delete p[name];
    setProjects(p);
    setShowLoad(true);
  };

  // ── Export: download current project (all sheets) as a JSON file ─────────
  const exportJSON = () => {
    const exportData = { sheets, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boolforge-project-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Import: read a JSON file and load it as the current project ──────────
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError("");
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);

        const looksLikeSheets = Array.isArray(parsed.sheets) && parsed.sheets.length > 0;
        const looksLikeLegacyCircuit = Array.isArray(parsed.gates) && Array.isArray(parsed.wires);

        if (!looksLikeSheets && !looksLikeLegacyCircuit) {
          setImportError(
            "Invalid file: missing sheets/gates/wires. Is this a Boolforge JSON?",
          );
          return;
        }

        loadSnapshot(parsed);
      } catch {
        setImportError("Could not parse file. Make sure it is valid JSON.");
      }
    };

    reader.onerror = () => {
      setImportError("Failed to read the file. Please try again.");
    };

    reader.readAsText(file);

    // Reset input so the same file can be re-imported if needed
    e.target.value = "";
  };

  const projects = getProjects();
  const names = Object.keys(projects);

  return (
    <>
      <button
        className="logic-circuit-project-manager-primary-action-button first"
        onClick={() => setShowSave(true)}
      >
        Save Project
      </button>

      <button
        className="logic-circuit-project-manager-primary-action-button"
        onClick={() => setShowLoad(true)}
      >
        Load Project
      </button>

      {/* ── Export JSON button ── */}
      <button
        className="logic-circuit-project-manager-primary-action-button"
        onClick={exportJSON}
        title="Export current project (all sheets) as a JSON file to your computer"
      >
        ⬇ Export JSON
      </button>

      {/* SAVE MODAL */}
      {showSave && (
        <div className="logic-circuit-project-manager-fullscreen-overlay-background-container">
          <div className="logic-circuit-project-manager-modal-window-card-container">
            <h3 className="logic-circuit-project-manager-modal-title-text-heading">
              Save Project
            </h3>

            <input
              className="logic-circuit-project-manager-project-name-text-input-field"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveProject()}
              placeholder="Project name"
              autoFocus
            />

            <div className="logic-circuit-project-manager-modal-button-row-layout-wrapper">
              <button
                className="logic-circuit-project-manager-confirm-save-button"
                onClick={saveProject}
              >
                Save
              </button>

              <button
                className="logic-circuit-project-manager-cancel-close-button"
                onClick={() => setShowSave(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOAD MODAL */}
      {showLoad && (
        <div className="logic-circuit-project-manager-fullscreen-overlay-background-container">
          <div className="logic-circuit-project-manager-modal-window-card-container">
            <h3 className="logic-circuit-project-manager-modal-title-text-heading">
              Load Project
            </h3>

            {/* ── Import from JSON file ── */}
            <div className="logic-circuit-project-manager-import-section-wrapper">
              <p className="logic-circuit-project-manager-import-section-label">
                Import from JSON file
              </p>

              <button
                className="logic-circuit-project-manager-import-json-button"
                onClick={() => {
                  setImportError("");
                  importFileRef.current?.click();
                }}
              >
                ⬆ Choose JSON File…
              </button>

              {/* Hidden file input */}
              <input
                ref={importFileRef}
                type="file"
                accept=".json,application/json"
                style={{ display: "none" }}
                onChange={handleImportFile}
              />

              {importError && (
                <p className="logic-circuit-project-manager-import-error-message">
                  {importError}
                </p>
              )}
            </div>

            {/* ── Divider ── */}
            <div className="logic-circuit-project-manager-section-divider" />

            {/* ── Saved projects list ── */}
            {names.length === 0 && (
              <div className="logic-circuit-project-manager-empty-projects-placeholder-message">
                No projects saved
              </div>
            )}

            {names.map((name) => (
              <div
                key={name}
                className="logic-circuit-project-manager-project-row-item-container"
              >
                <span>{name}</span>

                <div className="logic-circuit-project-manager-project-row-button-group-wrapper">
                  <button
                    className="logic-circuit-project-manager-small-load-button"
                    onClick={() => loadSnapshot(projects[name].versions[0])}
                  >
                    Load
                  </button>

                  <button
                    className="logic-circuit-project-manager-small-delete-button"
                    onClick={() => deleteProject(name)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            <button
              className="logic-circuit-project-manager-cancel-close-button"
              onClick={() => {
                setShowLoad(false);
                setImportError("");
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
