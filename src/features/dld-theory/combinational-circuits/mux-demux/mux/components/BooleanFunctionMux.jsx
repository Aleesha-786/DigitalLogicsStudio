/**
 * BooleanFunctionMux.jsx
 *
 * Shows how a 4-to-1 MUX can implement any 2-input Boolean function
 * by hardwiring D0–D3 to 0 or 1 based on the truth table output column.
 *
 * The user clicks cells in the output column to toggle between 0 and 1,
 * and the component shows which D inputs to tie HIGH and which to tie LOW.
 */
import React, { useState } from "react";
import { COLORS } from "../../shared/theme.js";

const ROWS = [
  { a: 0, b: 0, label: "D0 (A=0,B=0)" },
  { a: 0, b: 1, label: "D1 (A=0,B=1)" },
  { a: 1, b: 0, label: "D2 (A=1,B=0)" },
  { a: 1, b: 1, label: "D3 (A=1,B=1)" },
];

const BooleanFunctionMux = () => {
  const [outputs, setOutputs] = useState([0, 0, 0, 0]);

  const toggle = (i) =>
    setOutputs((prev) => { const n = [...prev]; n[i] ^= 1; return n; });

  const highInputs = outputs.map((v, i) => (v ? `D${i}` : null)).filter(Boolean);
  const lowInputs  = outputs.map((v, i) => (!v ? `D${i}` : null)).filter(Boolean);
  const mintermStr = highInputs.length === 0 ? "F = 0 (always false)" : `F = Σm(${outputs.map((v, i) => v ? i : null).filter((x) => x !== null).join(", ")})`;

  return (
    <div style={{ background: COLORS.darkBg, borderRadius: "14px", padding: "22px", border: "1px solid rgba(99,102,241,0.25)" }}>
      <h4 style={{ color: COLORS.indigoLight, marginBottom: "8px", fontSize: "0.95rem" }}>
        🔧 Implement Any Function with a 4-to-1 MUX
      </h4>
      <p style={{ color: COLORS.textSecondary, fontSize: "0.83rem", lineHeight: "1.6", marginBottom: "18px" }}>
        Click the output column cells to toggle 0 / 1. The MUX data inputs D0–D3 are
        hardwired to match — the select inputs (A, B) then steer the right value to Y.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Truth table editor */}
        <div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "monospace", fontSize: "0.85rem" }}>
            <thead>
              <tr>
                {["A (S1)", "B (S0)", "D input", "Output F"].map((h, i) => (
                  <th key={i} style={{ padding: "9px 10px", background: "rgba(15,23,42,0.9)", color: i < 2 ? COLORS.warn : i === 2 ? COLORS.blue : COLORS.high, textAlign: "center", borderBottom: "2px solid rgba(99,102,241,0.3)", fontSize: "0.75rem" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(({ a, b, label }, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "rgba(15,23,42,0.4)" : "transparent" }}>
                  <td style={{ padding: "9px 10px", textAlign: "center", color: COLORS.warn }}>{a}</td>
                  <td style={{ padding: "9px 10px", textAlign: "center", color: COLORS.warn }}>{b}</td>
                  <td style={{ padding: "9px 10px", textAlign: "center", color: COLORS.blue, fontSize: "0.8rem" }}>{label}</td>
                  <td style={{ padding: "9px 10px", textAlign: "center" }}>
                    <button
                      onClick={() => toggle(i)}
                      style={{
                        width: "36px", height: "28px", borderRadius: "6px",
                        border: `1.5px solid ${outputs[i] ? COLORS.high : "rgba(99,102,241,0.3)"}`,
                        background: outputs[i] ? "rgba(0,255,136,0.15)" : COLORS.inputBg,
                        color: outputs[i] ? COLORS.high : COLORS.textDim,
                        fontFamily: "monospace", fontWeight: "700", cursor: "pointer",
                        fontSize: "0.9rem", transition: "all 0.2s",
                      }}
                    >
                      {outputs[i]}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Wiring summary */}
        <div>
          <div style={{ padding: "14px", background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: "10px", marginBottom: "12px" }}>
            <div style={{ color: "#86efac", fontSize: "0.75rem", fontWeight: "700", marginBottom: "8px" }}>TIE HIGH (connect to VCC)</div>
            <div style={{ fontFamily: "monospace", color: COLORS.high, fontSize: "0.9rem" }}>
              {highInputs.length > 0 ? highInputs.join(", ") : "None"}
            </div>
          </div>
          <div style={{ padding: "14px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px", marginBottom: "12px" }}>
            <div style={{ color: "#fca5a5", fontSize: "0.75rem", fontWeight: "700", marginBottom: "8px" }}>TIE LOW (connect to GND)</div>
            <div style={{ fontFamily: "monospace", color: COLORS.low, fontSize: "0.9rem" }}>
              {lowInputs.length > 0 ? lowInputs.join(", ") : "None"}
            </div>
          </div>
          <div style={{ padding: "14px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "10px" }}>
            <div style={{ color: COLORS.indigoLight, fontSize: "0.75rem", fontWeight: "700", marginBottom: "6px" }}>MINTERM EXPRESSION</div>
            <div style={{ fontFamily: "monospace", color: COLORS.textPrimary, fontSize: "0.85rem" }}>{mintermStr}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BooleanFunctionMux;
