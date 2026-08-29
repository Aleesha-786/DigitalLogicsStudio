import { useState, useRef } from "react";

import { 
  Save, 
  FolderOpen, 
  Download, 
  Image as ImageIcon, 
  Upload,
  X,
  FileText,
  Database,
  Clock,
  Play,
  Trash2,
  Info
} from "lucide-react";

import { RibbonMenuItem } from "./RibbonMenu";

const STORAGE_KEY = "logic_editor_saved_projects_v1";

export function SaveAndLoad({ 
  sheets, 
  loadSheets, 
  onExportPNG, 
  closeMenu 
}) {
  const [showSave, setShowSave] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [importError, setImportError] = useState("");
  const [projectsList, setProjectsList] = useState({});
  const importFileRef = useRef(null);

  const getProjects = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const setProjects = (p) => localStorage.setItem(STORAGE_KEY, JSON.stringify(p));

  const openSave = () => { closeMenu?.(); setShowSave(true); };
  const openLoad = () => { 
    closeMenu?.(); 
    setProjectsList(getProjects());
    setShowLoad(true); 
  };

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
      const date = new Date(timestamp);
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    } catch (e) {
      return "Unknown date";
    }
  };

  const names = Object.keys(projectsList);

  return (
    <>
      <RibbonMenuItem 
        icon={Save} 
        label="Save Project" 
        description="Save current sheets to this browser" 
        onClick={openSave} 
      />
      <RibbonMenuItem 
        icon={FolderOpen} 
        label="Load Project" 
        description="Restore a saved project" 
        onClick={openLoad} 
      />
      <RibbonMenuItem 
        icon={Download} 
        label="Export JSON" 
        description="Download all sheets as a file" 
        onClick={exportJSON} 
      />
      {onExportPNG && (
        <RibbonMenuItem 
          icon={ImageIcon} 
          label="Export as PNG" 
          description="Save the canvas as an image" 
          onClick={onExportPNG} 
        />
      )}

      {showSave && (
        <div className="project-modal-overlay" onClick={() => setShowSave(false)}>
          <div className="project-modal" onClick={(e) => e.stopPropagation()}>
            <div className="project-modal-header">
              <div className="project-modal-title">
                <Save size={18} className="project-modal-icon text-emerald" />
                <h3>Save Project</h3>
              </div>
              <button className="project-modal-close" onClick={() => setShowSave(false)} aria-label="Close dialog">
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
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveProject()}
                placeholder="e.g. 8-Bit Arithmetic Logic Unit"
                autoFocus
              />
            </div>

            <div className="project-modal-actions">
              <button className="project-modal-btn project-modal-btn--ghost" onClick={() => setShowSave(false)}>Cancel</button>
              <button className="project-modal-btn project-modal-btn--primary" onClick={saveProject}>Save Project</button>
            </div>
          </div>
        </div>
      )}

      {showLoad && (
        <div className="project-modal-overlay" onClick={() => { setShowLoad(false); setImportError(""); }}>
          <div className="project-modal" onClick={(e) => e.stopPropagation()}>
            <div className="project-modal-header">
              <div className="project-modal-title">
                <FolderOpen size={18} className="project-modal-icon text-cyan" />
                <h3>Load Project</h3>
              </div>
              <button className="project-modal-close" onClick={() => { setShowLoad(false); setImportError(""); }} aria-label="Close dialog">
                <X size={16} />
              </button>
            </div>

            <div className="project-modal-import-zone" onClick={() => { setImportError(""); importFileRef.current?.click(); }}>
              <div className="project-modal-import-content">
                <Upload size={24} className="project-modal-import-icon" />
                <span className="project-modal-import-text">Import JSON file</span>
                <span className="project-modal-import-subtext">Click to choose a saved .json project</span>
              </div>
            </div>
            <input
              ref={importFileRef}
              type="file"
              accept=".json,application/json"
              style={{ display: "none" }}
              onChange={handleImportFile}
            />
            {importError && (
              <div className="project-modal-error">
                <Info size={14} className="error-icon" />
                <span>{importError}</span>
              </div>
            )}

            <div className="project-modal-divider" />

            <div className="project-modal-section-title">
              <Database size={12} />
              <span>Saved in Browser</span>
            </div>

            <div className="project-modal-list">
              {names.length === 0 ? (
                <div className="project-modal-empty">
                  <FolderOpen size={28} className="empty-icon" />
                  <p>No saved projects yet</p>
                  <span>Save a project first to see it listed here.</span>
                </div>
              ) : (
                names.map((name) => {
                  const project = projectsList[name];
                  const lastModified = project?.versions?.[0]?.time;
                  return (
                    <div key={name} className="project-row">
                      <div className="project-row-info">
                        <span className="project-row-name" title={name}>{name}</span>
                        {lastModified && (
                          <span className="project-row-time">
                            <Clock size={10} />
                            {formatTime(lastModified)}
                          </span>
                        )}
                      </div>
                      <div className="project-row-actions">
                        <button className="project-row-btn project-row-btn--load" onClick={() => loadSnapshot(project.versions[0])} title="Load Project">
                          <Play size={12} strokeWidth={2.5} />
                          <span>Load</span>
                        </button>
                        <button className="project-row-btn project-row-btn--delete" onClick={() => deleteProject(name)} title="Delete Project">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="project-modal-actions">
              <button className="project-modal-btn project-modal-btn--ghost" onClick={() => { setShowLoad(false); setImportError(""); }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
