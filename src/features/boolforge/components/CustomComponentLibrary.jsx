import React, { useState, useEffect } from "react";
import { 
  X, 
  Eye, 
  Edit3, 
  Trash2, 
  ArrowRight, 
  Cpu, 
  Check, 
  RotateCcw 
} from "lucide-react";
import { 
  fetchCustomComponents, 
  deleteCustomComponent, 
  updateCustomComponent 
} from "../api/customComponents"; // Adjust path if needed

const CustomComponentLibrary = ({ onClose, onRefreshSidebar, onLoadToCanvas }) => {
  const [components, setComponents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [inspectComponent, setInspectComponent] = useState(null);

  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      const data = await fetchCustomComponents();
      setComponents(data || []);
    } catch (err) {
      console.error("Failed to fetch components:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this custom component?")) return;
    try {
      await deleteCustomComponent(id);
      setComponents((prev) => prev.filter((item) => item.id !== id));
      if (onRefreshSidebar) onRefreshSidebar();
    } catch (err) {
      alert("Failed to delete component.");
    }
  };

  const handleUpdateName = async (id) => {
    try {
      // Send only the updated name so backend partial update handles it cleanly
      await updateCustomComponent(id, { name: editName });
      setEditingId(null);
      await loadComponents();
      if (onRefreshSidebar) onRefreshSidebar();
    } catch (err) {
      alert("Failed to update component name.");
    }
  };

  const handleLoadToCanvas = (component) => {
    if (
      window.confirm(
        `Load "${component.name}" sub-circuit into the main canvas for editing?\n\nNote: Any unsaved work currently on the canvas will be replaced.`
      )
    ) {
      if (onLoadToCanvas) {
        onLoadToCanvas(component);
      }
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="modal-content"
        style={{
          background: "#181825",
          color: "#cdd6f4",
          padding: "24px",
          borderRadius: "12px",
          width: "620px",
          maxWidth: "92vw",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #313244",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Cpu size={22} color="#89b4fa" /> Custom Component Library
          </h2>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "#a6adc8", cursor: "pointer", padding: "4px" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Component List */}
        <div style={{ overflowY: "auto", flex: 1, paddingRight: "4px", margin: "8px 0" }}>
          {components.length === 0 ? (
            <p style={{ color: "#a6adc8", textAlign: "center", padding: "32px 0", fontSize: "14px" }}>
              No custom components saved yet.
            </p>
          ) : (
            components.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#1e1e2e",
                  border: "1px solid #313244",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                {editingId === item.id ? (
                  <div style={{ display: "flex", gap: "8px", width: "100%", alignItems: "center" }}>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid #45475a",
                        background: "#313244",
                        color: "#fff",
                        flex: 1,
                        fontSize: "14px",
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateName(item.id)}
                      style={{
                        padding: "8px 12px",
                        background: "#a6e3a1",
                        color: "#11111b",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Check size={14} /> Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{
                        padding: "8px 12px",
                        background: "#45475a",
                        color: "#cdd6f4",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#f5e0dc" }}>{item.name}</h3>
                      <p style={{ margin: 0, fontSize: "12px", color: "#a6adc8" }}>
                        Inputs: {item.inputs?.length || 0} | Outputs: {item.outputs?.length || 0} | Gates: {item.gates?.length || 0}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <button
                        onClick={() => setInspectComponent(item)}
                        title="View internal structure"
                        style={{
                          padding: "6px 10px",
                          background: "#313244",
                          color: "#89b4fa",
                          border: "1px solid #45475a",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Eye size={14} /> Inspect
                      </button>

                      <button
                        onClick={() => handleLoadToCanvas(item)}
                        title="Load sub-circuit into main editor canvas"
                        style={{
                          padding: "6px 10px",
                          background: "#89b4fa",
                          color: "#11111b",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <RotateCcw size={14} /> Edit in Canvas
                      </button>

                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setEditName(item.name);
                        }}
                        title="Rename component"
                        style={{
                          padding: "6px",
                          background: "transparent",
                          color: "#f9e2af",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Delete component"
                        style={{
                          padding: "6px",
                          background: "transparent",
                          color: "#f38ba8",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              background: "#313244",
              border: "none",
              borderRadius: "6px",
              color: "#cdd6f4",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Internal Sub-circuit Inspector Sub-Modal */}
      {inspectComponent && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
          }}
        >
          <div
            style={{
              background: "#1e1e2e",
              color: "#cdd6f4",
              padding: "20px",
              borderRadius: "10px",
              width: "480px",
              maxWidth: "90vw",
              border: "1px solid #45475a",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", color: "#89b4fa" }}>
                Sub-Circuit Details: {inspectComponent.name}
              </h3>
              <button
                onClick={() => setInspectComponent(null)}
                style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ background: "#181825", padding: "12px", borderRadius: "6px", fontSize: "13px", lineHeight: "1.6" }}>
              <div><strong>Input Ports ({inspectComponent.inputs?.length || 0}):</strong> {inspectComponent.inputs?.map((p) => p.label).join(", ") || "None"}</div>
              <div><strong>Output Ports ({inspectComponent.outputs?.length || 0}):</strong> {inspectComponent.outputs?.map((p) => p.label).join(", ") || "None"}</div>
              <div><strong>Internal Gate Count:</strong> {inspectComponent.gates?.length || 0}</div>
              <div><strong>Internal Wire Connections:</strong> {inspectComponent.wires?.length || 0}</div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
              <button
                onClick={() => setInspectComponent(null)}
                style={{ padding: "6px 14px", background: "#313244", border: "none", borderRadius: "6px", color: "#fff", cursor: "pointer" }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  const comp = inspectComponent;
                  setInspectComponent(null);
                  handleLoadToCanvas(comp);
                }}
                style={{
                  padding: "6px 14px",
                  background: "#89b4fa",
                  color: "#11111b",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                Load to Canvas <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomComponentLibrary;