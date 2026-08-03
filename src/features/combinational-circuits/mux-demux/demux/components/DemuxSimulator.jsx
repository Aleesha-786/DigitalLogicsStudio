/**
 * DemuxSimulator.jsx — Interactive DEMUX simulator.
 *
 * Lets the user toggle D input and select lines, then watches the outputs
 * update in real time.
 *
 * Props:
 *   config      : object — one entry from DEMUX_TYPES
 *   dVal        : number (0|1)
 *   setDVal     : fn
 *   selVals     : number[]
 *   setSelVals  : fn
 */
import React, { useState, useMemo } from "react";
import { COLORS, bitIndicatorStyle } from "../../shared/theme.js";
import TruthTable from "../../shared/components/TruthTable.jsx";

// ─── Toggle button ─────────────────────────────────────────────────────────────
const InputToggle = ({ label, isActive, onClick, activeColor }) => (
  <button
    onClick={onClick}
    style={{
      width: "100%", padding: "9px 14px", borderRadius: "9px",
      border: `2px solid ${isActive ? activeColor : COLORS.indigoMuted}`,
      background: isActive ? `${activeColor}1a` : COLORS.inputBg,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      cursor: "pointer", marginBottom: "7px", transition: "all 0.2s",
    }}
  >
    <span style={{ color: isActive ? activeColor : COLORS.textMuted, fontFamily: "monospace", fontWeight: "700" }}>
      {label}
    </span>
    <span style={bitIndicatorStyle(isActive, activeColor)}>
      {isActive ? "1" : "0"}
    </span>
  </button>
);

