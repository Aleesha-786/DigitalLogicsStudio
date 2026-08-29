import React from "react";
import { gateSymbols, IC_META, IC_TYPES } from "../../../shared/data/gates";
import { SheetTabs } from './SheetTabs';
import {
  MULTI_INPUT_GATES,
  MAX_GATE_INPUTS,
  MIN_GATE_INPUTS,
  GATE_WIDTH,
  getICHeight,
  getOutputY,
  getCurvePoints,
  getWirePoints,
  wirePathD,
} from "../utils";


function GenericICSymbol({ name, inputCount, outputCount }) {
  const height = Math.max(60, Math.max(inputCount, outputCount) * 22 + 20);
  return (
    <svg viewBox={`0 0 80 ${height}`} className="gate-symbol gate-symbol--ic">
      <rect x="8" y="5" width="64" height={height - 10} rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <text x="40" y={height / 2 + 4} textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="monospace" fontWeight="700">
        {name.length > 8 ? name.slice(0, 7) + "…" : name}
      </text>
    </svg>
  );
}

export const CircuitCanvas = ({
  gates,
  wires,
  gateMap,
  customIcMeta = {}, 
  selectedGateIds,
  selectedWireIds,
  setSelectedGateIds,
  setSelectedWireIds,
  setSelectedGate,
  evaluateGate,
  zoom,
  panOffset,
  isPanning,
  spacePressed,
  selectionToolActive,
  setSelectionToolActive,
  isSelecting,
  selectionStart,
  selectionEnd,
  connectingFrom,
  setConnectCursor,
  connectCursor,
  clientToWorld,
  startDrag,
  onDrag,
  stopDrag,
  setIsPanning,
  setPanStart,
  handleOutputPortClick,
  handleCanvasContextMenu,
  handleCanvasMouseDown,
  handleMouseMove,
  handleMouseUp,
  stopPortEvent,
  fitToView,
  setZoom,
  addInputSlot,
  removeInputSlot,
  startRename,
  deleteGate,
  deleteWire,
  completeConnection,
  containerRef,
  canvasRef,
  sheets = [],
  activeSheetId = null,
  onSwitchSheet = () => {},
  onAddSheet = () => {},
  onRenameSheet = () => {},
  onDeleteSheet = () => {},
  embedded = false,
}) => {
  return (
    <div className={`canvas-container${connectingFrom ? " is-wiring" : ""}`} ref={containerRef}>
      <canvas
        ref={canvasRef}
        onContextMenu={handleCanvasContextMenu}
        onMouseDown={handleCanvasMouseDown}
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            const t = e.touches[0];
            setIsPanning(true);
            setPanStart({ x: t.clientX - panOffset.x, y: t.clientY - panOffset.y });
          }
        }}
        style={{ cursor: isPanning ? "grabbing" : spacePressed ? "grab" : selectionToolActive ? "crosshair" : "grab" }}
      />

      <div className="gates-container" style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`, transformOrigin: "0 0" }}>
        <svg className="wire-layer" aria-hidden="true">
          {wires.map((wire) => {
            const fromGate = gateMap.get(wire.fromId);
            const toGate = gateMap.get(wire.toId);
            if (!fromGate || !toGate) return null;
            const pts = getWirePoints(fromGate, toGate, wire.fromOutputIndex, wire.toIndex);
            const isActive = evaluateGate(fromGate, wire.fromOutputIndex ?? 0);
            return (
              <g
                key={wire.id}
                className={`${isActive ? "wire-on" : "wire-off"}${selectedWireIds.includes(wire.id) ? " wire-selected" : ""}`}
              >
                <path
                  className="wire-hit"
                  d={wirePathD(pts)}
                  fill="none"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedWireIds([wire.id]);
                    setSelectedGateIds([]);
                    setSelectedGate(null);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteWire(wire.id);
                  }}
                />
                {isActive && <path className="wire-glow" d={wirePathD(pts)} fill="none" />}
                <path className="wire-path" d={wirePathD(pts)} fill="none" />
              </g>
            );
          })}
          {connectingFrom && connectCursor && (() => {
            const fromGate = gateMap.get(connectingFrom.gateId ?? connectingFrom.gate?.id);
            if (!fromGate) return null;
            const pts = getCurvePoints(fromGate.x + GATE_WIDTH, getOutputY(fromGate, connectingFrom.outputIndex ?? 0), connectCursor.x, connectCursor.y);
            return <path className="wire-preview" d={wirePathD(pts)} fill="none" />;
          })()}
        </svg>
        {isSelecting && (
          <div
            className="selection-rectangle"
            style={{ position: "absolute", left: Math.min(selectionStart.x, selectionEnd.x), top: Math.min(selectionStart.y, selectionEnd.y), width: Math.abs(selectionStart.x - selectionEnd.x), height: Math.abs(selectionStart.y - selectionEnd.y), border: "1.5px dashed var(--accent-secondary, #00d4ff)", background: "rgba(0, 212, 255, 0.12)", pointerEvents: "none", zIndex: 1000, borderRadius: "3px", boxShadow: "0 0 8px rgba(0, 212, 255, 0.2)" }}
          />
        )}

        {gates.map((gate) => {
          const canExpand = MULTI_INPUT_GATES.has(gate.type);
          const canAddInput = canExpand && gate.inputs < MAX_GATE_INPUTS;
          const canRemoveInput = canExpand && gate.inputs > MIN_GATE_INPUTS;
          const isCustom = gate.type.startsWith("CUSTOM_");
          const isIC = IC_TYPES.has(gate.type) || isCustom;
          const icMeta = isIC ? customIcMeta[gate.type] : null;
          const icH = isIC ? (isCustom ? Math.max(60, Math.max(icMeta.inputs, icMeta.outputs) * 22 + 20) : getICHeight(gate.type)) : 100;
          const cfGateId = connectingFrom?.gateId ?? connectingFrom?.gate?.id;

          return (
            <div
              key={gate.id}
              data-gate-id={gate.id}
              className={`gate ${gate.type === "OUTPUT" ? "output-gate" : ""} ${isIC ? "gate--ic" : ""} ${selectedGateIds.includes(gate.id) ? "selected" : ""} ${gate.type === "OUTPUT" && evaluateGate(gate) ? "active" : ""}`}
              style={{ left: gate.x, top: gate.y, height: isIC ? icH : undefined }}
              onMouseDown={(e) => {
                if (connectingFrom && gate.type === "INPUT") { e.stopPropagation(); completeConnection(gate, 0); return; }
                startDrag(e, gate);
              }}
              onTouchStart={(e) => { if (e.touches.length === 1) { e.stopPropagation(); startDrag(e.touches[0], gate); } }}
              onDoubleClick={(e) => startRename(e, gate)}
              onContextMenu={(e) => { e.preventDefault(); deleteGate(gate); }}
            >
              <div className="gate-content">
              {gateSymbols[gate.type] || (isCustom && <GenericICSymbol name={gate.label} inputCount={icMeta.inputs} outputCount={icMeta.outputs} />)}
                {!isIC && <div className="gate-label">{gate.label || gate.type}</div>}
              </div>

              {canExpand && (
                <div className="gate-input-controls">
                  <button className="gate-input-btn" title={canRemoveInput ? `Remove input (${gate.inputs - 1} inputs)` : `Minimum ${MIN_GATE_INPUTS} inputs`} disabled={!canRemoveInput} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => removeInputSlot(e, gate)}>−</button>
                  <span className="gate-input-count">{gate.inputs}</span>
                  <button className="gate-input-btn" title={canAddInput ? `Add input (${gate.inputs + 1} inputs)` : `Maximum ${MAX_GATE_INPUTS} inputs`} disabled={!canAddInput} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => addInputSlot(e, gate)}>+</button>
                </div>
              )}

              {isIC && Array.from({ length: icMeta.outputs }).map((_, outIdx) => {
                const n = icMeta.outputs, topPct = n === 1 ? 50 : 10 + (outIdx / (n - 1)) * 80;
                const isConnecting = cfGateId === gate.id && connectingFrom?.outputIndex === outIdx;
                return (
                  <div key={`out-${outIdx}`} className={`connection-point output-point ic-output-point ${isConnecting ? "active" : ""} ${evaluateGate(gate, outIdx) ? "ic-output-point--high" : ""}`} style={{ top: `${topPct}%` }} title={icMeta.outputLabels[outIdx]} onMouseDown={stopPortEvent} onClick={() => handleOutputPortClick(gate, outIdx)}>
                    <span className="ic-pin-label">{icMeta.outputLabels[outIdx]}</span>
                  </div>
                );
              })}

              {!isIC && gate.hasOutput && (
                <div className={`connection-point output-point ${cfGateId === gate.id ? "active" : ""}`} onMouseDown={stopPortEvent} onClick={() => handleOutputPortClick(gate, 0)} />
              )}

              {gate.type === "INPUT" && (
                <div className={`connection-point input-point ${connectingFrom ? "active" : ""}`} style={{ top: "50%" }} title="Drop a wire here to join this input with another" onMouseDown={stopPortEvent} onClick={() => completeConnection(gate, 0)} />
              )}

              {isIC && Array.from({ length: icMeta.inputs }).map((_, idx) => {
                const n = icMeta.inputs, topPct = n === 1 ? 50 : 10 + (idx / (n - 1)) * 80;
                return (
                  <div key={`in-${idx}`} className={`connection-point input-point ic-input-point ${connectingFrom ? "active" : ""}`} style={{ top: `${topPct}%` }} title={icMeta.inputLabels[idx]} onMouseDown={stopPortEvent} onClick={() => completeConnection(gate, idx)}>
                    <span className="ic-pin-label ic-pin-label--left">{icMeta.inputLabels[idx]}</span>
                  </div>
                );
              })}

              {!isIC && gate.inputs >= 2 && Array.from({ length: gate.inputs }).map((_, idx) => {
                const n = gate.inputs, topPct = n === 2 ? (idx === 0 ? 35 : 65) : 15 + (idx / (n - 1)) * 70;
                return <div key={idx} className={`connection-point input-point ${connectingFrom ? "active" : ""}`} style={{ top: `${topPct}%` }} onMouseDown={stopPortEvent} onClick={() => completeConnection(gate, idx)} />;
              })}
              {!isIC && gate.inputs === 1 && (
                <div className={`connection-point input-point ${connectingFrom ? "active" : ""}`} style={{ top: "50%" }} onMouseDown={stopPortEvent} onClick={() => completeConnection(gate, 0)} />
              )}
            </div>
          );
        })}
      </div>

      <div className="canvas-overlay-controls">
        <button className={`canvas-overlay-btn${selectionToolActive ? " canvas-overlay-btn--active" : ""}`} onClick={() => setSelectionToolActive((v) => !v)} style={selectionToolActive ? { background: "var(--accent-primary, #7c3aed)", color: "#fff", borderColor: "var(--accent-primary, #7c3aed)" } : {}}>⬚</button>
        <button className="canvas-overlay-btn" onClick={fitToView}>⊡</button>
        <button className="canvas-overlay-btn" onClick={() => setZoom((z) => Math.min(3, z * 1.2))}>+</button>
        <button className="canvas-overlay-btn" onClick={() => setZoom((z) => Math.max(0.3, z * 0.8))}>−</button>
      </div>

    {!embedded && (
        <div className="canvas-sheet-tabs-wrapper">
          <SheetTabs
            sheets={sheets}
            activeSheetId={activeSheetId}
            onSwitchSheet={onSwitchSheet}
            onAddSheet={onAddSheet}
            onRenameSheet={onRenameSheet}
            onDeleteSheet={onDeleteSheet}
          />
        </div>
      )}
    </div>
  );
};