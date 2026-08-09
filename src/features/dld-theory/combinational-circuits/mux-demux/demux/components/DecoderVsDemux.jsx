/**
 * DecoderVsDemux.jsx
 *
 * Side-by-side comparison showing that a decoder with Enable acts
 * as a DEMUX when the Enable pin is used as the data input D.
 *
 * Interactive: user toggles D and S to see both circuits react the same way.
 */
import React, { useState } from "react";
import { COLORS, bitIndicatorStyle } from "../../shared/theme.js";

const ROWS = [
  ["Feature", "Decoder", "DEMUX"],
  ["Data input", "None (Enable = strobe)", "D — actual data signal"],
  ["Selected output", "Always 1 (when enabled)", "Follows D (0 or 1)"],
  ["D tied HIGH", "—", "Acts identically to a decoder"],
  ["Primary use", "Address decoding, memory chip select", "Serial-to-parallel conversion, routing"],
  ["Output when disabled/D=0", "All 0", "All 0"],
];

const DecoderVsDemux = () => {
  const [d, setD]   = useState(1);
  const [s, setS]   = useState(0); // 0 or 1

  // Decoder output: selected line always = 1 when enable=1
  const decY0 = s === 0 ? 1 : 0;
  const decY1 = s === 1 ? 1 : 0;

  // DEMUX output: selected line = D
  const demY0 = s === 0 ? d : 0;
  const demY1 = s === 1 ? d : 0;

  const OutCell = ({ val, isActive }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={bitIndicatorStyle(!!val, isActive ? COLORS.high : COLORS.warn)}>{val}</span>
    </div>
  );

  return (
    <div style={{ background: COLORS.darkBg, borderRadius: "14px", padding: "22px", border: "1px solid rgba(99,102,241,0.25)" }}>
      <h4 style={{ color: COLORS.indigoLight, marginBottom: "8px", fontSize: "0.95rem" }}>
        🔍 Decoder vs DEMUX — Interactive Comparison
      </h4>

      {/* Controls */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button
          onClick={() => setD((v) => v ^ 1)}
          style={{ padding: "8px 16px", borderRadius: "9px", border: `1.5px solid ${d ? COLORS.high : COLORS.indigoMuted}`, background: d ? "rgba(0,255,136,0.12)" : COLORS.inputBg, color: d ? COLORS.high : COLORS.textMuted, cursor: "pointer", fontFamily: "monospace", fontWeight: "700" }}
        >
          D = {d}  (toggle)
        </button>
        <button
          onClick={() => setS((v) => v ^ 1)}
          style={{ padding: "8px 16px", borderRadius: "9px", border: `1.5px solid ${COLORS.warn}`, background: "rgba(251,191,36,0.1)", color: COLORS.warn, cursor: "pointer", fontFamily: "monospace", fontWeight: "700" }}
        >
          S = {s}  (toggle)
        </button>
      </div>

      {/* Side-by-side outputs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "22px" }}>
        {/* Decoder */}
        <div style={{ padding: "16px", background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.25)", borderRadius: "12px" }}>
          <div style={{ color: COLORS.blue, fontWeight: "700", fontSize: "0.82rem", marginBottom: "12px" }}>
            1-to-2 DECODER  (Enable = {d})
          </div>
          {[["Y0", decY0, s === 0], ["Y1", decY1, s === 1]].map(([name, val, isActive]) => (
            <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", padding: "8px 12px", borderRadius: "8px", background: isActive ? "rgba(96,165,250,0.08)" : "transparent" }}>
              <span style={{ color: isActive ? COLORS.blue : COLORS.textMuted, fontFamily: "monospace", fontWeight: "700" }}>{name}</span>
              <OutCell val={val} isActive={false} />
            </div>
          ))}
          <div style={{ marginTop: "8px", color: COLORS.textDim, fontSize: "0.75rem" }}>
            ⚠ Selected output always = 1 regardless of D
          </div>
        </div>

        {/* DEMUX */}
        <div style={{ padding: "16px", background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: "12px" }}>
          <div style={{ color: COLORS.high, fontWeight: "700", fontSize: "0.82rem", marginBottom: "12px" }}>
            1-to-2 DEMUX  (D = {d})
          </div>
          {[["Y0", demY0, s === 0], ["Y1", demY1, s === 1]].map(([name, val, isActive]) => (
            <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", padding: "8px 12px", borderRadius: "8px", background: isActive ? "rgba(0,255,136,0.08)" : "transparent" }}>
              <span style={{ color: isActive ? COLORS.high : COLORS.textMuted, fontFamily: "monospace", fontWeight: "700" }}>{name}</span>
              <OutCell val={val} isActive={true} />
            </div>
          ))}
          <div style={{ marginTop: "8px", color: "#86efac", fontSize: "0.75rem" }}>
            ✔ Selected output follows D — could be 0 or 1
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "monospace", fontSize: "0.82rem" }}>
          <tbody>
            {ROWS.map((row, ri) => (
              <tr key={ri} style={{ background: ri === 0 ? "rgba(15,23,42,0.9)" : ri % 2 === 0 ? "rgba(15,23,42,0.4)" : "transparent" }}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    style={{
                      padding: "9px 14px",
                      borderBottom: "1px solid rgba(30,40,60,0.5)",
                      color: ri === 0 ? (ci === 0 ? COLORS.textSecondary : ci === 1 ? COLORS.blue : COLORS.high) : COLORS.textSecondary,
                      fontWeight: ri === 0 || ci === 0 ? "700" : "400",
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DecoderVsDemux;
