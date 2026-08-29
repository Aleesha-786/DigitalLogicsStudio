import { useState, useRef } from "react";
import {
  Save, FolderOpen, Download, Image as ImageIcon, Upload,
  X, FileText, Database, Clock, Play, Trash2, Info,
} from "lucide-react";
import { RibbonMenuItem } from "./RibbonMenu";

const STORAGE_KEY = "logic_editor_saved_projects_v1";

// ─── State + logic, owned by ToolbarRibbon (never unmounts) ──────────────
export function useSaveAndLoad({ sheets, loadSheets }) {
  const [showSave, setShowSave] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [importError, setImportError] = useState("");
  const [projectsList, setProjectsList] = useState({});
  const importFileRef = useRef(null);

  const getProjects = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const setProjects = (p) => localStorage.setItem(STORAGE_KEY, JSON.stringify(p));

  const openSave = () => setShowSave(true);
  const openLoad = () => { setProjectsList(getProjects()); setShowLoad(true); };

  const saveProject = () => {
    if (!projectName.trim()) return;
    const projects = getProjects();
    if (projects[projectName] && !window.confirm("Overwrite existing project?")) return;
    projects[projectName] = {
      versions: [{ sheets, time: Date.now() }, ...(projects[projectName]?.versions || [])].slice(0, 10),
    };
    setProjects(projects);
    setShowSave(false);
    setProjectName("");
  };

  const loadSnapshot = (snap) => {
    if (Array.isArray(snap.sheets) && snap.sheets.length > 0) {
      loadSheets(snap.sheets);
    } else if (Array.isArray(snap.gates)) {
      loadSheets([{
        name: "Sheet 1",
        circuit: {
          gates: snap.gates || [],
          wires: snap.wires || [],
          gateIdCounter: snap.gateIdCounter || 0,
          wireIdCounter: snap.wireIdCounter || 0,
          inputCounter: snap.inputCounter || 0,
          outputCounter: snap.outputCounter || 0,
        },
      }]);
    }
    setShowLoad(false);
  };

  const deleteProject = (name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    const p = getProjects();
    delete p[name];
    setProjects(p);
    setProjectsList(p);
  };

  const exportJSON = () => {
    const exportData = { sheets, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boolforge-project-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
          setImportError("Invalid file: missing sheets/gates/wires. Is this a Boolforge JSON?");
          return;
        }
        loadSnapshot(parsed);
      } catch {
        setImportError("Could not parse file. Make sure it is valid JSON.");
      }
    };
    reader.onerror = () => setImportError("Failed to read the file. Please try again.");
    reader.readAsText(file);
    e.target.value = "";
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown date";
    try {
      return new Date(timestamp).toLocaleString(undefined, {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
      });
    } catch {
      return "Unknown date";
    }
  };

  return {
    showSave, setShowSave, showLoad, setShowLoad,
    projectName, setProjectName, importError, setImportError,
    projectsList, importFileRef,
    openSave, openLoad, saveProject, loadSnapshot, deleteProject,
    exportJSON, handleImportFile, formatTime,
    names: Object.keys(projectsList),
  };
}

// ─── Trigger buttons — safe to unmount when the File dropdown closes ─────
export function SaveLoadMenuItems({ api, onExportPNG, closeMenu }) {
  const handleOpenSave = () => { closeMenu?.(); api.openSave(); };
  const handleOpenLoad = () => { closeMenu?.(); api.openLoad(); };
  return (
    <>
      <RibbonMenuItem icon={Save} label="Save Project" description="Save current sheets to this browser" onClick={handleOpenSave} />
      <RibbonMenuItem icon={FolderOpen} label="Load Project" description="Restore a saved project" onClick={handleOpenLoad} />
      <RibbonMenuItem icon={Download} label="Export JSON" description="Download all sheets as a file" onClick={api.exportJSON} />
      {onExportPNG && (
        <RibbonMenuItem icon={ImageIcon} label="Export as PNG" description="Save the canvas as an image" onClick={onExportPNG} />
      )}
    </>
  );
}

