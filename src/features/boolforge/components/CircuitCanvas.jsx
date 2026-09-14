import React, { useState } from "react";
import { gateSymbols, IC_TYPES } from "../../../shared/data/gates";
import { SheetTabs } from './SheetTabs';
import {
  MULTI_INPUT_GATES,
  MAX_GATE_INPUTS,
  MIN_GATE_INPUTS,
  GATE_WIDTH,
  getICHeight,
  getOutputY,
  getCurvePoints,
  getOrthogonalPoints,
  getWirePoints,
  wirePathD,
} from "../utils";

import { ZoomWidget } from "./ZoomWidget";
import { SimulatePanel } from "./SimulatePanel";
import { AIPanel } from "./AIPanel";

function GenericICSymbol({ name, inputCount, outputCount }) {
  const height = Math.max(100, Math.max(inputCount, outputCount) * 22 + 20);
  const pinY = (idx, n) => (n === 1 ? 0.5 : 0.1 + (idx / (n - 1)) * 0.8) * height;
  return (
    <svg viewBox={`0 0 80 ${height}`} className="gate-symbol gate-symbol--ic">
      <rect x="8" y="5" width="64" height={height - 10} rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
      {Array.from({ length: inputCount }).map((_, i) => (
        <line key={`in-${i}`} x1="0" y1={pinY(i, inputCount)} x2="8" y2={pinY(i, inputCount)} stroke="currentColor" strokeWidth="2" />
      ))}
      {Array.from({ length: outputCount }).map((_, i) => (
        <line key={`out-${i}`} x1="72" y1={pinY(i, outputCount)} x2="80" y2={pinY(i, outputCount)} stroke="currentColor" strokeWidth="2" />
      ))}
      <text x="40" y={height / 2 + 4} textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="monospace" fontWeight="700">
        {name.length > 8 ? name.slice(0, 7) + "…" : name}
      </text>
    </svg>
  );
}

