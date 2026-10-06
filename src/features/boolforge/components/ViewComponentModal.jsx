// src/features/boolforge/components/ViewComponentModal.jsx
import React from "react";
import { X, Cpu, ArrowRight } from "lucide-react";

const ViewComponentModal = ({ component, onClose, onEditInCanvas }) => {
  if (!component) return null;

  return (
    <div className="modal-overlay" style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div className="modal-content" style={{
        background: "#1e1e2e", color: "#cdd6f4", padding: "24px",
        borderRadius: "12px", width: "500px", maxWidth: "90vw",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, fontSize: "18px" }}>
            <Cpu size={20} /> Internal Circuit: {component.name}
          </h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#cdd6f4", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ background: "#181825", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#a6adc8" }}>
            <strong>Inputs ({component.inputs?.length || 0}):</strong> {component.inputs?.map(i => i.name || i.label || i.id).join(", ") || "None"}
          </p>
          <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#a6adc8" }}>
            <strong>Outputs ({component.outputs?.length || 0}):</strong> {component.outputs?.map(o => o.name || o.label || o.id).join(", ") || "None"}
          </p>
          <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#a6adc8" }}>
            <strong>Internal Gates:</strong> {component.gates?.length || 0} gates
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#a6adc8" }}>
            <strong>Internal Wires:</strong> {component.wires?.length || 0} connections
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #45475a", background: "transparent", color: "#cdd6f4", cursor: "pointer" }}>
            Close
          </button>
          <button 
            onClick={() => onEditInCanvas(component)}
            style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#89b4fa", color: "#11111b", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          >
            Load Sub-Circuit to Canvas <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewComponentModal;