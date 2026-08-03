/**
 * Section.jsx — Shared section wrapper
 *
 * A titled card used on both the Decoder and Encoder pages to group
 * related content.  Accepts an optional `accent` color that tints the
 * header and border so each section feels visually distinct.
 *
 * Usage:
 *   <Section title="🔢 Truth Table" accent="#fbbf24">
 *     <TruthTable ... />
 *   </Section>
 */
import React from "react";
import { COLORS } from "../theme.js";

const Section = ({ title, children, accent = COLORS.indigo }) => (
  <div
    style={{
      marginBottom: "36px",
      background: COLORS.glassBg,
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: `1px solid ${accent}40`,
      borderRadius: "20px",
      boxShadow: COLORS.glassShadow,
      overflow: "hidden",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
    }}
  >
    {/* ── Section header bar ── */}
    <div
      style={{
        padding: "18px 24px",
        borderBottom: `1px solid ${accent}25`,
        background: `linear-gradient(90deg, ${accent}15, transparent)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <h3
        style={{
          color: COLORS.textPrimary,
          margin: 0,
          fontSize: "1.1rem",
          fontWeight: "800",
          letterSpacing: "0.02em",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ width: "4px", height: "18px", background: accent, borderRadius: "2px" }} />
        {title}
      </h3>
    </div>

    {/* ── Section body ── */}
    <div style={{ padding: "24px" }}>{children}</div>
  </div>
);

export default Section;
