/**
 * MuxSimulator.jsx — Interactive MUX simulator.
 *
 * Lets the user toggle data inputs and select lines, then watches the
 * output Y update in real time.  Also shows:
 *   - Active channel highlight
 *   - Signal flow arrow
 *   - Expandable Boolean equations
 *   - Truth table
 *
 * Props:
 *   config      : object — one entry from MUX_TYPES
 *   dataVals    : number[]
 *   setDataVals : fn
 *   selVals     : number[]
 *   setSelVals  : fn
 */
import React, { useState, useMemo } from "react";
import { COLORS, bitIndicatorStyle } from "../../shared/theme.js";
import TruthTable from "../../shared/components/TruthTable.jsx";

// ─── Input toggle button ───────────────────────────────────────────────────────
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

// ─── Expandable equation row ───────────────────────────────────────────────────
const EquationRow = ({ eq, isExpanded, onToggle }) => (
  <div
    style={{
      borderRadius: "14px", border: `1px solid ${eq.color}40`,
      background: COLORS.glassBg, backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)", marginBottom: "10px",
      overflow: "hidden", transition: "all 0.3s ease",
    }}
  >
    <div
      style={{
        width: "100%", padding: "14px 18px",
        background: isExpanded ? `${eq.color}15` : "transparent",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", cursor: "pointer",
      }}
      onClick={onToggle}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ color: eq.color, fontFamily: "monospace", fontWeight: "800", fontSize: "0.85rem" }}>
          {eq.label}
        </span>
        <code style={{ color: COLORS.textPrimary, fontFamily: "monospace", fontSize: "0.85rem", opacity: 0.9 }}>
          {eq.eq}
        </code>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(eq.eq); alert("Copied!"); }}
          style={{ padding: "2px 8px", fontSize: "0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: COLORS.textSecondary, borderRadius: "4px", cursor: "pointer", fontWeight: "700" }}
        >
          📋 COPY
        </button>
        <span style={{ color: COLORS.textMuted, fontSize: "0.8rem" }}>{isExpanded ? "▲" : "▼"}</span>
      </div>
    </div>
    {isExpanded && (
      <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${eq.color}20` }}>
        <p style={{ color: COLORS.textSecondary, fontSize: "0.88rem", lineHeight: "1.7", margin: "16px 0" }}>
          {eq.explanation}
        </p>
        <div style={{ padding: "12px 16px", background: `${eq.color}15`, border: `1px solid ${eq.color}40`, borderRadius: "10px" }}>
          <span style={{ color: eq.color, fontSize: "0.78rem", fontWeight: "800" }}>🎯 MEMORY TRICK: </span>
          <span style={{ color: COLORS.textPrimary, fontSize: "0.83rem", opacity: 0.9 }}>{eq.trick}</span>
        </div>
      </div>
    )}
  </div>
);

// ─── Main ──────────────────────────────────────────────────────────────────────
const MuxSimulator = ({ config, dataVals, setDataVals, selVals, setSelVals }) => {
  const [expandedEq, setExpandedEq] = useState(null);

  const activeDataVals = dataVals.slice(0, config.dataInputs.length);
  const activeSelVals  = selVals.slice(0, config.selectInputs.length);

  const result = useMemo(
    () => config.mux(activeDataVals, activeSelVals),
    [config, activeDataVals, activeSelVals],
  );

  const toggleData = (idx) => {
    const next = [...dataVals]; next[idx] = next[idx] ? 0 : 1; setDataVals(next);
  };
  const toggleSel = (idx) => {
    const next = [...selVals]; next[idx] = next[idx] ? 0 : 1; setSelVals(next);
  };
  const resetAll = () => { setDataVals(Array(8).fill(0)); setSelVals(Array(3).fill(0)); };

  const selDecimal = activeSelVals.reduce((acc, b, i) => acc + (b << (activeSelVals.length - 1 - i)), 0);

  return (
    <div>
      {/* ── Top grid: selects | data | output ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 180px", gap: "18px", marginBottom: "20px" }}>

        {/* Select inputs */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4 style={{ color: COLORS.warn, margin: 0, fontSize: "0.9rem" }}>🎛 Select Lines</h4>
          </div>
          {config.selectInputs.map((name, idx) => (
            <InputToggle key={name} label={name} isActive={!!activeSelVals[idx]} onClick={() => toggleSel(idx)} activeColor={COLORS.warn} />
          ))}
          <div style={{ marginTop: "10px", padding: "10px 14px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: "9px" }}>
            <div style={{ color: COLORS.textDim, fontSize: "0.72rem" }}>SELECT ADDRESS</div>
            <div style={{ color: COLORS.warn, fontFamily: "monospace", fontWeight: "700", fontSize: "1rem" }}>
              {activeSelVals.join("")}₂ = {selDecimal}₁₀ → D{selDecimal}
            </div>
          </div>
        </div>

        {/* Data inputs */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4 style={{ color: COLORS.blue, margin: 0, fontSize: "0.9rem" }}>📥 Data Inputs</h4>
            <button onClick={resetAll} style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(148,163,184,0.2)", background: "transparent", color: COLORS.textMuted, cursor: "pointer", fontSize: "0.75rem" }}>Reset</button>
          </div>
          {config.dataInputs.map((name, idx) => {
            const isSelected = result.active === idx;
            return (
              <InputToggle
                key={name}
                label={`${name}${isSelected ? " ◀ selected" : ""}`}
                isActive={!!activeDataVals[idx]}
                onClick={() => toggleData(idx)}
                activeColor={isSelected ? COLORS.high : COLORS.blue}
              />
            );
          })}
        </div>

        {/* Output Y */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: COLORS.textSecondary, fontSize: "0.75rem", marginBottom: "10px", textAlign: "center" }}>OUTPUT</div>
          <div
            style={{
              width: "90px", height: "90px", borderRadius: "50%",
              border: `3px solid ${result.Y ? COLORS.high : COLORS.indigoMuted}`,
              background: result.Y ? "rgba(0,255,136,0.15)" : COLORS.inputBg,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              boxShadow: result.Y ? "0 0 20px rgba(0,255,136,0.4)" : "none",
              transition: "all 0.25s",
            }}
          >
            <div style={{ fontFamily: "monospace", fontWeight: "900", fontSize: "2rem", color: result.Y ? COLORS.high : COLORS.textDim }}>
              {result.Y}
            </div>
            <div style={{ color: result.Y ? "#86efac" : COLORS.textDim, fontSize: "0.7rem", fontWeight: "700" }}>Y</div>
          </div>
          <div style={{ marginTop: "12px", color: COLORS.textSecondary, fontSize: "0.75rem", textAlign: "center" }}>
            D{result.active} → Y
          </div>
        </div>
      </div>

      {/* ── Signal flow banner ── */}
      <div style={{ padding: "12px 18px", background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: "10px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ color: "#86efac", fontSize: "0.78rem", fontWeight: "700" }}>SIGNAL PATH</span>
        <span style={{ color: COLORS.blue, fontFamily: "monospace", fontSize: "0.85rem" }}>D{result.active} = {result.Y}</span>
        <span style={{ color: COLORS.textDim }}>→</span>
        <span style={{ color: COLORS.high, fontFamily: "monospace", fontWeight: "700" }}>Y = {result.Y}</span>
      </div>

      {/* ── Truth table ── */}
      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ color: "#93c5fd", marginBottom: "12px", fontSize: "0.9rem" }}>📊 Select Truth Table</h4>
        <TruthTable
          headers={config.truthHeaders}
          rows={config.truthRows}
          activeRow={selDecimal}
          inputCount={config.selectInputs.length}
        />
      </div>

      {/* ── Boolean equations ── */}
      <div>
        <h4 style={{ color: COLORS.indigoLight, marginBottom: "14px", fontSize: "0.9rem" }}>
          📐 Boolean Equations — Click to Expand
        </h4>
        {config.booleanEqs.map((eq, i) => (
          <EquationRow
            key={i} eq={eq}
            isExpanded={expandedEq === i}
            onToggle={() => setExpandedEq(expandedEq === i ? null : i)}
          />
        ))}
      </div>
    </div>
  );
};

export default MuxSimulator;
