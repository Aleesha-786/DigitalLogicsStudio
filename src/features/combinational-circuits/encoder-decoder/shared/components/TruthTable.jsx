/**
 * TruthTable.jsx — Shared truth-table renderer
 *
 * Renders a bordered table from plain arrays.  An optional
 * `activeRow` index highlights the currently decoded/encoded row.
 *
 * Props:
 *   headers    : string[]      — column headers
 *   rows       : string[][]   — data rows
 *   activeRow  : number | null — index of highlighted row (-1 = none)
 *   inputCount : number        — how many leading columns are "inputs"
 *                               (colored blue vs amber for outputs)
 */
import React from "react";
import { COLORS } from "../theme.js";

const TruthTable = ({ headers, rows, activeRow = -1, inputCount = 1 }) => (
  <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "monospace",
        fontSize: "0.85rem",
        background: "rgba(15, 23, 42, 0.3)",
      }}
    >
      {/* ── Header row ── */}
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th
              key={i}
              style={{
                padding: "12px 16px",
                background: "rgba(15,23,42,0.6)",
                color: i < inputCount ? COLORS.blue : COLORS.warn,
                textAlign: "center",
                borderBottom: "2px solid rgba(99,102,241,0.2)",
                fontSize: "0.8rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>

      {/* ── Data rows ── */}
      <tbody>
        {rows.map((row, ri) => {
          const isActive = ri === activeRow;
          return (
            <tr
              key={ri}
              style={{
                background: isActive
                  ? "rgba(0,255,136,0.12)"
                  : ri % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                transition: "all 0.3s ease",
                transform: isActive ? "scale(1.005)" : "none",
                boxShadow: isActive ? "inset 4px 0 0 " + COLORS.high : "none",
              }}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: "10px 16px",
                    textAlign: "center",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    color:
                      isActive
                        ? ci < inputCount
                          ? COLORS.blue
                          : COLORS.high
                        : ci < inputCount
                          ? COLORS.textSecondary
                          : COLORS.textMuted,
                    fontWeight: isActive ? "800" : "400",
                    textShadow: isActive ? `0 0 8px ${ci < inputCount ? COLORS.blue : COLORS.high}40` : "none",
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
