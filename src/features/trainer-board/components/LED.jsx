// ── LED dot ───────────────────────────────────────────────────────
const LEDCOL = { R: "#ff1100", G: "#00ee44", Y: "#ffcc00", B: "#0099ff" };
export function LED({ on, c = "G", size = 10 }) {
  const col = LEDCOL[c] || LEDCOL.G;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: on ? col : "#111",
        boxShadow: on
          ? `0 0 4px ${col}, 0 0 10px ${col}55`
          : "inset 0 1px 3px #000",
        border: "1px solid #000",
      }}
    />
  );
}
