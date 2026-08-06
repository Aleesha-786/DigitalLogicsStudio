import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../shared/components/Navbar";
import Footer from "../../shared/components/Footer";
import { useTheme } from "../../shared/context/ThemeContext";
import { useAuth } from "../../auth/context/AuthContext";
import trainerBoardService from "../../shared/services/trainerBoardService";

import { ICS, IC_LOGIC } from "./utils/icCatalog";
import { buildNetlist, readNode } from "./utils/netlist";
import { evaluateCircuit, advanceSequential } from "./utils/simulationEngine";
import { getBBDimensions, snapICPosition } from "./utils/breadboardLayout";

import { Seg7 } from "./components/Seg7";
import { LED } from "./components/LED";
import { ToggleSW } from "./components/ToggleSW";
import { Breadboard } from "./components/Breadboard";
import { WireOverlay } from "./components/WireOverlay";
import { TrayIC } from "./components/TrayIC";
import { DatasheetPopup } from "./components/DatasheetPopup";
import Sec from "./components/Sec";

/* ================================================================
   IT-300 Digital Logic Training System — Infinit Technologies
   Fixed version: proper holes, correct wire coords, working drag-drop
   ================================================================ */

// ═══════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════
export default function IT300() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [switches, setSwitches] = useState(Array(8).fill(0));
  const [draggingPlaced, setDraggingPlaced] = useState(null); // {id, ic}
  const [clkHz, setClkHz] = useState(1);
  const [clkOn, setClkOn] = useState(true);
  const [clk, setClk] = useState(0);
  const [pushBtns, setPush] = useState([0, 0]);
  const [wires, setWires] = useState([]);
  const [wireStart, setWireStart] = useState(null); // {id, ax, ay} — SVG-local coords
  const [preview, setPreview] = useState(null);
  const [wireCol, setWireCol] = useState("#e63946");
  const [colIdx, setColIdx] = useState(0);
  const [mode, setMode] = useState("wire");
  const [placedICs, setPlacedICs] = useState([]);
  const [dragging, setDragging] = useState(null);
  // Sequential-IC internal state (flip-flop Q, counter value, shift reg bits),
  // keyed by placedIC.id. This is the "memory" half of the simulation engine.
  const [icRegs, setIcRegs] = useState({});
  const [saveState, setSaveState] = useState({ status: "idle", message: "" }); // idle|saving|saved|error
  const [circuitName, setCircuitName] = useState("Untitled Circuit");
  const [datasheet, setDatasheet] = useState(null); // NEW: {icKey, x, y} | null
  const [wireWarning, setWireWarning] = useState(""); // NEW: transient "pin already used" message
  // FIX: single ref attached to the wrapper div that contains the BB SVG
  const bbWrapRef = useRef(null);
  const clkRef = useRef();
  const mouseRef = useRef({ x: 0, y: 0 });
  const undoStackRef = useRef([]);
  const prevClkRef = useRef(new Map());
  const colIdxRef = useRef(0);

  const { W: bbW, H: bbH } = getBBDimensions();

  const COLORS = useMemo(() => [
    "#e63946",
    "#2196f3",
    "#4caf50",
    "#ff9800",
    "#9c27b0",
    "#00bcd4",
    "#ffeb3b",
    "#ff5722",
    "#f48fb1",
    "#80cbc4",
  ], []);

  const wireColRef = useRef(COLORS[0]);
  const recordUndo = useCallback(() => {
    undoStackRef.current.push(structuredClone({
      switches,
      wires,
      placedICs,
      wireCol,
      colIdx,
    }));
    if (undoStackRef.current.length > 50) {
      undoStackRef.current.shift();
    }
  }, [switches, wires, placedICs, wireCol, colIdx]);

  const undoLast = useCallback(() => {
    const prev = undoStackRef.current.pop();
    if (!prev) return;
    setSwitches(prev.switches);
    setWires(prev.wires);
    setPlacedICs(prev.placedICs);
    setWireCol(prev.wireCol);
    setColIdx(prev.colIdx);
    setWireStart(null);
    setPreview(null);
    setDragging(null);
    setDraggingPlaced(null);
  }, []);

  // Clock
  useEffect(() => {
    clearInterval(clkRef.current);
    if (!clkOn) {
      setClk(0);
      return;
    }
    clkRef.current = setInterval(() => setClk((c) => c ^ 1), 500 / clkHz);
    return () => clearInterval(clkRef.current);
  }, [clkHz, clkOn]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.shiftKey) return;
      if (String(e.key).toLowerCase() !== "z") return;
      const target = e.target;
      const tagName = target?.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      e.preventDefault();
      undoLast();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undoLast]);

  // NEW: close datasheet popup on outside click, Escape, or scroll
  // NEW: auto-clear the "pin already wired" warning after a moment
  useEffect(() => {
    if (!wireWarning) return;
    const t = setTimeout(() => setWireWarning(""), 1800);
    return () => clearTimeout(t);
  }, [wireWarning]);

  // NEW: close datasheet popup on outside click, Escape, or scroll
  useEffect(() => {
    if (!datasheet) return;
    const closeIt = () => setDatasheet(null);
    const onEsc = (e) => { if (e.key === "Escape") closeIt(); };
    window.addEventListener("mousedown", closeIt);
    window.addEventListener("keydown", onEsc);
    window.addEventListener("scroll", closeIt, true);
    return () => {
      window.removeEventListener("mousedown", closeIt);
      window.removeEventListener("keydown", onEsc);
      window.removeEventListener("scroll", closeIt, true);
    };
  }, [datasheet]);

  // Global mouse tracking
  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (dragging)
        setDragging((d) =>
          d ? { ...d, ghostX: e.clientX - 40, ghostY: e.clientY - 25 } : null,
        );

      if (draggingPlaced && bbWrapRef.current) {
        const svg = bbWrapRef.current.querySelector('svg');
        if (svg) {
          const rect = svg.getBoundingClientRect();
          const x = e.clientX - rect.left - draggingPlaced.offsetX;
          const y = e.clientY - rect.top - draggingPlaced.offsetY;
          setPlacedICs((p) =>
            p.map((ic) => (ic.id === draggingPlaced.id ? { ...ic, x, y } : ic))
          );
        }
      }
      // FIX: preview uses SVG-local coords — convert mouse to SVG space
      if (wireStart && bbWrapRef.current) {
        const rect = bbWrapRef.current.getBoundingClientRect();
        setPreview({
          ax: wireStart.ax,
          ay: wireStart.ay,
          bx: e.clientX - rect.left,
          by: e.clientY - rect.top,
          color: wireCol,
        });
      }
    };
    const onUp = (e) => {
      if (!dragging && !draggingPlaced) return;

      if (dragging) {
        const svg = bbWrapRef.current?.querySelector('svg');
        if (svg) {
          const svgRect = svg.getBoundingClientRect();
          const dropX = e.clientX - svgRect.left;
          const dropY = e.clientY - svgRect.top;
          const pinCount = ICS[dragging.icKey].pins;
          const snapped = snapICPosition(dropX, dropY, pinCount, placedICs);
          if (snapped) {
            setPlacedICs((p) => [
              ...p,
              { id: `ic${Date.now()}`, ic: dragging.icKey, x: snapped.x, y: snapped.y, col: snapped.col },
            ]);
          }
          // if snapped is null, no free slot was found — IC is not placed
          // if drop is outside the breadboard rect entirely, IC is simply discarded (not placed)
        }
      }

      if (draggingPlaced) {
        const svg = bbWrapRef.current?.querySelector('svg');
        if (svg) {
          setPlacedICs((p) =>
            p.map((ic) => {
              if (ic.id !== draggingPlaced.id) return ic;
              const pinCount = ICS[draggingPlaced.icKey].pins;
              const snapped = snapICPosition(ic.x, ic.y, pinCount, p, ic.id);
              return snapped ? { ...ic, x: snapped.x, y: snapped.y, col: snapped.col } : ic;
            })
          );
        }
        setDraggingPlaced(null);
      }
      setDragging(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, wireStart, wireCol, draggingPlaced, placedICs]);

  // ── Live netlist (rebuilt whenever wiring/placement changes) ──────
  const netlist = useMemo(() => buildNetlist(wires, placedICs), [wires, placedICs]);

  // NEW: jo bhi placed IC ka VCC pin +rail se aur GND pin -rail se wired
  // NAHI hai, uski id yahan se bahar rahegi — Breadboard isko red badge se dikhayega.
  const poweredIds = useMemo(() => {
    const s = new Set();
    placedICs.forEach((p) => {
      const logic = IC_LOGIC[p.ic];
      if (!logic) return;
      const pin = (n) => `${p.id}_p${n}`;
      const ok = netlist.find(pin(logic.vcc)) === netlist.find("NET_VCC")
        && netlist.find(pin(logic.gnd)) === netlist.find("NET_GND");
      if (ok) s.add(p.id);
    });
    return s;
  }, [netlist, placedICs]);

  // External source pins that actively drive a value into the netlist —
  // everything else on the board is a passive monitor point that only
  // shows a signal once it's actually wired to one of these.
  const sources = useMemo(() => {
    const s = {};
    switches.forEach((v, i) => { s[`swled_${i}`] = v; });
    s["flag_0"] = clk;        // onboard clock generator terminal
    s["flag_1"] = pushBtns[0]; // push-button 1 terminal
    s["flag_2"] = pushBtns[1]; // push-button 2 terminal
    return s;
  }, [switches, clk, pushBtns]);

  // Combinational settle — recomputed every render off current inputs +
  // the latched sequential state. This is the actual "boolean algebra
  // across every node" engine the board was missing.
  const { values: nodeValues, shorts: shortNodes } = useMemo(
    () => evaluateCircuit(netlist, placedICs, sources, icRegs),
    [netlist, placedICs, sources, icRegs],
  );
  // NEW: true the instant any node has two disagreeing drivers, or VCC-GND is shorted
  const hasShortCircuit = shortNodes.size > 0;

  // Clocked (edge-triggered) state update — flip-flops, counter, shift
  // register all latch on a 0->1 transition of their own clock pin, which
  // may come from the onboard clock, a push button, or another gate's
  // output, however it's actually wired.
  useEffect(() => {
    const next = advanceSequential(netlist, placedICs, nodeValues, icRegs, prevClkRef.current);
    if (next) setIcRegs((r) => ({ ...r, ...next }));
  }, [netlist, placedICs, nodeValues, icRegs]);

  // Reads the resolved value of any monitor pin (0 if unconnected/floating).
  const monitor = useCallback((ref) => readNode(netlist, nodeValues, ref), [netlist, nodeValues]);

  // 7-segment + DEC/HEX/OCT readout now reflects whatever is actually
  // wired onto the D0-D7 data-bus monitor pins — not the raw switches.
  const dec = [0, 1, 2, 3, 4, 5, 6, 7].reduce((a, i) => a + monitor(`databus_${i}`) * (1 << i), 0);

  // FIX: onHoleClick receives SVG-local coords (cx,cy from the SVG).
  // We store them as-is — no page-coord conversion needed.
  // NEW: single-pin restriction — a hole that isn't a generic breadboard
  // body strip hole (IC pins, rail terminals, external monitor terminals)
  // may only carry ONE wire, matching how a real leg/terminal only fits
  // one wire end. Regular `bb_${col}_${row}` body holes are exempt since
  // several holes in the same 5-hole strip are already electrically the
  // same node and real breadboards allow multiple wires per strip.
  const isSingleWireHole = useCallback((id) => true, []);
  const isHoleOccupied = useCallback(
    (id) => isSingleWireHole(id) && wires.some((w) => w.from === id || w.to === id),
    [wires, isSingleWireHole],
  );

  const onHoleClick = useCallback(
    (id, svgX, svgY) => {
      if (mode === "delete") {
        recordUndo();
        setWires((p) => p.filter((w) => w.from !== id && w.to !== id));
        return;
      }
      if (mode !== "wire") return;

      if (!wireStart) {
        if (isHoleOccupied(id)) {
          setWireWarning(`Pin already wired: ${id}`);
          return;
        }
        setWireStart({ id, ax: svgX, ay: svgY });
      } else {
        if (wireStart.id !== id) {
          if (isHoleOccupied(id)) {
            setWireWarning(`Pin already wired: ${id}`);
            setWireStart(null);
            setPreview(null);
            return;
          }
          recordUndo();
          const currentCol = wireColRef.current;
          setWires((p) => [
            ...p,
            {
              id: Date.now(),
              from: wireStart.id,
              to: id,
              ax: wireStart.ax,
              ay: wireStart.ay,
              bx: svgX,
              by: svgY,
              color: currentCol,
            },
          ]);
          const ni = (colIdxRef.current + 1) % COLORS.length;
          colIdxRef.current = ni;
          wireColRef.current = COLORS[ni];
          setColIdx(ni);
          setWireCol(COLORS[ni]);
        }
        setWireStart(null);
        setPreview(null);
      }
    },
    [mode, wireStart, COLORS, recordUndo, isHoleOccupied],
  );

  const startTrayDrag = (e, icKey) => {
    if (e.button !== 0) return; // right-click yahan bhi ignore — sirf left-click drag ke liye

    e.preventDefault();
    setDragging({ icKey, ghostX: e.clientX - 40, ghostY: e.clientY - 25 });
  };

  // NEW: DELETE mode mein IC pe click karne se sirf wo IC hat jaye
  const handleICDelete = useCallback((id) => {
    recordUndo();
    setPlacedICs((p) => p.filter((ic) => ic.id !== id));
  }, [recordUndo]);

  const handleICMouseDown = (id, icKey, clientX, clientY) => {
    const ic = placedICs.find((p) => p.id === id);
    if (!ic || !bbWrapRef.current) return;
    recordUndo();
    const rect = bbWrapRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left - ic.x;
    const offsetY = clientY - rect.top - ic.y;
    setDraggingPlaced({ id, icKey, offsetX, offsetY });
  };

  const handleExternalPinDown = (id, e) => {
    e.stopPropagation();
    if (!bbWrapRef.current) return;
    const rect = bbWrapRef.current.getBoundingClientRect();
    onHoleClick(id, e.clientX - rect.left, e.clientY - rect.top);
  };

  // NEW: right-click on a placed IC (breadboard) opens its datasheet popup
  const handleICContextMenu = useCallback((icKey, clientX, clientY) => {
    setDatasheet({ icKey, x: clientX, y: clientY });
  }, []);

  // NEW: right-click on a tray IC (not yet placed) opens its datasheet popup too
  const handleTrayContextMenu = useCallback((clientX, clientY, icKey) => {
    setDatasheet({ icKey, x: clientX, y: clientY });
  }, []);

  // ── Save circuit ───────────────────────────────────────────────────
  // Not logged in -> send them to /login instead of silently failing or
  // saving nowhere. Logged in -> persist the full board state (wires,
  // placed ICs, switches, clock settings) to the backend under their account.
  const saveCircuit = useCallback(async () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setSaveState({ status: "error", message: "Please log in to save your circuit." });
      navigate("/login", { state: { from: "/trainer-board" } });
      return;
    }
    setSaveState({ status: "saving", message: "Saving…" });
    try {
      await trainerBoardService.saveCircuit({
        name: circuitName || "Untitled Circuit",
        wires,
        placedICs,
        switches,
        clkHz,
        clkOn,
      });
      setSaveState({ status: "saved", message: "Saved ✓" });
      setTimeout(() => setSaveState((s) => (s.status === "saved" ? { status: "idle", message: "" } : s)), 2500);
    } catch (err) {
      setSaveState({ status: "error", message: err?.message || "Save failed. Try again." });
    }
  }, [authLoading, isAuthenticated, navigate, circuitName, wires, placedICs, switches, clkHz, clkOn]);

  const F = "monospace";

  const pulseClock = useCallback(() => {
    // Toggle the clock once, creating one 0→1 and one 1→0 edge
    setClk((c) => c ^ 1);
    // Revert after 60 ms – gives the simulation time to register the edge
    const timer = setTimeout(() => setClk((c) => c ^ 1), 60);
    // Cleanup not strictly needed, but good practice if component unmounts
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`boolforge-page theme-${theme}`} style={{ background: '#1a1a1a' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
        .clk-blink{animation:blink .5s infinite;}
        .short-blink{animation:blink .3s infinite;}
      `}</style>
      <Navbar toggleTheme={toggleTheme} theme={theme} />

      <div
        className="trainer-page-container"
        style={{
          fontFamily: F,
          background: "radial-gradient(ellipse at 40% 40%,#3a3a3a,#141414)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: 18,
          userSelect: "none",
        }}
        onMouseLeave={() => {
          setWireStart(null);
          setPreview(null);
        }}
      >
        {/* ── OUTER CHASSIS ── */}
        <div
          className="trainer-outer-chassis"
          style={{
            position: "relative",
            borderRadius: "18px 18px 8px 8px",
            background:
              "linear-gradient(160deg,#e8e8e8,#c0c0c0 40%,#a8a8a8 70%,#909090)",
            padding: "16px 16px 0",
            boxShadow:
              "0 50px 90px rgba(0,0,0,.9),0 10px 20px rgba(0,0,0,.5),inset 0 3px 6px rgba(255,255,255,.5)",
            maxWidth: 1280,
            width: "100%",
          }}
        >
          {/* Right wall */}
          <div
            className="trainer-side-wall"
            style={{
              position: "absolute",
              top: 16,
              bottom: 0,
              right: -15,
              width: 15,
              background: "linear-gradient(90deg,#aaa,#666)",
              borderRadius: "0 8px 8px 0",
            }}
          />
          {/* Bottom */}
          <div
            style={{
              position: "absolute",
              bottom: -24,
              left: 8,
              right: 8,
              height: 24,
              background: "linear-gradient(180deg,#888,#505050)",
              borderRadius: "0 0 12px 12px",
              boxShadow: "0 8px 20px rgba(0,0,0,.8)",
            }}
          />

          {/* ── PCB ── */}
          <div
            style={{
              borderRadius: 8,
              padding: 10,
              position: "relative",
              overflow: "hidden",
              background: "#0e2412",
              backgroundImage:
                "radial-gradient(ellipse 55% 35% at 20% 20%,#1b5430,transparent),radial-gradient(ellipse 55% 35% at 80% 80%,#17422a,transparent)",
            }}
          >
            {/* PCB grid */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                backgroundImage:
                  "repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(210,165,60,.04) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(210,165,60,.04) 20px)",
              }}
            />

            {/* ════ HEADER ════ */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(90deg,#04101e,#0b1e40,#04101e)",
                border: "1px solid #1a3470",
                borderRadius: 6,
                padding: "7px 16px",
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontSize: 32,
                    color: "#3a8fff",
                    filter: "drop-shadow(0 0 10px #3a8fff)",
                    lineHeight: 1,
                  }}
                >
                  ∞
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: "'Orbitron',monospace",
                      fontSize: 17,
                      fontWeight: 900,
                      color: "#d0e8ff",
                      letterSpacing: 3,
                    }}
                  >
                    INFINIT
                  </div>
                  <div
                    style={{
                      fontFamily: "'Orbitron',monospace",
                      fontSize: 7,
                      color: "#5575aa",
                      letterSpacing: 2,
                    }}
                  >
                    Technologies
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 18,
                    color: "#ffcc44",
                    letterSpacing: 6,
                    textShadow: "0 0 12px #ffcc4466",
                  }}
                >
                  IT-300
                </div>
                <div
                  style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 8,
                    color: "#8aaacf",
                    letterSpacing: 2,
                  }}
                >
                  DIGITAL LOGIC TRAINING SYSTEM
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {[
                  ["+5V", "#ff2200"],
                  ["+15V", "#00ff44"],
                  ["-15V", "#ffcc00"],
                ].map(([lbl, c]) => (
                  <div key={lbl} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: 10,
                        height: 20,
                        borderRadius: "5px 5px 3px 3px",
                        margin: "0 auto 3px",
                        background: c,
                        boxShadow: `0 0 10px ${c}88`,
                      }}
                    />
                    <div style={{ fontSize: 6, color: c, fontFamily: F }}>
                      {lbl}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ════ TOOLBAR ════ */}
            <div
              style={{
                display: "flex",
                gap: 5,
                marginBottom: 7,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {[
                ["wire", "⚡ WIRE"],
                ["delete", "✂ DELETE"],
              ].map(([m, lbl]) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    background: mode === m ? "#0e2436" : "#050d14",
                    color: mode === m ? "#4fc3f7" : "#3a5566",
                    border: `1px solid ${mode === m ? "#4fc3f7" : "#1e3344"}`,
                    borderRadius: 3,
                    padding: "3px 10px",
                    cursor: "pointer",
                    fontSize: 9,
                    fontFamily: F,
                    letterSpacing: 1,
                  }}
                >
                  {lbl}
                </button>
              ))}
              {mode === "wire" && (
                <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                  <span style={{ fontSize: 7, color: "#446" }}>wire:</span>
                  {COLORS.map((c, i) => (
                    <div
                      key={c}
                      onClick={() => {
                        setWireCol(c);
                        setColIdx(i);
                        wireColRef.current = c;
                        colIdxRef.current = i;
                      }}
                      style={{
                        width: 13,
                        height: 13,
                        borderRadius: "50%",
                        background: c,
                        cursor: "pointer",
                        border:
                          wireCol === c
                            ? "2px solid #fff"
                            : "2px solid transparent",
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
              )}
              {wireStart && (
                <div style={{ fontSize: 8, color: "#4fc3f7", fontFamily: F }}>
                  ● from <b style={{ color: "#fff" }}>{wireStart.id}</b> → click
                  dest hole &nbsp;
                  <span
                    style={{ cursor: "pointer", color: "#f66" }}
                    onClick={() => {
                      setWireStart(null);
                      setPreview(null);
                    }}
                  >
                    ✕
                  </span>
                </div>
              )}

              {/* NEW: "pin already wired" warning */}
              {wireWarning && (
                <div
                  style={{
                    fontSize: 8,
                    color: "#ffcc00",
                    fontFamily: F,
                    background: "#2a1e00",
                    border: "1px solid #ffcc00",
                    borderRadius: 3,
                    padding: "2px 7px",
                  }}
                >
                  ⚠ {wireWarning}
                </div>
              )}
              {/* NEW: short-circuit warning banner */}
              {hasShortCircuit && (
                <div
                  className="short-blink"
                  style={{
                    fontSize: 9,
                    color: "#ff2222",
                    fontFamily: F,
                    fontWeight: "bold",
                    background: "#2a0000",
                    border: "1px solid #ff2222",
                    borderRadius: 3,
                    padding: "3px 8px",
                  }}
                >
                  ⚠ SHORT CIRCUIT DETECTED ({shortNodes.size})
                </div>
              )}
              <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>

                <button
                  onClick={() => {
                    recordUndo();
                    setWires([]);
                    setWireStart(null);
                    setPreview(null);
                  }}
                  style={{
                    background: "#1e0808",
                    color: "#f44",
                    border: "1px solid #f44",
                    borderRadius: 3,
                    padding: "3px 9px",
                    cursor: "pointer",
                    fontSize: 9,
                    fontFamily: F,
                  }}
                >
                  🗑 Wires
                </button>
                <button
                  onClick={() => {
                    recordUndo();
                    setPlacedICs([]);
                  }}
                  style={{
                    background: "#16081e",
                    color: "#b44fff",
                    border: "1px solid #b44fff",
                    borderRadius: 3,
                    padding: "3px 9px",
                    cursor: "pointer",
                    fontSize: 9,
                    fontFamily: F,
                  }}
                >
                  ✕ ICs
                </button>
                <input
                  value={circuitName}
                  onChange={(e) => setCircuitName(e.target.value)}
                  placeholder="Circuit name"
                  style={{
                    background: "#050d14",
                    color: "#cde",
                    border: "1px solid #1e3344",
                    borderRadius: 3,
                    padding: "3px 7px",
                    fontSize: 9,
                    fontFamily: F,
                    width: 110,
                  }}
                />
                <button
                  onClick={saveCircuit}
                  disabled={saveState.status === "saving"}
                  title={isAuthenticated ? "Save this circuit to your account" : "Log in to save your circuit"}
                  style={{
                    background: "#08221e",
                    color: "#2ee6a8",
                    border: "1px solid #2ee6a8",
                    borderRadius: 3,
                    padding: "3px 10px",
                    cursor: saveState.status === "saving" ? "wait" : "pointer",
                    fontSize: 9,
                    fontFamily: F,
                    opacity: saveState.status === "saving" ? 0.6 : 1,
                  }}
                >
                  {isAuthenticated ? "💾 SAVE" : "🔒 LOGIN TO SAVE"}
                </button>
                {saveState.message && (
                  <span
                    style={{
                      fontSize: 8,
                      fontFamily: F,
                      color: saveState.status === "error" ? "#f66" : "#2ee6a8",
                    }}
                  >
                    {saveState.message}
                  </span>
                )}
              </div>
            </div>

            {/* ════ MAIN 3-COLUMN LAYOUT ════ */}
            {/* FIX: correct column order — left panel | center breadboard | right panel */}
            <div className="trainer-grid">
              {/* ── LEFT PANEL ── */}
              <div>
                {/* 4-digit 7-seg */}
                <Sec title="7-Segment Display">
                  <div
                    style={{
                      display: "flex",
                      gap: 3,
                      justifyContent: "center",
                      background: "#050200",
                      padding: 7,
                      borderRadius: 5,
                      border: "1px solid #1a0a00",
                    }}
                  >
                    {[
                      Math.floor(dec / 1000) % 10,
                      Math.floor(dec / 100) % 10,
                      Math.floor(dec / 10) % 10,
                      dec % 10,
                    ].map((v, i) => (
                      <Seg7 key={i} val={v} h={44} />
                    ))}
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 7,
                      color: "#666",
                      marginTop: 4,
                      fontFamily: F,
                    }}
                  >
                    {String(dec).padStart(4, "0")} · 0x
                    {dec.toString(16).toUpperCase().padStart(2, "0")} ·{" "}
                    {dec.toString(2).padStart(8, "0")}b
                  </div>
                </Sec>

                {/* Clock */}
                <Sec title="Clock Generator">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 5,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        background: "#000",
                        border: "1px solid #181818",
                        borderRadius: 3,
                        padding: "3px 8px",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          color: clkOn && clk ? "#ff8800" : "#332",
                          fontFamily: F,
                        }}
                      >
                        {clkHz}Hz
                      </span>
                      <div
                        className={clkOn && clk ? "clk-blink" : ""}
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          marginLeft: "auto",
                          background: clkOn && clk ? "#ff8800" : "#1a1a1a",
                          boxShadow: clkOn && clk ? "0 0 8px #ff8800" : "none",
                          border: "1px solid #333",
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={64}
                    value={clkHz}
                    onChange={(e) => setClkHz(+e.target.value)}
                    style={{
                      width: "100%",
                      accentColor: "#ff8800",
                      marginBottom: 5,
                      cursor: "pointer",
                    }}
                  />
                  <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                    {[1, 4, 16, 64].map((hz) => (
                      <button
                        key={hz}
                        onClick={() => setClkHz(hz)}
                        style={{
                          flex: 1,
                          background: clkHz === hz ? "#2a1800" : "#0a0a0a",
                          color: clkHz === hz ? "#ff8800" : "#443322",
                          border: `1px solid ${clkHz === hz ? "#ff8800" : "#221100"}`,
                          borderRadius: 3,
                          padding: "2px 0",
                          fontSize: 7,
                          fontFamily: F,
                          cursor: "pointer",
                        }}
                      >
                        {hz}Hz
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setClkOn((v) => !v)}
                    style={{
                      width: "100%",
                      background: clkOn ? "#0f300f" : "#300f0f",
                      color: clkOn ? "#00ee44" : "#ff4444",
                      border: `1px solid ${clkOn ? "#00ee44" : "#ff4444"}`,
                      borderRadius: 4,
                      padding: "5px 0",
                      fontSize: 9,
                      fontFamily: F,
                      cursor: "pointer",
                    }}
                  >
                    {clkOn ? "● CLK ON" : "○ CLK OFF"}
                  </button>
                  <button
                    onClick={pulseClock}
                    style={{
                      width: '100%',
                      background: '#1a1a00',
                      color: '#ffcc00',
                      border: '1px solid #ffcc00',
                      borderRadius: 4,
                      padding: '5px 0',
                      fontSize: 9,
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      marginTop: 4,
                    }}
                  >
                    ⚡ SINGLE PULSE
                  </button>
                </Sec>

                {/* Push switches */}
                <Sec title="Push Switches">
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      justifyContent: "center",
                    }}
                  >
                    {[0, 1].map((i) => (
                      <div key={i} style={{ textAlign: "center" }}>
                        <button
                          onMouseDown={() =>
                            setPush((p) => {
                              const n = [...p];
                              n[i] = 1;
                              return n;
                            })
                          }
                          onMouseUp={() =>
                            setPush((p) => {
                              const n = [...p];
                              n[i] = 0;
                              return n;
                            })
                          }
                          onMouseLeave={() =>
                            setPush((p) => {
                              const n = [...p];
                              n[i] = 0;
                              return n;
                            })
                          }
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: pushBtns[i] ? "#bb3300" : "#2a1000",
                            border: "3px solid #886644",
                            cursor: "pointer",
                            boxShadow: pushBtns[i]
                              ? "inset 0 2px 4px rgba(0,0,0,.5)"
                              : "0 4px 0 #000",
                            transform: pushBtns[i] ? "translateY(3px)" : "none",
                            transition: "transform .07s,box-shadow .07s",
                            color: "#ffaa44",
                            fontSize: 9,
                            fontFamily: F,
                          }}
                        >
                          S{i + 1}
                        </button>
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            justifyContent: "center",
                            marginTop: 4,
                          }}
                        >
                          <LED on={!!pushBtns[i]} c="Y" />
                          <span
                            style={{
                              fontSize: 6,
                              color: "#777",
                              fontFamily: F,
                            }}
                          >
                            Q
                          </span>
                          <LED on={!pushBtns[i]} c="G" />
                          <span
                            style={{
                              fontSize: 6,
                              color: "#777",
                              fontFamily: F,
                            }}
                          >
                            Q̄
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Sec>

                {/* Logic Probe */}
                <Sec title="Logic Probe">
                  {[
                    ["HI", clk === 1, "G"],
                    ["LO", clk === 0, "R"],
                    ["PULSE", clkOn, "Y"],
                    ["HI-Z", false, "B"],
                  ].map(([lbl, on, c]) => (
                    <div
                      key={lbl}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 5,
                      }}
                    >
                      <LED on={on} c={c} size={11} />
                      <span
                        style={{ fontSize: 8, color: "#aaa", fontFamily: F }}
                      >
                        {lbl}
                      </span>
                    </div>
                  ))}
                </Sec>

                {/* Potentiometers */}
                <Sec title="Potentiometers">
                  <div
                    style={{ display: "flex", justifyContent: "space-around" }}
                  >
                    {[
                      ["1K", 110],
                      ["10K", 200],
                    ].map(([lbl, angle]) => (
                      <div key={lbl} style={{ textAlign: "center" }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            margin: "0 auto 4px",
                            background:
                              "radial-gradient(circle at 36% 34%,#999,#2a2a2a)",
                            border: "2px solid #555",
                            position: "relative",
                            cursor: "pointer",
                            boxShadow: "0 4px 10px rgba(0,0,0,.8)",
                            transform: `rotate(${angle}deg)`,
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: 3,
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: 3,
                              height: 11,
                              background: "#e0e0e0",
                              borderRadius: 2,
                            }}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: 7,
                            color: "#d4a843",
                            fontFamily: F,
                          }}
                        >
                          {lbl}
                        </div>
                      </div>
                    ))}
                  </div>
                </Sec>
              </div>

              {/* ── CENTER (BREADBOARD) ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Sec title="Solderless Breadboard — 2×30 columns × 10 rows + 4 power rails" style={{ overflow: "visible" }}>
                  <div className="breadboard-scroll-wrapper" style={{ overflow: "visible" }}>
                    {/* FIX: bbWrapRef attached here — this is the coordinate origin for all wires */}
                    <div
                      ref={bbWrapRef}
                      style={{ position: "relative", display: "inline-block", minWidth: `${bbW}px`, overflow: "visible", zIndex: 1 }}
                    >
                      <Breadboard
                        wireStart={wireStart}
                        wires={wires}
                        placedICs={placedICs}
                        onHoleClick={onHoleClick}
                        onICMouseDown={handleICMouseDown}

                        onICContextMenu={handleICContextMenu}
                        mode={mode}
                        onICDelete={handleICDelete}
                        poweredIds={poweredIds}
                      />
                      {/* FIX: WireOverlay uses SVG-local coords — rendered over the SVG */}
                      <WireOverlay
                        wires={wires}
                        preview={preview}
                        width={bbW}
                        height={bbH}
                        onWireClick={(wireId) => {
                          recordUndo();
                          setWires((p) => p.filter((w) => w.id !== wireId));
                        }}
                      />
                    </div>
                  </div>
                </Sec>

                {/* 8-bit switches */}
                <Sec title="Logic Input Switches  A – H  (8-bit)">
                  <div
                    style={{
                      display: "flex",
                      gap: 5,
                      justifyContent: "center",
                    }}
                  >
                    {switches.map((v, i) => (
                      <ToggleSW
                        key={i}
                        label={String.fromCharCode(65 + i)}
                        val={v}
                        onToggle={() => {
                          recordUndo();
                          setSwitches((p) => {
                            const n = [...p];
                            n[i] ^= 1;
                            return n;
                          });
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 5,
                      justifyContent: "center",
                      marginTop: 5,
                    }}
                  >
                    {switches.map((v, i) => (
                      <div
                        key={i}
                        onMouseDown={(e) => handleExternalPinDown(`swled_${i}`, e)}
                        style={{ cursor: "crosshair" }}
                      >
                        <LED on={!!v} c="G" />
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      fontFamily: F,
                      fontSize: 16,
                      color: "#00ee44",
                      background: "#000",
                      padding: "5px 10px",
                      borderRadius: 3,
                      textAlign: "center",
                      letterSpacing: 4,
                      border: "1px solid #0a1a0a",
                      marginTop: 5,
                    }}
                  >
                    {switches.slice().reverse().join("")}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      marginTop: 4,
                      fontSize: 9,
                      color: "#5a7a5a",
                      fontFamily: F,
                    }}
                  >
                    <span>DEC: {dec}</span>
                    <span>
                      HEX: 0x{dec.toString(16).toUpperCase().padStart(2, "0")}
                    </span>
                    <span>OCT: {dec.toString(8).padStart(3, "0")}</span>
                  </div>
                </Sec>

                {/* IC Tray */}
                <Sec title="IC Component Tray — drag onto breadboard">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {Object.keys(ICS).map((k) => (
                      <TrayIC key={k} icKey={k} onMouseDown={startTrayDrag} onContextMenu={handleTrayContextMenu} />
                    ))}
                  </div>
                  <div
                    style={{
                      fontSize: 7,
                      color: "#334",
                      fontFamily: F,
                      marginTop: 5,
                      textAlign: "center",
                    }}
                  >
                    Hold + drag IC chip → release over breadboard to place
                  </div>
                </Sec>
              </div>

              {/* ── RIGHT PANEL ── */}
              <div>
                {/* State monitors */}
                <Sec title="State Monitors (8)">
                  <div
                    style={{
                      fontSize: 6,
                      color: "#f44",
                      marginBottom: 3,
                      letterSpacing: 1,
                      fontFamily: F,
                    }}
                  >
                    DATA BUS D0–D7
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: 4,
                      marginBottom: 7,
                    }}
                  >
                    {switches.map((_, i) => (
                      <div
                        key={i}
                        style={{ textAlign: "center", cursor: "crosshair" }}
                        onMouseDown={(e) => handleExternalPinDown(`databus_${i}`, e)}
                      >
                        <LED on={!!monitor(`databus_${i}`)} c="R" size={11} />
                        <div
                          style={{
                            fontSize: 6,
                            color: "#888",
                            fontFamily: F,
                            marginTop: 1,
                          }}
                        >
                          D{i}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      fontSize: 6,
                      color: "#4e4",
                      marginBottom: 3,
                      letterSpacing: 1,
                      fontFamily: F,
                    }}
                  >
                    LOGIC OUT Y0–Y7
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: 4,
                      marginBottom: 7,
                    }}
                  >
                    {switches.map((_, i) => (
                      <div
                        key={i}
                        style={{ textAlign: "center", cursor: "crosshair" }}
                        onMouseDown={(e) => handleExternalPinDown(`logicout_${i}`, e)}
                      >
                        <LED on={!!monitor(`logicout_${i}`)} c="G" size={11} />
                        <div
                          style={{
                            fontSize: 6,
                            color: "#888",
                            fontFamily: F,
                            marginTop: 1,
                          }}
                        >
                          Y{i}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      fontSize: 6,
                      color: "#fc0",
                      marginBottom: 3,
                      letterSpacing: 1,
                      fontFamily: F,
                    }}
                  >
                    FLAGS
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: 4,
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div
                        key={i}
                        style={{ textAlign: "center", cursor: "crosshair" }}
                        onMouseDown={(e) => handleExternalPinDown(`flag_${i}`, e)}
                      >
                        <LED on={!!(i === 7 ? dec > 127 : monitor(`flag_${i}`))} c="Y" size={11} />
                        <div
                          style={{
                            fontSize: 5,
                            color: "#888",
                            fontFamily: F,
                            marginTop: 1,
                          }}
                        >
                          {["CK", "P1", "P2", "—", "—", "—", "—", "OV"][i]}
                        </div>
                      </div>
                    ))}
                  </div>
                </Sec>

                {/* Complement outputs */}
                <Sec title="Q / Q̄ Outputs">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        marginBottom: 5,
                        cursor: "crosshair",
                      }}
                      onMouseDown={(e) => handleExternalPinDown(`qbar_${i}`, e)}
                    >
                      <span
                        style={{
                          fontSize: 8,
                          color: "#d4a843",
                          fontFamily: F,
                          width: 14,
                        }}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <LED on={!!monitor(`qbar_${i}`)} c="G" />
                      <span
                        style={{ fontSize: 6, color: "#666", fontFamily: F }}
                      >
                        Q
                      </span>
                      <div style={{ flex: 1 }} />
                      <LED on={!monitor(`qbar_${i}`)} c="R" />
                      <span
                        style={{ fontSize: 6, color: "#666", fontFamily: F }}
                      >
                        Q̄
                      </span>
                    </div>
                  ))}
                </Sec>

                {/* I/O Terminals */}
                <Sec title="I/O Terminals">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 4,
                    }}
                  >
                    {[
                      "VCC",
                      "GND",
                      "+5V",
                      "-5V",
                      "+15V",
                      "-15V",
                      "CLK",
                      "CLK̄",
                    ].map((lbl) => (
                      <div
                        key={lbl}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 2,
                            flexShrink: 0,
                            background: "linear-gradient(135deg,#aaa,#555)",
                            border: "1px solid #333",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%,-50%)",
                              width: 7,
                              height: 1.5,
                              background: "#222",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%,-50%)",
                              width: 1.5,
                              height: 7,
                              background: "#222",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 6.5,
                            color: "#999",
                            fontFamily: F,
                          }}
                        >
                          {lbl}
                        </span>
                      </div>
                    ))}
                  </div>
                </Sec>

                {/* Board info */}
                <Sec title="Board Info">
                  <div
                    style={{
                      fontSize: 7,
                      color: "#446",
                      lineHeight: 2,
                      fontFamily: F,
                    }}
                  >
                    <div>
                      Wires:{" "}
                      <span style={{ color: "#6699ff" }}>{wires.length}</span>
                    </div>
                    <div>
                      ICs on board:{" "}
                      <span style={{ color: "#bb44ff" }}>
                        {placedICs.length}
                      </span>
                    </div>
                    <div>
                      Rail +: <span style={{ color: "#f44" }}>+5V DC</span>
                    </div>
                    <div>
                      Rail −: <span style={{ color: "#66f" }}>GND</span>
                    </div>
                    <div>
                      Clock:{" "}
                      <span style={{ color: "#ff8800" }}>
                        {clkOn ? `${clkHz}Hz` : "OFF"}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 6,
                      color: "#2a3a2a",
                      lineHeight: 1.8,
                      fontFamily: F,
                    }}
                  >
                    1. Click WIRE mode
                    <br />
                    2. Click hole → click hole
                    <br />
                    3. Drag IC from tray below
                    <br />
                    4. Release over breadboard
                  </div>
                </Sec>
              </div>
            </div>

            {/* ════ STATUS BAR ════ */}
            <div
              style={{
                marginTop: 8,
                padding: "5px 12px",
                background: "linear-gradient(90deg,#030b18,#060e22,#030b18)",
                border: "1px solid #0c1c36",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 8,
                color: "#2a5a7a",
                fontFamily: F,
              }}
            >
              <span style={{ color: "#ff8800" }}>
                CLK {clkOn ? `${clkHz}Hz` : "OFF"}{" "}
                {clkOn ? (clk ? "▐█" : "░░") : ""}
              </span>
              <span style={{ color: "#334" }}>|</span>
              <span>
                SW:{" "}
                <span style={{ color: "#00ee44" }}>
                  {switches.slice().reverse().join("")}b
                </span>{" "}
                ={dec}
              </span>
              <span style={{ color: "#334" }}>|</span>
              <span>
                WIRES:<span style={{ color: "#6699ff" }}> {wires.length}</span>
              </span>
              <span style={{ color: "#334" }}>|</span>
              <span>
                ICs:
                <span style={{ color: "#bb44ff" }}> {placedICs.length}</span>
              </span>
              <span style={{ color: "#334" }}>|</span>
              <span>
                MODE:
                <span style={{ color: "#88bbdd" }}> {mode.toUpperCase()}</span>
              </span>
              {/* NEW: short-circuit status */}
              <span style={{ color: "#334" }}>|</span>
              <span className={hasShortCircuit ? "short-blink" : ""}>
                SHORT:
                <span style={{ color: hasShortCircuit ? "#ff2222" : "#2a5a2a" }}>
                  {" "}{hasShortCircuit ? `⚠ ${shortNodes.size}` : "OK"}
                </span>
              </span>
              <span style={{ marginLeft: "auto", color: "#14243a" }}>
                ∞ INFINIT TECHNOLOGIES · IT-300 DIGITAL LOGIC TRAINING SYSTEM
              </span>
            </div>
          </div>
        </div>

        {/* ── DRAG GHOST ── */}
        {dragging && (
          <div
            style={{
              position: "fixed",
              left: dragging.ghostX,
              top: dragging.ghostY,
              pointerEvents: "none",
              zIndex: 9999,
              opacity: 0.88,
              transform: "rotate(-4deg) scale(1.05)",
              filter: "drop-shadow(0 6px 16px rgba(0,0,0,.9))",
            }}
          >
            <div
              style={{
                background: `linear-gradient(160deg,${ICS[dragging.icKey].bg},#080808)`,
                border: "2px solid #888",
                borderRadius: 4,
                padding: "5px 10px",
                minWidth: 60,
              }}
            >
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  fontWeight: "bold",
                  color: ICS[dragging.icKey].txt,
                  textAlign: "center",
                  letterSpacing: 1,
                }}
              >
                {dragging.icKey}
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 13,
                  color: ICS[dragging.icKey].txt,
                  textAlign: "center",
                }}
              >
                {ICS[dragging.icKey].sym}
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 6,
                  color: "#aaa",
                  textAlign: "center",
                  marginTop: 1,
                }}
              >
                {ICS[dragging.icKey].name}
              </div>
            </div>
          </div>
        )}
        {/* NEW: datasheet popup, rendered above everything else */}
        {datasheet && (
          <DatasheetPopup
            icKey={datasheet.icKey}
            x={datasheet.x}
            y={datasheet.y}
            onClose={() => setDatasheet(null)}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
