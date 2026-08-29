import React from "react";
import { Activity } from "lucide-react";
import { FloatingPanel } from "./FloatingPanel";
import { TruthTableGenerator } from "./TruthTable";

export const SimulatePanel = ({
  onClose,
  inputGates,
  outputGates,
  wires,
  toggleInput,
  evaluateGate,
  truthTable,
}) => (
  <FloatingPanel title="Simulate" icon={Activity} onClose={onClose} className="floating-panel--simulate">
    {inputGates.length === 0 && outputGates.length === 0 && (
      <p className="floating-panel-empty">Add INPUT / OUTPUT gates to simulate your circuit.</p>
    )}

    {inputGates.length > 0 && (
      <div className="ribbon-io-list" style={{ marginBottom: 12 }}>
        <h3 className="floating-panel-section-title">Input Toggles</h3>
        {inputGates.map((gate) => {
          const driven = wires.some((w) => w.toId === gate.id);
          return (
            <div key={gate.id} className="input-toggle">
              <label>{gate.label}{driven ? " (linked)" : ""}</label>
              <div
                className={`toggle-btn ${gate.inputValues[0] ? "on" : ""}`}
                onClick={() => { if (!driven) toggleInput(gate); }}
                style={driven ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
                title={driven ? "This input is driven by a wire" : undefined}
              />
            </div>
          );
        })}
      </div>
    )}

    {outputGates.length > 0 && (
      <div className="ribbon-io-list" style={{ marginBottom: 12 }}>
        <h3 className="floating-panel-section-title">Output Values</h3>
        {outputGates.map((gate) => (
          <div key={gate.id} className="output-item">
            <label>{gate.label}</label>
            <div className={`output-value ${evaluateGate(gate) ? "high" : "low"}`}>
              {evaluateGate(gate) ? "1" : "0"}
            </div>
          </div>
        ))}
      </div>
    )}

    <TruthTableGenerator truthTable={truthTable} />
  </FloatingPanel>
);
