/**
 * theme.js — Shared design tokens
 *
 * Color tokens map to global CSS variables so light/dark mode
 * applies automatically via [data-theme] on <html>.
 */

// ─── Color palette ─────────────────────────────────────────────────────────────
export const COLORS = {
  // Backgrounds
  pageBg: "var(--bg-color)",
  cardBg: "var(--card-bg-solid)",
  inputBg: "var(--input-bg)",
  darkBg: "var(--surface-muted)",
  deepBg: "var(--card-bg-solid)",

  // Brand / accent
  indigo: "#6366f1",
  indigoLight: "#a5b4fc",
  indigoMuted: "rgba(99,102,241,0.2)",

  // Signal states
  high: "#00ff88",
  low: "#ef4444",
  warn: "#fbbf24",
  blue: "#60a5fa",
  purple: "#a78bfa",

  // Text
  textPrimary: "var(--text-color)",
  textSecondary: "var(--secondary-text)",
  textMuted: "var(--secondary-text)",
  textDim: "var(--secondary-text)",

  // Glassmorphism & Misc
  glassBg: "var(--card-bg)",
  glassBorder: "var(--card-border)",
  glassShadow: "var(--card-shadow)",
  glowShadow: (color) => `0 0 15px ${color}60, 0 0 5px ${color}40`,
};

// ─── Typography ────────────────────────────────────────────────────────────────
export const FONT = {
  mono: "monospace",
  base: "inherit",
};

// ─── Shared inline-style helpers ───────────────────────────────────────────────
export const bitIndicatorStyle = (isActive, activeColor = COLORS.high) => ({
  width: "28px",
  height: "16px",
  borderRadius: "4px",
  background: isActive ? activeColor : "rgba(99,102,241,0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: FONT.mono,
  fontSize: "0.78rem",
  color: isActive ? "#0a0f1a" : COLORS.textDim,
  fontWeight: "800",
  transition: "all 0.2s",
});

export const glassCardStyle = (accentColor = COLORS.indigo) => ({
  background: COLORS.glassBg,
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: `1px solid ${accentColor}40`,
  borderRadius: "20px",
  boxShadow: COLORS.glassShadow,
  overflow: "hidden",
});

export const cardStyle = (accentColor = COLORS.indigo) => ({
  background: COLORS.cardBg,
  border: `1px solid ${accentColor}30`,
  borderRadius: "16px",
  overflow: "hidden",
});
