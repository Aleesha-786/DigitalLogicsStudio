/**
 * Section.jsx — Titled card wrapper used on both Mux and Demux pages.
 *
 * Props:
 *   title      : string
 *   icon       : string (emoji)
 *   children   : ReactNode
 *   accentColor: string (optional)
 */
import React from "react";
import { COLORS, glassCardStyle } from "../theme.js";

const Section = ({ title, icon = "⚡", children, accentColor = COLORS.indigo }) => (
  <div style={{ ...glassCardStyle(accentColor), marginBottom: "28px" }}>
    <div
      style={{
        padding: "18px 24px",
        borderBottom: `1px solid ${accentColor}30`,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: `${accentColor}08`,
      }}
    >
      <span style={{ fontSize: "1.2rem" }}>{icon}</span>
      <h3 style={{ margin: 0, color: COLORS.textPrimary, fontSize: "1rem", fontWeight: "700" }}>
        {title}
      </h3>
    </div>
    <div style={{ padding: "24px" }}>{children}</div>
  </div>
);

export default Section;
