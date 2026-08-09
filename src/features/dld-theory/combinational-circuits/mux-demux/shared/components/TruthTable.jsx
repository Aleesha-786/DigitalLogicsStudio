/**
 * TruthTable.jsx — Generic truth-table renderer.
 *
 * Props:
 *   headers    : string[]
 *   rows       : string[][]
 *   activeRow  : number  (-1 = none)
 *   inputCount : number  (how many left columns are inputs, rest are outputs)
 */
import React from "react";
import { COLORS } from "../theme.js";

const TruthTable = ({ headers, rows, activeRow = -1, inputCount = 2 }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "monospace", fontSize: "0.85rem" }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th
              key={i}
              style={{
                padding: "10px 14px",
                background: "rgba(15,23,42,0.9)",
                color: i < inputCount ? COLORS.blue : COLORS.warn,
                textAlign: "center",
                borderBottom: "2px solid rgba(99,102,241,0.3)",
                fontWeight: "700",
                fontSize: "0.8rem",
                letterSpacing: "0.04em",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => {
          const isActive = ri === activeRow;
          return (
            <tr
              key={ri}
              style={{
                background: isActive
                  ? "rgba(0,255,136,0.08)"
                  : ri % 2 === 0
                  ? "rgba(15,23,42,0.4)"
                  : "transparent",
                transition: "background 0.2s",
              }}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: "9px 14px",
                    textAlign: "center",
                    borderBottom: "1px solid rgba(30,40,60,0.5)",
                    color: isActive
                      ? ci < inputCount ? COLORS.blue : COLORS.high
                      : ci < inputCount ? COLORS.textSecondary : COLORS.textMuted,
                    fontWeight: isActive ? "700" : "400",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default TruthTable;