// ─── The actual dialogs — must be rendered OUTSIDE the dropdown's
// isOpen-gated tree, so they survive the dropdown closing ─────────────────
export function SaveLoadDialogs({ api }) {
  if (!api.showSave && !api.showLoad) return null;

  return (
    <>
      {api.showSave && (
        <div className="project-modal-overlay" onClick={() => api.setShowSave(false)}>
          <div className="project-modal" onClick={(e) => e.stopPropagation()}>
            <div className="project-modal-header">
              <div className="project-modal-title">
                <Save size={18} className="project-modal-icon text-emerald" />
                <h3>Save Project</h3>
              </div>
              <button className="project-modal-close" onClick={() => api.setShowSave(false)} aria-label="Close dialog">
                <X size={16} />
              </button>
            </div>

            <p className="project-modal-desc">
              Save your circuit sheets to your browser's local storage. You can restore this workspace at any time.
            </p>

            <div className="project-modal-input-wrapper">
              <FileText size={16} className="project-modal-input-icon" />
              <input
                className="project-modal-input"
                value={api.projectName}
                onChange={(e) => api.setProjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && api.saveProject()}
                placeholder="e.g. 8-Bit Arithmetic Logic Unit"
                autoFocus
              />
            </div>

            <div className="project-modal-actions">
              <button className="project-modal-btn project-modal-btn--ghost" onClick={() => api.setShowSave(false)}>Cancel</button>
              <button className="project-modal-btn project-modal-btn--primary" onClick={api.saveProject}>Save Project</button>
            </div>
          </div>
        </div>
      )}

      {api.showLoad && (
        <div className="project-modal-overlay" onClick={() => { api.setShowLoad(false); api.setImportError(""); }}>
          <div className="project-modal" onClick={(e) => e.stopPropagation()}>
            <div className="project-modal-header">
              <div className="project-modal-title">
                <FolderOpen size={18} className="project-modal-icon text-cyan" />
                <h3>Load Project</h3>
              </div>
              <button className="project-modal-close" onClick={() => { api.setShowLoad(false); api.setImportError(""); }} aria-label="Close dialog">
                <X size={16} />
              </button>
            </div>

            <div className="project-modal-import-zone" onClick={() => { api.setImportError(""); api.importFileRef.current?.click(); }}>
              <div className="project-modal-import-content">
                <Upload size={24} className="project-modal-import-icon" />
                <span className="project-modal-import-text">Import JSON file</span>
                <span className="project-modal-import-subtext">Click to choose a saved .json project</span>
              </div>
            </div>
            <input
              ref={api.importFileRef}
              type="file"
              accept=".json,application/json"
              style={{ display: "none" }}
              onChange={api.handleImportFile}
            />
            {api.importError && (
              <div className="project-modal-error">
                <Info size={14} className="error-icon" />
                <span>{api.importError}</span>
              </div>
            )}

            <div className="project-modal-divider" />

            <div className="project-modal-section-title">
              <Database size={12} />
              <span>Saved in Browser</span>
            </div>

            <div className="project-modal-list">
              {api.names.length === 0 ? (
                <div className="project-modal-empty">
                  <FolderOpen size={28} className="empty-icon" />
                  <p>No saved projects yet</p>
                  <span>Save a project first to see it listed here.</span>
                </div>
              ) : (
                api.names.map((name) => {
                  const project = api.projectsList[name];
                  const lastModified = project?.versions?.[0]?.time;
                  return (
                    <div key={name} className="project-row">
                      <div className="project-row-info">
                        <span className="project-row-name" title={name}>{name}</span>
                        {lastModified && (
                          <span className="project-row-time">
                            <Clock size={10} />
                            {api.formatTime(lastModified)}
                          </span>
                        )}
                      </div>
                      <div className="project-row-actions">
                        <button className="project-row-btn project-row-btn--load" onClick={() => api.loadSnapshot(project.versions[0])} title="Load Project">
                          <Play size={12} strokeWidth={2.5} />
                          <span>Load</span>
                        </button>
                        <button className="project-row-btn project-row-btn--delete" onClick={() => api.deleteProject(name)} title="Delete Project">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="project-modal-actions">
              <button className="project-modal-btn project-modal-btn--ghost" onClick={() => { api.setShowLoad(false); api.setImportError(""); }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
