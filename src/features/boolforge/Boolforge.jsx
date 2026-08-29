import React, { useState, useRef, useEffect } from "react";
import { parseExpressionToCircuit } from "../../shared/utils/expressionParser";
import RelatedSeoLinks from "../../shared/seo/RelatedSeoLinks";
import Navbar from "../../shared/components/navbar";
import { useTheme } from "../../shared/context/ThemeContext";
import "./Boolforge.css";

import { Sidebar, RenameModal, CircuitCanvas, ToolbarRibbon } from "./components";
import {
  useKeyboardShortcuts,
  useSheets,
  useCanvasInteractions,
  useSimulation,
  useAI,
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
  const [fullScreen, setFullScreen] = useState(false);

  const [showSimulate, setShowSimulate] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [showGridOverlay, setShowGridOverlay] = useState(true);

  // ── Refs shared across hooks ─────────────────────────────────────────────
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const hasAutoBuilt = useRef(false);
  const lastSyncKeyRef = useRef(null);

  // SHEETS + CIRCUIT STATE (gates, wires, counters, history, CRUD) —
  // useSheets manages multiple independent circuit sheets and mirrors the
  // active sheet's circuit into the same live gates/wires/etc state shape
  // that useCircuitState used to provide, so downstream hooks are unchanged.
  const circuit = useSheets({ portNames, containerRef, snapEnabled });
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
  } = circuit;

  // SIMULATION (gate evaluation + truth table)
  const { evaluateGate, truthTable } = useSimulation({ gates, wires, gateMap });

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
      {/* TOOLBAR RIBBON — replaces the old right-hand CircuitControls panel */}
      <ToolbarRibbon
        embedded={embedded}
        containerRef={containerRef}
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
        wires={wires}
        toggleInput={toggleInput}
        evaluateGate={evaluateGate}
        truthTable={truthTable}
        undo={undo}
        redo={redo}
        historyIndex={historyIndex}
        history={history}
        gates={gates}
        setGates={setGates}
        sheets={sheets}
        loadSheets={loadSheets}
        saveToHistory={saveToHistory}
        clearCircuit={clearCircuit}
        selectionToolActive={selectionToolActive}
        setSelectionToolActive={setSelectionToolActive}
        theme={theme}
        toggleTheme={toggleTheme}
        onToggleFullScreen={() => setFullScreen(!fullScreen)} 
        showSimulate={showSimulate}
        onToggleSimulate={() => setShowSimulate((v) => !v)}
        showAI={showAIPanel}
        onToggleAI={() => setShowAIPanel((v) => !v)}
        snapEnabled={snapEnabled}
        setSnapEnabled={setSnapEnabled}
        showGridOverlay={showGridOverlay}
        setShowGridOverlay={setShowGridOverlay}
      />
    
      {/* WORKSPACE — sidebar + canvas, below the ribbon */}
      <div className="circuit-workspace">
        {/* SIDEBAR COMPONENT */}
        <Sidebar
          selectionToolActive={selectionToolActive}
          setSelectionToolActive={setSelectionToolActive}
          simplifiedExpression={simplifiedExpression}
          addGate={addGate}
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
          setPanOffset={setPanOffset}
          inputGates={inputGates}
          outputGates={outputGates}
          toggleInput={toggleInput}
          truthTable={truthTable}
          showSimulate={showSimulate}
          onCloseSimulate={() => setShowSimulate(false)}
          showAIPanel={showAIPanel}
          onCloseAIPanel={() => setShowAIPanel(false)}
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
          showGridOverlay={showGridOverlay}
        />
      </div>

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
      <Navbar 
        toggleTheme={toggleTheme} 
        theme={theme} 
        isVisible={!fullScreen} 
      />

      <main className={`boolforge-main${!fullScreen ? "" : " boolforge-main--fullscreen"}`}>
        {circuitTool}
      </main>
    </div>
  );
};

export default Boolforge;