// ─── Expandable equation ───────────────────────────────────────────────────────
const EquationRow = ({ eq, isExpanded, onToggle }) => (
  <div style={{ borderRadius: "14px", border: `1px solid ${eq.color}40`, background: COLORS.glassBg, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", marginBottom: "10px", overflow: "hidden" }}>
    <div style={{ width: "100%", padding: "13px 16px", background: isExpanded ? `${eq.color}15` : "transparent", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={onToggle}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ color: eq.color, fontFamily: "monospace", fontWeight: "800", fontSize: "0.85rem" }}>{eq.out}</span>
        <code style={{ color: COLORS.textPrimary, fontFamily: "monospace", fontSize: "0.85rem", opacity: 0.9 }}>{eq.eq}</code>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(eq.eq); alert("Copied!"); }}
          style={{ padding: "2px 8px", fontSize: "0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: COLORS.textSecondary, borderRadius: "4px", cursor: "pointer", fontWeight: "700" }}>📋 COPY</button>
        <span style={{ color: COLORS.textMuted, fontSize: "0.8rem" }}>{isExpanded ? "▲" : "▼"}</span>
      </div>
    </div>
    {isExpanded && (
      <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${eq.color}20` }}>
        <p style={{ color: COLORS.textSecondary, fontSize: "0.88rem", lineHeight: "1.7", margin: "16px 0" }}>{eq.explanation}</p>
        <div style={{ padding: "12px 16px", background: `${eq.color}15`, border: `1px solid ${eq.color}40`, borderRadius: "10px" }}>
          <span style={{ color: eq.color, fontSize: "0.78rem", fontWeight: "800" }}>🎯 MEMORY TRICK: </span>
          <span style={{ color: COLORS.textPrimary, fontSize: "0.83rem", opacity: 0.9 }}>{eq.trick}</span>
        </div>
      </div>
    )}
  </div>
);

// ─── Main ──────────────────────────────────────────────────────────────────────
const DemuxSimulator = ({ config, dVal, setDVal, selVals, setSelVals }) => {
  const [expandedEq, setExpandedEq] = useState(null);

  const activeSelVals = selVals.slice(0, config.selectInputs.length);

  const result = useMemo(
    () => config.demux(dVal, activeSelVals),
    [config, dVal, activeSelVals],
  );

  const toggleSel = (idx) => {
    const next = [...selVals]; next[idx] ^= 1; setSelVals(next);
  };
  const resetAll = () => { setDVal(0); setSelVals(Array(3).fill(0)); };

  const selDecimal = activeSelVals.reduce((acc, b, i) => acc + (b << (activeSelVals.length - 1 - i)), 0);

  return (
    <div>
      {/* Top grid: D + selects | outputs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>

        {/* Left: D input + select lines */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4 style={{ color: COLORS.blue, margin: 0, fontSize: "0.9rem" }}>📥 Inputs</h4>
            <button onClick={resetAll} style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(148,163,184,0.2)", background: "transparent", color: COLORS.textMuted, cursor: "pointer", fontSize: "0.75rem" }}>Reset</button>
          </div>

          {/* D input */}
          <InputToggle label={`D (data input)`} isActive={!!dVal} onClick={() => setDVal((v) => v ^ 1)} activeColor={COLORS.high} />

          <div style={{ marginTop: "14px", marginBottom: "10px", color: COLORS.textSecondary, fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.05em" }}>SELECT LINES</div>

          {config.selectInputs.map((name, idx) => (
            <InputToggle key={name} label={name} isActive={!!activeSelVals[idx]} onClick={() => toggleSel(idx)} activeColor={COLORS.warn} />
          ))}

          {/* Select address summary */}
          <div style={{ marginTop: "10px", padding: "10px 14px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: "9px" }}>
            <div style={{ color: COLORS.textDim, fontSize: "0.72rem" }}>ROUTING TO</div>
            <div style={{ color: COLORS.warn, fontFamily: "monospace", fontWeight: "700", fontSize: "1rem" }}>
              {activeSelVals.join("")}₂ = {selDecimal}₁₀ → Y{selDecimal}
            </div>
          </div>
        </div>

        {/* Right: outputs */}
        <div>
          <h4 style={{ color: COLORS.warn, marginBottom: "12px", fontSize: "0.9rem" }}>📤 Outputs</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {config.outputs.map((name, idx) => {
              const val = result[name] ?? 0;
              const isActive = result.active === idx;
              return (
                <div
                  key={name}
                  style={{
                    padding: "9px 14px", borderRadius: "9px",
                    border: `2px solid ${isActive ? (val ? COLORS.high : COLORS.low) : "rgba(148,163,184,0.12)"}`,
                    background: isActive ? (val ? "rgba(0,255,136,0.08)" : "rgba(239,68,68,0.05)") : COLORS.inputBg,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    transition: "all 0.2s",
                    boxShadow: isActive && val ? "0 0 8px rgba(0,255,136,0.2)" : "none",
                  }}
                >
                  <span style={{ color: isActive ? (val ? COLORS.high : COLORS.low) : COLORS.textSecondary, fontFamily: "monospace", fontWeight: "700" }}>
                    {name} {isActive ? "◀" : ""}
                  </span>
                  <span style={bitIndicatorStyle(!!val, COLORS.high)}>{val}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Signal path */}
      <div style={{ padding: "12px 18px", background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: "10px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ color: "#86efac", fontSize: "0.78rem", fontWeight: "700" }}>SIGNAL PATH</span>
        <span style={{ color: COLORS.high, fontFamily: "monospace" }}>D = {dVal}</span>
        <span style={{ color: COLORS.textDim }}>→</span>
        <span style={{ color: COLORS.warn, fontFamily: "monospace" }}>Y{selDecimal}</span>
        <span style={{ color: COLORS.textDim }}>→</span>
        <span style={{ color: COLORS.high, fontFamily: "monospace", fontWeight: "700" }}>Y{selDecimal} = {result[`Y${selDecimal}`] ?? 0}</span>
      </div>

      {/* Truth table */}
      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ color: "#93c5fd", marginBottom: "12px", fontSize: "0.9rem" }}>📊 Truth Table</h4>
        <TruthTable headers={config.truthHeaders} rows={config.truthRows} activeRow={selDecimal * 2 + dVal} inputCount={config.selectInputs.length + 1} />
      </div>

      {/* Boolean equations */}
      <div>
        <h4 style={{ color: COLORS.indigoLight, marginBottom: "14px", fontSize: "0.9rem" }}>
          📐 Boolean Equations — Click to Expand
        </h4>
        {config.booleanEqs.map((eq, i) => (
          <EquationRow key={i} eq={eq} isExpanded={expandedEq === i} onToggle={() => setExpandedEq(expandedEq === i ? null : i)} />
        ))}
      </div>
    </div>
  );
};

export default DemuxSimulator;
