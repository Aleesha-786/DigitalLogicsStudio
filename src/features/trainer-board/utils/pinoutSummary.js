import { ICS, IC_LOGIC } from "./icCatalog";

// ── IC Tray item ──────────────────────────────────────────────────
// Builds a "pin N = role" legend from IC_LOGIC so placement/tooltips can
// show real VCC/GND/input/output roles instead of leaving them undefined.
export function pinoutSummary(icKey) {
  const logic = IC_LOGIC[icKey];
  if (!logic) return "";
  const roles = {};
  roles[logic.vcc] = "VCC";
  roles[logic.gnd] = "GND";
  (logic.gates || []).forEach((g, i) => {
    g.in.forEach((p) => { roles[p] = `Gate${i + 1} IN`; });
    roles[g.out] = `Gate${i + 1} OUT`;
  });
  (logic.flops || []).forEach((f, i) => {
    if (f.d !== undefined) roles[f.d] = `FF${i + 1} D`;
    if (f.j !== undefined) roles[f.j] = `FF${i + 1} J`;
    if (f.k !== undefined) roles[f.k] = `FF${i + 1} K`;
    roles[f.clk] = `FF${i + 1} CLK`;
    roles[f.pr] = `FF${i + 1} PR̄`;
    roles[f.clr] = `FF${i + 1} CLR̄`;
    roles[f.q] = `FF${i + 1} Q`;
    roles[f.qb] = `FF${i + 1} Q̄`;
  });
  const n = ICS[icKey].pins;
  const lines = [];
  for (let p = 1; p <= n; p++) lines.push(`${p}:${roles[p] || "—"}`);
  return lines.join("  ");
}
