/**
 * TipsPanel.jsx — Floating tips pop-up.
 *
 * Props:
 *   tips : string[]
 */
import React, { useState } from "react";
import { COLORS } from "../theme.js";

const TipsPanel = ({ tips }) => {
  const [open, setOpen] = useState(false);
  const [idx, setIdx]   = useState(0);

  return (
    <div style={{ position: "fixed", bottom: "28px", right: "28px", zIndex: 1000 }}>
      {open && (
        <div
          style={{
            width: "300px", marginBottom: "12px", padding: "18px",
            background: "rgba(8,14,30,0.97)", border: "1px solid rgba(251,191,36,0.35)",
            borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ color: COLORS.warn, fontWeight: "700", fontSize: "0.8rem", marginBottom: "10px" }}>
            💡 TIP {idx + 1} / {tips.length}
          </div>
          <p style={{ color: COLORS.textSecondary, fontSize: "0.85rem", lineHeight: "1.65", margin: 0 }}>
            {tips[idx]}
          </p>
          <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
            <button
              onClick={() => setIdx((i) => (i - 1 + tips.length) % tips.length)}
              style={{ flex: 1, padding: "7px", borderRadius: "8px", border: "1px solid rgba(251,191,36,0.3)", background: "transparent", color: COLORS.warn, cursor: "pointer", fontSize: "0.8rem" }}
            >
              ← Prev
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % tips.length)}
              style={{ flex: 1, padding: "7px", borderRadius: "8px", border: "1px solid rgba(251,191,36,0.3)", background: "transparent", color: COLORS.warn, cursor: "pointer", fontSize: "0.8rem" }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "52px", height: "52px", borderRadius: "50%",
          background: open ? COLORS.warn : "rgba(251,191,36,0.15)",
          border: `2px solid ${COLORS.warn}`,
          color: open ? "#0a0f1a" : COLORS.warn,
          fontSize: "1.3rem", cursor: "pointer",
          boxShadow: "0 4px 16px rgba(251,191,36,0.3)",
          transition: "all 0.2s",
        }}
      >
        💡
      </button>
    </div>
  );
};

export default TipsPanel;
