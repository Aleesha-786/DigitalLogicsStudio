import React from "react";
import { TruthTableGenerator } from "./TruthTable";
import { SaveAndLoad } from "./SaveAndLoad";

export const CircuitControls = ({
  embedded,
  // AI
  aiPrompt,
  setAiPrompt,
  handleRequestHint,
  hintLoading,
  handleGenerateCircuit,
  isGenLoading,
  hint,
  hintError,
  setHint,
  setHintError,
  // inputs/outputs
  inputGates,
  outputGates,
  wires,
  toggleInput,
  evaluateGate,
  // truth table
  truthTable,
  // history
  undo,
  redo,
  historyIndex,
  history,
  // save/load (multi-sheet project)
  gates,
  sheets,
  loadSheets,
  saveToHistory,
  clearCircuit,
  // zoom
  zoom,
  setZoom,
  setPanOffset,
  fitToView,
}) => {
  return (
    <div className="truth-table-panel">
      <h2>Circuit Control</h2>

      {!embedded && (
        <div className="ai-assistant-section">
          <h3 className="ai-title">🤖 CircuitMind Assistant</h3>
          <textarea className="ai-textarea" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Describe the circuit (e.g. 'half adder', 'A AND B OR C')…" rows={2} />
          <div className="controls">
            <button className="btn hint-btn" onClick={handleRequestHint} disabled={hintLoading} style={{ cursor: hintLoading ? "wait" : "pointer" }}>{hintLoading ? "💡 Thinking…" : "💡 Get Hint"}</button>
            <button className="btn generate-btn" onClick={handleGenerateCircuit} disabled={isGenLoading} style={{ cursor: isGenLoading ? "wait" : "pointer" }}>{isGenLoading ? "⚡ Generating…" : "⚡ AI Generate"}</button>
          </div>
          {(hint || hintError) && (
            <div className={`ai-response ${hintError ? "error" : ""}`}>
              {hintError || hint}
              <button className="dismiss-hint" onClick={() => { setHint(null); setHintError(""); }}>✕</button>
            </div>
          )}
        </div>
      )}

      {inputGates.length > 0 && (
        <div className="input-controls">
          <h3 style={{ fontSize: "12px", color: "var(--accent-primary)", marginBottom: "10px" }}>Input Toggles</h3>
          {inputGates.map((gate) => {
            const driven = wires.some((w) => w.toId === gate.id);
            return (
              <div key={gate.id} className="input-toggle">
                <label>{gate.label}{driven ? " (linked)" : ""}</label>
                <div className={`toggle-btn ${gate.inputValues[0] ? "on" : ""}`} onClick={() => { if (!driven) toggleInput(gate); }} style={driven ? { opacity: 0.4, cursor: "not-allowed" } : undefined} title={driven ? "This input is driven by a wire" : undefined} />
              </div>
            );
          })}
        </div>
      )}

      {outputGates.length > 0 && (
        <div className="output-display">
          <h3>Output Values</h3>
          {outputGates.map((gate) => (
            <div key={gate.id} className="output-item">
              <label>{gate.label}</label>
              <div className={`output-value ${evaluateGate(gate) ? "high" : "low"}`}>{evaluateGate(gate) ? "1" : "0"}</div>
            </div>
          ))}
        </div>
      )}

      <TruthTableGenerator truthTable={truthTable} />

      <div className="controls">
        <button className="btn" onClick={undo} disabled={historyIndex <= 0}>↶ Undo</button>
        <button className="btn" onClick={redo} disabled={historyIndex >= history.length - 1}>↷ Redo</button>
        <SaveAndLoad sheets={sheets} loadSheets={loadSheets} />
        <button className="btn danger" onClick={clearCircuit}>🗑️ Clear All</button>
      </div>

      <div className="zoom-controls">
        <button className="btn zoom-btn" onClick={() => setZoom(Math.min(3, zoom * 1.2))} title="Zoom In">🔍+</button>
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        <button className="btn zoom-btn" onClick={() => setZoom(Math.max(0.1, zoom * 0.8))} title="Zoom Out">🔍−</button>
        <button className="btn zoom-btn" onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }} title="Reset Zoom">⟲</button>
        <button className="btn zoom-btn" onClick={fitToView} title="Fit all gates into view" style={{ flex: 1 }}>⊡ Fit</button>
      </div>

      <div className="stats">
        <div><span>Gates:</span> <strong>{gates.length}</strong></div>
        <div><span>Wires:</span> <strong>{wires.length}</strong></div>
        <div><span>Inputs:</span> <strong>{inputGates.length}</strong></div>
        <div><span>Outputs:</span> <strong>{outputGates.length}</strong></div>
      </div>
    </div>
  );
};