// Small pin + popup UI for a single comment. Rendered in world-space so it
// pans/zooms together with the circuit.
function CommentPin({
  comment,
  isOpen,
  isEditing,
  editText,
  onToggleOpen,
  onStartEdit,
  onChangeText,
  onSave,
  onCancel,
  onDelete,
}) {
  return (
    <div
      className={`comment-pin${comment.type === "component" ? " comment-pin--component" : " comment-pin--canvas"}`}
      style={{ position: "absolute", left: comment.x, top: comment.y, zIndex: 500 }}
      // Prevent clicks on the pin from reaching the canvas/gate handlers
      // below it (which would otherwise pan, drag, or — while comment mode
      // is on — create yet another comment).
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="comment-pin-icon" onClick={onToggleOpen} title="View comment">
        💬
      </div>

      {isOpen && (
        <div className="comment-popup">
          {isEditing ? (
            <>
              <textarea
                className="comment-textarea"
                value={editText}
                onChange={(e) => onChangeText(e.target.value)}
                rows={3}
                autoFocus
                placeholder="Write a note…"
              />
              <div className="comment-popup-actions">
                <button className="btn btn-small" onClick={onSave}>Save</button>
                <button className="btn btn-small" onClick={onCancel}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <div className="comment-popup-text">
                {comment.text ? comment.text : <em>Empty comment</em>}
              </div>
              <div className="comment-popup-actions">
                <button className="btn btn-small" onClick={onStartEdit}>✏️ Edit</button>
                <button className="btn btn-small danger" onClick={onDelete}>🗑️ Delete</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
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
  snapEnabled = false,
  showGridOverlay = true,
  setPanOffset,
  inputGates = [],
  outputGates = [],
  toggleInput,
  truthTable,
  showSimulate,
  onCloseSimulate,
  showAIPanel,
  onCloseAIPanel,
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
  // ---- comments ----
  comments = [],
  commentMode = false,
  setCommentMode = () => {},
  onAddComment = () => null,
  onUpdateComment = () => {},
  onDeleteComment = () => {},
}) => {
  // Local UI-only state: which comment popup is expanded, and whether it's in edit mode.
  const [openCommentId, setOpenCommentId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");

  const openCommentPopup = (id, text) => {
    setOpenCommentId(id);
    setEditingCommentId(id);
    setEditText(text ?? "");
  };

  const handleToggleOpen = (comment) => {
    if (openCommentId === comment.id) {
      setOpenCommentId(null);
      setEditingCommentId(null);
    } else {
      setOpenCommentId(comment.id);
      setEditingCommentId(null);
    }
  };

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.text || "");
  };

  const handleSaveEdit = (id) => {
    onUpdateComment(id, editText);
    setEditingCommentId(null);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
  };

  const handleDeleteComment = (id) => {
    onDeleteComment(id);
    if (openCommentId === id) setOpenCommentId(null);
    if (editingCommentId === id) setEditingCommentId(null);
  };

  // Clicking empty canvas space while comment mode is on -> create a
  // free-floating, canvas-anchored comment at the clicked world position,
  // then exit comment mode (one-shot: one click = one comment).
  const handleCanvasBackgroundMouseDown = (e) => {
    if (commentMode) {
      e.preventDefault();
      e.stopPropagation();
      const world = clientToWorld(e.clientX, e.clientY);
      const newComment = onAddComment({ type: "canvas", x: world.x, y: world.y, text: "" });
      if (newComment?.id) openCommentPopup(newComment.id, "");
      setCommentMode(false);
      return;
    }
    handleCanvasMouseDown(e);
  };

  // Clicking a gate while comment mode is on -> create a comment attached to
  // that component, stored as an offset so it travels with the gate when
  // it's moved. Also one-shot: exits comment mode right after.
  const handleGateMouseDown = (e, gate) => {
    if (commentMode) {
      e.stopPropagation();
      e.preventDefault();
      const world = clientToWorld(e.clientX, e.clientY);
      const newComment = onAddComment({
        type: "component",
        targetId: gate.id,
        offsetX: world.x - gate.x,
        offsetY: world.y - gate.y,
        text: "",
      });
      if (newComment?.id) openCommentPopup(newComment.id, "");
      setCommentMode(false);
      return;
    }
    if (connectingFrom && gate.type === "INPUT") {
      e.stopPropagation();
      completeConnection(gate, 0);
      return;
    }
    startDrag(e, gate);
  };

  // Resolve each comment to a world-space (x, y) for rendering. Component-anchored
  // comments are recomputed from the gate's current position + stored offset, so
  // they move automatically whenever the gate moves.
  const renderedComments = comments
    .map((c) => {
      if (c.type === "component") {
        const gate = gateMap.get(c.targetId);
        if (!gate) return null; // gate was deleted -> comment has no home, skip rendering
        return { ...c, x: gate.x + (c.offsetX || 0), y: gate.y + (c.offsetY || 0) };
      }
      return c;
    })
    .filter(Boolean);

  return (
    <div
      className={`canvas-container${connectingFrom ? " is-wiring" : ""}${showGridOverlay ? "" : " canvas-container--no-grid"}${commentMode ? " canvas-container--comment-mode" : ""}`}
      ref={containerRef}
    >
      <canvas
        ref={canvasRef}
        onContextMenu={handleCanvasContextMenu}
        onMouseDown={handleCanvasBackgroundMouseDown}
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            const t = e.touches[0];
            setIsPanning(true);
            setPanStart({ x: t.clientX - panOffset.x, y: t.clientY - panOffset.y });
          }
        }}
        style={{ cursor: isPanning ? "grabbing" : spacePressed ? "grab" : selectionToolActive ? "crosshair" : commentMode ? "copy" : "grab" }}
      />

      <div className="gates-container" style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`, transformOrigin: "0 0" }}>
        <svg className="wire-layer" aria-hidden="true">
          {wires.map((wire) => {
            const fromGate = gateMap.get(wire.fromId);
            const toGate = gateMap.get(wire.toId);
            if (!fromGate || !toGate) return null;
            const pts = getWirePoints(fromGate, toGate, wire.fromOutputIndex, wire.toIndex, snapEnabled, customIcMeta);
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
            const pts = snapEnabled
              ? getOrthogonalPoints(fromGate.x + GATE_WIDTH, getOutputY(fromGate, connectingFrom.outputIndex ?? 0, customIcMeta), connectCursor.x, connectCursor.y)
              : getCurvePoints(fromGate.x + GATE_WIDTH, getOutputY(fromGate, connectingFrom.outputIndex ?? 0, customIcMeta), connectCursor.x, connectCursor.y);
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
          const icH = isIC ? (isCustom && icMeta ? Math.max(100, Math.max(icMeta.inputs, icMeta.outputs) * 22 + 20) : getICHeight(gate.type)) : 100;
          const cfGateId = connectingFrom?.gateId ?? connectingFrom?.gate?.id;

          return (
            <div
              key={gate.id}
              data-gate-id={gate.id}
              className={`gate ${gate.type === "OUTPUT" ? "output-gate" : ""} ${isIC ? "gate--ic" : ""} ${selectedGateIds.includes(gate.id) ? "selected" : ""} ${gate.type === "OUTPUT" && evaluateGate(gate) ? "active" : ""}`}
              style={{ left: gate.x, top: gate.y, height: isIC ? icH : undefined }}
              onMouseDown={(e) => handleGateMouseDown(e, gate)}
              onTouchStart={(e) => { if (e.touches.length === 1) { e.stopPropagation(); startDrag(e.touches[0], gate); } }}
              onDoubleClick={(e) => startRename(e, gate)}
              onContextMenu={(e) => { e.preventDefault(); deleteGate(gate); }}
            >
              <div className="gate-content">
                {gateSymbols[gate.type] || (isCustom && icMeta && <GenericICSymbol name={gate.label} inputCount={icMeta.inputs} outputCount={icMeta.outputs} />)}
                {!isIC && <div className="gate-label">{gate.label || gate.type}</div>}
              </div>

              {canExpand && (
                <div className="gate-input-controls">
                  <button className="gate-input-btn" title={canRemoveInput ? `Remove input (${gate.inputs - 1} inputs)` : `Minimum ${MIN_GATE_INPUTS} inputs`} disabled={!canRemoveInput} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => removeInputSlot(e, gate)}>−</button>
                  <span className="gate-input-count">{gate.inputs}</span>
                  <button className="gate-input-btn" title={canAddInput ? `Add input (${gate.inputs + 1} inputs)` : `Maximum ${MAX_GATE_INPUTS} inputs`} disabled={!canAddInput} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => addInputSlot(e, gate)}>+</button>
                </div>
              )}

              {isIC && icMeta && Array.from({ length: icMeta.outputs }).map((_, outIdx) => {
                const n = icMeta.outputs, topPct = n === 1 ? 50 : 10 + (outIdx / (n - 1)) * 80;
                const isConnecting = cfGateId === gate.id && connectingFrom?.outputIndex === outIdx;
                return (
                  <div key={`out-${outIdx}`} className={`connection-point output-point ic-output-point ${isConnecting ? "active" : ""} ${evaluateGate(gate, outIdx) ? "ic-output-point--high" : ""}`} style={{ top: `${topPct}%` }} title={icMeta.outputLabels?.[outIdx]} onMouseDown={stopPortEvent} onClick={() => handleOutputPortClick(gate, outIdx)}>
                    <span className="ic-pin-label">{icMeta.outputLabels?.[outIdx]}</span>
                  </div>
                );
              })}

              {!isIC && gate.hasOutput && (
                <div className={`connection-point output-point ${cfGateId === gate.id ? "active" : ""}`} onMouseDown={stopPortEvent} onClick={() => handleOutputPortClick(gate, 0)} />
              )}

              {gate.type === "INPUT" && (
                <div className={`connection-point input-point ${connectingFrom ? "active" : ""}`} style={{ top: "50%" }} title="Drop a wire here to join this input with another" onMouseDown={stopPortEvent} onClick={() => completeConnection(gate, 0)} />
              )}

              {isIC && icMeta && Array.from({ length: icMeta.inputs }).map((_, idx) => {
                const n = icMeta.inputs, topPct = n === 1 ? 50 : 10 + (idx / (n - 1)) * 80;
                return (
                  <div key={`in-${idx}`} className={`connection-point input-point ic-input-point ${connectingFrom ? "active" : ""}`} style={{ top: `${topPct}%` }} title={icMeta.inputLabels?.[idx]} onMouseDown={stopPortEvent} onClick={() => completeConnection(gate, idx)}>
                    <span className="ic-pin-label ic-pin-label--left">{icMeta.inputLabels?.[idx]}</span>
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

        {/* Comment pins render in world-space, inside the same transformed
            container as gates, so they pan/zoom together with the circuit. */}
        {renderedComments.map((comment) => (
          <CommentPin
            key={comment.id}
            comment={comment}
            isOpen={openCommentId === comment.id}
            isEditing={editingCommentId === comment.id}
            editText={editText}
            onToggleOpen={() => handleToggleOpen(comment)}
            onStartEdit={() => handleStartEdit(comment)}
            onChangeText={setEditText}
            onSave={() => handleSaveEdit(comment.id)}
            onCancel={handleCancelEdit}
            onDelete={() => handleDeleteComment(comment.id)}
          />
        ))}
      </div>

      <div className="canvas-overlay-controls">
        <button className={`canvas-overlay-btn${selectionToolActive ? " canvas-overlay-btn--active" : ""}`} onClick={() => setSelectionToolActive((v) => !v)} style={selectionToolActive ? { background: "var(--accent-primary, #7c3aed)", color: "#fff", borderColor: "var(--accent-primary, #7c3aed)" } : {}}>⬚</button>
        <button className="canvas-overlay-btn" onClick={fitToView}>⊡</button>
        <button className="canvas-overlay-btn" onClick={() => setZoom((z) => Math.min(3, z * 1.2))}>+</button>
        <button className="canvas-overlay-btn" onClick={() => setZoom((z) => Math.max(0.3, z * 0.8))}>−</button>
      </div>

      <ZoomWidget zoom={zoom} setZoom={setZoom} setPanOffset={setPanOffset} fitToView={fitToView} />

      {showSimulate && (
        <SimulatePanel
          onClose={onCloseSimulate}
          inputGates={inputGates}
          outputGates={outputGates}
          wires={wires}
          toggleInput={toggleInput}
          evaluateGate={evaluateGate}
          truthTable={truthTable}
        />
      )}

      {showAIPanel && (
        <AIPanel
          onClose={onCloseAIPanel}
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          handleRequestHint={handleRequestHint}
          hintLoading={hintLoading}
          handleGenerateCircuit={handleGenerateCircuit}
          isGenLoading={isGenLoading}
          hint={hint}
          hintError={hintError}
          setHint={setHint}
          setHintError={setHintError}
        />
      )}

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