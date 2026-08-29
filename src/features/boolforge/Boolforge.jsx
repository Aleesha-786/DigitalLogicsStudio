import React, { useState, useRef, useEffect } from "react";
import { parseExpressionToCircuit } from "../../shared/utils/expressionParser";
import RelatedSeoLinks from "../../shared/seo/RelatedSeoLinks";
import Navbar from "../../shared/components/navbar";
import Footer from "../../shared/components/Footer";
import { useTheme } from "../../shared/context/ThemeContext";
import "./Boolforge.css";
import { Sidebar, RenameModal, CircuitCanvas, CircuitControls, CreateComponentDialog } from "./components";

import {
  useKeyboardShortcuts,
  useSheets,
  useCanvasInteractions,
  useSimulation,
  useAI,
  useCustomComponents,
} from "./hooks";

const Boolforge = ({
  simplifiedExpression = null,
  variables = [],
  onCircuitChange,
  portNames = null,
  embedded = false,
  initialGates = null,
  initialWires = null,
}) => {
  const { theme, toggle: toggleTheme } = useTheme();

  // ── UI shell state ──────────────────────────────────────────────────────
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(true);

  // ── Refs shared across hooks ─────────────────────────────────────────────
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const hasAutoBuilt = useRef(false);
  const lastSyncKeyRef = useRef(null);

  // SHEETS + CIRCUIT STATE (gates, wires, counters, history, CRUD) —
  // useSheets manages multiple independent circuit sheets and mirrors the
  // active sheet's circuit into the same live gates/wires/etc state shape
  // that useCircuitState used to provide, so downstream hooks are unchanged.
   const { components: customComponents, createComponent, deleteComponent } = useCustomComponents();
  const circuit = useSheets({ portNames, containerRef, customComponents });
 
  const {
    sheets, activeSheetId, setActiveSheetId, addSheet, renameSheet, deleteSheet, loadSheets,
    gates, setGates,
    wires, setWires,
    setGateIdCounter,
    wireIdCounter, setWireIdCounter,
    setInputCounter,
    setOutputCounter,
    selectedGate, setSelectedGate,
    selectedGateIds, setSelectedGateIds,
    selectedWireIds, setSelectedWireIds,
    renamingGate, renameValue, setRenameValue,
    history, setHistory, historyIndex, setHistoryIndex,
    gateMap, inputGates, outputGates,
    saveToHistory, undo, redo,
    snapToGrid,
    deleteGate, addGate, addInputSlot, removeInputSlot,
    startRename, commitRename, cancelRename,
    toggleInput,
    mergeInputGates, deleteWire,
    copySelectedGates, pasteGates, duplicateSelectedGates,
    clearCircuit,
     customIcMeta,
  } = circuit;

  // SIMULATION (gate evaluation + truth table)
  const { evaluateGate, truthTable } = useSimulation({ gates, wires, gateMap, customIcMeta });

  // CANVAS INTERACTIONS (pan, zoom, selection, drag, wiring, touch)
  const canvas = useCanvasInteractions({
    gates,
    setGates,
    wires,
    setWires,
    gateMap,
    wireIdCounter,
    setWireIdCounter,
    saveToHistory,
    snapToGrid,
    selectedGateIds,
    setSelectedGateIds,
    selectedGate,
    setSelectedGate,
    selectedWireIds,
    setSelectedWireIds,
    mergeInputGates,
    deleteWire,
    containerRef,
    canvasRef,
  });
  const {
    zoom, setZoom,
    panOffset, setPanOffset,
    isPanning,
    spacePressed,
    selectionToolActive, setSelectionToolActive,
    isSelecting, selectionStart, selectionEnd,
    connectingFrom, setConnectingFrom,
    connectCursor, setConnectCursor,
    clientToWorld,
    startDrag, onDrag, stopDrag,
    handleOutputPortClick,
    handleCanvasContextMenu,
    handleCanvasMouseDown, handleMouseMove, handleMouseUp,
    completeConnection,
    stopPortEvent,
    fitToView,
    setIsPanning,
    setPanStart,
  } = canvas;

  // AI INTEGRATION (CircuitMind hints + AI generation)
  const {
    aiPrompt, setAiPrompt,
    hint, setHint,
    hintLoading, hintError, setHintError,
    isGenLoading,
    handleGenerateCircuit,
    handleRequestHint,
  } = useAI({
    gates,
    wires,
    inputGates,
    outputGates,
    setGates,
    setWires,
    setGateIdCounter,
    setWireIdCounter,
    setInputCounter,
    setOutputCounter,
    saveToHistory,
  });


const [showCreateComponent, setShowCreateComponent] = useState(false);

const selectionPortCounts = {
  inputs: gates.filter((g) => selectedGateIds.includes(g.id) && g.type === "INPUT").length,
  outputs: gates.filter((g) => selectedGateIds.includes(g.id) && g.type === "OUTPUT").length,
};
const canCreateComponent = selectionPortCounts.inputs > 0 && selectionPortCounts.outputs > 0;

const handleCreateComponent = async (name) => {
  const selected = gates.filter((g) => selectedGateIds.includes(g.id));
  const innerInputs = selected.filter((g) => g.type === "INPUT");
  const innerOutputs = selected.filter((g) => g.type === "OUTPUT");
  const innerWires = wires.filter(
    (w) => selectedGateIds.includes(w.fromId) && selectedGateIds.includes(w.toId),
  );

  await createComponent({
    name,
    inputs: innerInputs.map((g) => ({ label: g.label })),
    outputs: innerOutputs.map((g) => ({ label: g.label })),
    gates: selected,
    wires: innerWires,
  });
};
  // HOOK USAGE FOR KEYBOARD SHORTCUTS
  useKeyboardShortcuts({
    undo,
    redo,
    gates,
    selectedGateIds,
    setSelectedGateIds,
    selectedWireIds,
    setSelectedWireIds,
    deleteGate,
    setWires,
    saveToHistory,
    copySelectedGates,
    pasteGates,
    duplicateSelectedGates,
    setConnectingFrom,
    setConnectCursor,
  });

  // ── Effects ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (simplifiedExpression && variables.length > 0 && !hasAutoBuilt.current) {
      const circuitFromExpr = parseExpressionToCircuit(simplifiedExpression, variables);
      if (circuitFromExpr.gates && circuitFromExpr.gates.length > 0) {
        setGates(circuitFromExpr.gates);
        setWires(circuitFromExpr.wires);
        setGateIdCounter(circuitFromExpr.gateIdCounter || circuitFromExpr.gates.length);
        setWireIdCounter(circuitFromExpr.wireIdCounter || circuitFromExpr.wires.length);
        const inputCount = circuitFromExpr.gates.filter((g) => g.type === "INPUT").length;
        const outputCount = circuitFromExpr.gates.filter((g) => g.type === "OUTPUT").length;
        setInputCounter(inputCount);
        setOutputCounter(outputCount);
        hasAutoBuilt.current = true;
        setTimeout(() => {
          setHistory([{
            gates: circuitFromExpr.gates,
            wires: circuitFromExpr.wires,
            gateIdCounter: circuitFromExpr.gateIdCounter || circuitFromExpr.gates.length,
            wireIdCounter: circuitFromExpr.wireIdCounter || circuitFromExpr.wires.length,
            inputCounter: inputCount,
            outputCounter: outputCount,
          }]);
          setHistoryIndex(0);
        }, 100);
      }
    }
  }, [
    simplifiedExpression,
    variables,
    setGates,
    setWires,
    setGateIdCounter,
    setWireIdCounter,
    setInputCounter,
    setOutputCounter,
    setHistory,
    setHistoryIndex,
  ]);

  useEffect(() => {
    if (Array.isArray(initialGates) && initialGates.length > 0) {
      const key = JSON.stringify({ g: initialGates, w: initialWires || [] });
      if (lastSyncKeyRef.current === key) return;
      lastSyncKeyRef.current = key;
      setGates(initialGates);
      setWires(Array.isArray(initialWires) ? initialWires : []);
      const maxGateId = Math.max(...initialGates.map((g) => Number(g.id) || 0), 0) + 1;
      const maxWireId = Math.max(...(initialWires || []).map((w) => Number(w.id) || 0), 0) + 1;
      setGateIdCounter(maxGateId);
      setWireIdCounter(maxWireId);
    }
  }, [initialGates, initialWires, setGates, setWires, setGateIdCounter, setWireIdCounter]);

  useEffect(() => {
    if (typeof onCircuitChange === "function") {
      lastSyncKeyRef.current = JSON.stringify({ g: gates, w: wires });
      onCircuitChange(gates, wires);
    }
  }, [gates, wires, onCircuitChange]);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const container = containerRef.current;
    if (!canvasEl || !container) return;
    const resizeCanvas = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        canvasEl.width = w;
        canvasEl.height = h;
        const ctx = canvasEl.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, w, h);
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(resizeCanvas);
      ro.observe(container);
    }
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (ro) ro.disconnect();
    };
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────
  const circuitTool = (
    <div
      className="container circuit-maker"
      onMouseMove={(e) => {
        if (connectingFrom) setConnectCursor(clientToWorld(e.clientX, e.clientY));
        if (isPanning || isSelecting) handleMouseMove(e);
        else onDrag(e);
      }}
      onMouseUp={() => { stopDrag(); handleMouseUp(); }}
      onTouchMove={(e) => {
        if (e.touches.length === 1) {
          const t = e.touches[0];
          if (isPanning) handleMouseMove(t);
          else onDrag(t);
        }
      }}
      onTouchEnd={() => { stopDrag(); handleMouseUp(); }}
    >
      {/* SIDEBAR COMPONENT */}
      <Sidebar
        selectionToolActive={selectionToolActive}
        setSelectionToolActive={setSelectionToolActive}
        simplifiedExpression={simplifiedExpression}
        addGate={addGate}
        customComponents={customComponents}
        onDeleteComponent={deleteComponent}
      />

      {/* CANVAS COMPONENT */}
      <CircuitCanvas
        gates={gates}
        wires={wires}
        gateMap={gateMap}
        selectedGateIds={selectedGateIds}
        selectedWireIds={selectedWireIds}
        setSelectedGateIds={setSelectedGateIds}
        setSelectedWireIds={setSelectedWireIds}
        setSelectedGate={setSelectedGate}
        evaluateGate={evaluateGate}
        zoom={zoom}
        panOffset={panOffset}
        isPanning={isPanning}
        spacePressed={spacePressed}
        selectionToolActive={selectionToolActive}
        setSelectionToolActive={setSelectionToolActive}
        isSelecting={isSelecting}
        selectionStart={selectionStart}
        selectionEnd={selectionEnd}
        connectingFrom={connectingFrom}
        setConnectCursor={setConnectCursor}
        connectCursor={connectCursor}
        clientToWorld={clientToWorld}
        startDrag={startDrag}
        onDrag={onDrag}
        stopDrag={stopDrag}
        setIsPanning={setIsPanning}
        setPanStart={setPanStart}
        handleOutputPortClick={handleOutputPortClick}
        handleCanvasContextMenu={handleCanvasContextMenu}
        handleCanvasMouseDown={handleCanvasMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
        stopPortEvent={stopPortEvent}
        fitToView={fitToView}
        setZoom={setZoom}
        addInputSlot={addInputSlot}
        removeInputSlot={removeInputSlot}
        startRename={startRename}
        deleteGate={deleteGate}
        deleteWire={deleteWire}
        completeConnection={completeConnection}
        containerRef={containerRef}
        canvasRef={canvasRef}
        sheets={sheets}
        activeSheetId={activeSheetId}
        onSwitchSheet={setActiveSheetId}
        onAddSheet={addSheet}
        onRenameSheet={renameSheet}
        onDeleteSheet={deleteSheet}
        embedded={embedded}
        customIcMeta={customIcMeta}
      />

      {/* RIGHT PANEL / CONTROLS COMPONENT */}
      <CircuitControls
        embedded={embedded}
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
        inputGates={inputGates}
        outputGates={outputGates}
        canCreateComponent={canCreateComponent}
        onOpenCreateComponent={() => setShowCreateComponent(true)}
        wires={wires}
        toggleInput={toggleInput}
        evaluateGate={evaluateGate}
        truthTable={truthTable}
        undo={undo}
        redo={redo}
        historyIndex={historyIndex}
        history={history}
        gates={gates}
        sheets={sheets}
        loadSheets={loadSheets}
        saveToHistory={saveToHistory}
        clearCircuit={clearCircuit}
        zoom={zoom}
        setZoom={setZoom}
        setPanOffset={setPanOffset}
        fitToView={fitToView}
      />
<CreateComponentDialog
  open={showCreateComponent}
  onClose={() => setShowCreateComponent(false)}
  onCreate={handleCreateComponent}
  portCount={selectionPortCounts}
/>
      {/* RENAME MODAL COMPONENT */}
      <RenameModal
        renamingGate={renamingGate}
        renameValue={renameValue}
        setRenameValue={setRenameValue}
        commitRename={commitRename}
        cancelRename={cancelRename}
      />

      <RelatedSeoLinks />
    </div>
  );

  // ── Page Shell ─────────────────────────────────────────────────────────
  if (embedded) return circuitTool;

  return (
    <div className={`boolforge-page theme-${theme}`}>
      <div className="grid-background" />
      {navbarVisible && <Navbar toggleTheme={toggleTheme} theme={theme} onToggleNavbar={() => setNavbarVisible(false)} />}
      {!navbarVisible && (
        <button className="navbar-restore-btn" onClick={() => setNavbarVisible(true)} aria-label="Show navbar" title="Show navbar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /></svg>
        </button>
      )}
      <main className={`boolforge-main${navbarVisible ? "" : " boolforge-main--fullscreen"}`}>
        {circuitTool}
      </main>
      {footerVisible && <Footer onToggleFooter={() => setFooterVisible(false)} />}
      {!footerVisible && (
        <button className="footer-restore-btn" onClick={() => setFooterVisible(true)} aria-label="Show footer" title="Show footer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="15" x2="21" y2="15" /></svg>
        </button>
      )}
    </div>
  );
};

export default Boolforge;
