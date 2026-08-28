import React, { useState, useEffect, useRef } from "react";
import {
  Undo2,
  Redo2,
  Trash2,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  MousePointer2,
  Wand2,
  Sun,
  Moon,
  Magnet,
  Grid3x3,
  Bot,
  Sparkles,
  Lightbulb,
  X,
  Zap,
  Activity,
  Table2,
  Image,
  MessageSquare,
  History,
  Settings2,
  HelpCircle,
  Info,
  Keyboard,
  Boxes,
  Cable,
  LogIn,
  LogOut,
  Check,
} from "lucide-react";
import { TruthTableGenerator } from "./TruthTable";
import { SaveAndLoad } from "./SaveAndLoad";
import { RibbonMenu, RibbonMenuSection, RibbonMenuItem, RibbonMenuDivider, SoonBadge } from "./RibbonMenu";
import { useToast } from "../../../shared/context/ToastContext";
import { layoutGeneratedCircuit } from "../utils/layoutGeneratedCircuit";

export const ToolbarRibbon = ({
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
  setGates,
  sheets,
  loadSheets,
  saveToHistory,
  clearCircuit,
  // zoom
  zoom,
  setZoom,
  setPanOffset,
  fitToView,
  // view
  selectionToolActive,
  setSelectionToolActive,
  // theme 
  theme,
  toggleTheme,
}) => {
  const toast = useToast();
  const [openMenu, setOpenMenu] = useState(null);
  const ribbonRef = useRef(null);

  const toggleMenu = (name) => setOpenMenu((m) => (m === name ? null : name));
  const closeMenu = () => setOpenMenu(null);

  useEffect(() => {
    if (!openMenu) return;
    const onDocMouseDown = (e) => {
      if (ribbonRef.current && !ribbonRef.current.contains(e.target)) closeMenu();
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  // ToastContext (see useAI.js / useSheets.js) exposes warning/error/success —
  // "warning" is the closest neutral tone for a stub-feature notice.
  const notReady = (feature) => {
    toast.warning(`${feature} is on the roadmap — not wired up yet.`);
  };

  // Auto-Arrange: real feature, reuses the same layout engine already used
  // for AI-generated circuits (utils/layoutGeneratedCircuit) to re-flow the
  // current gates into left-to-right columns based on the wire graph.
  const handleAutoArrange = () => {
    if (!gates.length) {
      toast.warning?.("Nothing to arrange yet — add some gates first.");
      return;
    }
    setGates((prev) => layoutGeneratedCircuit(prev, wires));
    setTimeout(() => saveToHistory(), 0);
    closeMenu();
  };

  return (
    <div className="toolbar-ribbon" ref={ribbonRef}>
      {/* ── Edit: undo / redo / clear ───────────────────────────────── */}
      <div className="ribbon-group">
        <button className="ribbon-button ribbon-button--icon" onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)">
          <Undo2 size={16} strokeWidth={2} />
        </button>
        <button
          className="ribbon-button ribbon-button--icon"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={16} strokeWidth={2} />
        </button>
        <button className="ribbon-button ribbon-button--icon ribbon-button--danger" onClick={clearCircuit} title="Clear All">
          <Trash2 size={16} strokeWidth={2} />
        </button>
      </div>

      <div className="ribbon-divider" />

      {/* ── File ─────────────────────────────────────────────────────── */}
      <RibbonMenu label="File" icon={FolderOpen} isOpen={openMenu === "file"} onToggle={() => toggleMenu("file")}>
        <RibbonMenuSection title="Project">
          <SaveAndLoad sheets={sheets} loadSheets={loadSheets} />
        </RibbonMenuSection>
      </RibbonMenu>

      {/* ── Zoom (kept always visible — most-used control) ──────────── */}
      <div className="ribbon-group ribbon-group--zoom">
        <button className="ribbon-button ribbon-button--icon" onClick={() => setZoom(Math.min(3, zoom * 1.2))} title="Zoom In">
          <ZoomIn size={16} strokeWidth={2} />
        </button>
        <span className="ribbon-zoom-level">{Math.round(zoom * 100)}%</span>
        <button className="ribbon-button ribbon-button--icon" onClick={() => setZoom(Math.max(0.1, zoom * 0.8))} title="Zoom Out">
          <ZoomOut size={16} strokeWidth={2} />
        </button>
        <button
          className="ribbon-button ribbon-button--icon"
          onClick={() => {
            setZoom(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          title="Reset Zoom"
        >
          <RotateCcw size={16} strokeWidth={2} />
        </button>
        <button className="ribbon-button ribbon-button--icon" onClick={fitToView} title="Fit all gates into view">
          <Maximize2 size={16} strokeWidth={2} />
        </button>
      </div>

      {/* ── View ─────────────────────────────────────────────────────── */}
      <RibbonMenu label="View" icon={Settings2} isOpen={openMenu === "view"} onToggle={() => toggleMenu("view")}>
        <RibbonMenuSection title="Canvas">
          <RibbonMenuItem
            icon={MousePointer2}
            label="Selection Tool"
            description="Box-select multiple components"
            active={selectionToolActive}
            trailing={selectionToolActive ? <Check size={14} /> : null}
            onClick={() => {
              setSelectionToolActive((v) => !v);
              closeMenu();
            }}
          />
          <RibbonMenuItem icon={Wand2} label="Auto-Arrange" description="Re-flow gates by signal flow" onClick={handleAutoArrange} />
          <RibbonMenuItem
            icon={theme === "light" ? Moon : Sun}
            label={theme === "light" ? "Dark Mode" : "Light Mode"}
            description="Switch the app color theme"
            onClick={() => {
              toggleTheme?.();
              closeMenu();
            }}
          />
        </RibbonMenuSection>
        <RibbonMenuDivider />
        <RibbonMenuSection title="Grid (coming soon)">
          <RibbonMenuItem icon={Magnet} label="Snap to Grid" trailing={<SoonBadge />} disabled />
          <RibbonMenuItem icon={Grid3x3} label="Show Grid Overlay" trailing={<SoonBadge />} disabled />
        </RibbonMenuSection>
      </RibbonMenu>

      <div className="ribbon-divider" />

      {/* ── Simulate ─────────────────────────────────────────────────── */}
      <RibbonMenu label="Simulate" icon={Activity} isOpen={openMenu === "simulate"} onToggle={() => toggleMenu("simulate")} wide>
        {inputGates.length > 0 && (
          <RibbonMenuSection title="Input Toggles">
            <div className="ribbon-io-list">
              {inputGates.map((gate) => {
                // Preserve the original driven-input lock: a toggle wired
                // from another gate stays disabled and visibly dimmed.
                const driven = wires.some((w) => w.toId === gate.id);
                return (
                  <div key={gate.id} className="input-toggle">
                    <label>
                      {gate.label}
                      {driven ? " (linked)" : ""}
                    </label>
                    <div
                      className={`toggle-btn ${gate.inputValues[0] ? "on" : ""}`}
                      onClick={() => {
                        if (!driven) toggleInput(gate);
                      }}
                      style={driven ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
                      title={driven ? "This input is driven by a wire" : undefined}
                    />
                  </div>
                );
              })}
            </div>
          </RibbonMenuSection>
        )}

        {outputGates.length > 0 && (
          <RibbonMenuSection title="Output Values">
            <div className="ribbon-io-list">
              {outputGates.map((gate) => (
                <div key={gate.id} className="output-item">
                  <label>{gate.label}</label>
                  <div className={`output-value ${evaluateGate(gate) ? "high" : "low"}`}>
                    {evaluateGate(gate) ? "1" : "0"}
                  </div>
                </div>
              ))}
            </div>
          </RibbonMenuSection>
        )}

        <RibbonMenuSection title="Analysis">
          <div className="ribbon-truth-table-row">
            <Table2 size={16} strokeWidth={2} />
            <TruthTableGenerator truthTable={truthTable} />
          </div>
        </RibbonMenuSection>
      </RibbonMenu>

      {/* ── AI (hidden in embedded mode) ────────────────────────────── */}
      {!embedded && (
        <RibbonMenu label="AI" icon={Bot} isOpen={openMenu === "ai"} onToggle={() => toggleMenu("ai")} wide>
          <RibbonMenuSection title="CircuitMind Assistant">
            <textarea
              className="ai-textarea"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe the circuit (e.g. 'half adder', 'A AND B OR C')…"
              rows={2}
            />
            <div className="controls">
              <button
                className="btn hint-btn"
                onClick={handleRequestHint}
                disabled={hintLoading}
                style={{ cursor: hintLoading ? "wait" : "pointer" }}
              >
                <Lightbulb size={14} strokeWidth={2} style={{ marginRight: 4, verticalAlign: -2 }} />
                {hintLoading ? "Thinking…" : "Get Hint"}
              </button>
              <button
                className="btn generate-btn"
                onClick={handleGenerateCircuit}
                disabled={isGenLoading}
                style={{ cursor: isGenLoading ? "wait" : "pointer" }}
              >
                <Sparkles size={14} strokeWidth={2} style={{ marginRight: 4, verticalAlign: -2 }} />
                {isGenLoading ? "Generating…" : "AI Generate"}
              </button>
            </div>
            {(hint || hintError) && (
              <div className={`ai-response ${hintError ? "error" : ""}`}>
                {hintError || hint}
                <button
                  className="dismiss-hint"
                  onClick={() => {
                    setHint(null);
                    setHintError("");
                  }}
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </RibbonMenuSection>
        </RibbonMenu>
      )}

      {/* ── Tools: visible but not-yet-wired feature previews ───────── */}
      <RibbonMenu label="Tools" icon={Zap} isOpen={openMenu === "tools"} onToggle={() => toggleMenu("tools")} badge="4">
        <RibbonMenuSection title="Coming soon">
          <RibbonMenuItem
            icon={Image}
            label="Export as PNG"
            description="Save the canvas as an image"
            trailing={<SoonBadge />}
            onClick={() => notReady("PNG export")}
          />
          <RibbonMenuItem
            icon={MessageSquare}
            label="Comments"
            description="Leave notes on the circuit"
            trailing={<SoonBadge />}
            onClick={() => notReady("Comments")}
          />
          <RibbonMenuItem
            icon={History}
            label="Version History"
            description="Browse past saves"
            trailing={<SoonBadge />}
            onClick={() => notReady("Version history")}
          />
          <RibbonMenuItem
            icon={Boxes}
            label="Component Library"
            description="Save custom reusable blocks"
            trailing={<SoonBadge />}
            onClick={() => notReady("Component library")}
          />
        </RibbonMenuSection>
      </RibbonMenu>

      {/* ── Help / About ─────────────────────────────────────────────── */}
      <RibbonMenu label="Help" icon={HelpCircle} isOpen={openMenu === "help"} onToggle={() => toggleMenu("help")} wide>
        <RibbonMenuSection title="About Boolforge">
          <p className="ribbon-help-text">
            <Info size={14} strokeWidth={2} style={{ marginRight: 6, verticalAlign: -2 }} />
            Boolforge is a visual digital-logic editor: place gates, wire them
            up, and see truth tables and outputs update live. Multiple sheets
            let you build several circuits in one project.
          </p>
        </RibbonMenuSection>
        <RibbonMenuDivider />
        <RibbonMenuSection title="Controls">
          <ul className="ribbon-help-list">
            <li>Click a palette button to add a component</li>
            <li>Drag gates to move them (group drag supported)</li>
            <li>Drag empty space to pan the canvas</li>
            <li>Enable Selection Tool to box-select components</li>
            <li>Hold Space or drag with the middle button to pan anytime</li>
            <li>Ctrl + Click to add/remove individual gates from selection</li>
            <li>Click an output dot then an input dot to wire them</li>
            <li>Right-click a wire to delete it</li>
            <li>Right-click a gate to delete it (deletes selection)</li>
            <li>Double-click a gate to rename it</li>
            <li>Scroll to zoom in or out</li>
            <li>Use + / − on a gate to resize its inputs</li>
          </ul>
        </RibbonMenuSection>
        <RibbonMenuDivider />
        <RibbonMenuSection title="Keyboard Shortcuts">
          <ul className="ribbon-help-list ribbon-help-list--shortcuts">
            <li>
              <Keyboard size={13} strokeWidth={2} /> <kbd>Ctrl</kbd>+<kbd>Z</kbd> Undo
            </li>
            <li>
              <Keyboard size={13} strokeWidth={2} /> <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> Redo
            </li>
            <li>
              <Keyboard size={13} strokeWidth={2} /> <kbd>Ctrl</kbd>+<kbd>A</kbd> Select All
            </li>
            <li>
              <Keyboard size={13} strokeWidth={2} /> <kbd>Ctrl</kbd>+<kbd>D</kbd> Duplicate
            </li>
            <li>
              <Keyboard size={13} strokeWidth={2} /> <kbd>Ctrl</kbd>+<kbd>C</kbd> / <kbd>Ctrl</kbd>+<kbd>V</kbd> Copy / Paste
            </li>
            <li>
              <Keyboard size={13} strokeWidth={2} /> <kbd>Delete</kbd> / <kbd>Backspace</kbd> Remove selected
            </li>
            <li>
              <Keyboard size={13} strokeWidth={2} /> <kbd>Esc</kbd> Cancel wire / clear selection
            </li>
          </ul>
        </RibbonMenuSection>
      </RibbonMenu>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <div className="ribbon-stats">
        <span title="Gates">
          <Boxes size={13} strokeWidth={2} /> {gates.length}
        </span>
        <span title="Wires">
          <Cable size={13} strokeWidth={2} /> {wires.length}
        </span>
        <span title="Inputs">
          <LogIn size={13} strokeWidth={2} /> {inputGates.length}
        </span>
        <span title="Outputs">
          <LogOut size={13} strokeWidth={2} /> {outputGates.length}
        </span>
      </div>
    </div>
  );
};
