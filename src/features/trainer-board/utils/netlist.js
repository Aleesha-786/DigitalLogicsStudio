import { ICS } from "./icCatalog";

// ── Union-Find over node references ────────────────────────────────
export class NetSet {
  constructor() { this.parent = new Map(); }
  find(x) {
    if (!this.parent.has(x)) this.parent.set(x, x);
    let root = x;
    while (this.parent.get(root) !== root) root = this.parent.get(root);
    while (this.parent.get(x) !== root) {
      const next = this.parent.get(x);
      this.parent.set(x, root);
      x = next;
    }
    return root;
  }
  union(a, b) {
    const ra = this.find(a), rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
}

// A breadboard body hole `bb_${col}_${row}` belongs to a 5-hole vertical
// strip: rows a-e (top half) share one electrical node per column, rows
// f-j (bottom half) share a *different* node per column (real breadboard
// behavior — the center DIP gap breaks the strip in two).
export function holeStripKey(holeId) {
  const m = /^bb_(\d+)_([a-j])$/.exec(holeId);
  if (!m) return null;
  const col = m[1], row = m[2];
  const half = "abcde".includes(row) ? "top" : "bot";
  return `strip_${half}_${col}`;
}
export function railNetKey(holeId) {
  if (/^rail_(t|b)vcc_/.test(holeId)) return "NET_VCC";
  if (/^rail_(t|b)gnd_/.test(holeId)) return "NET_GND";
  return null;
}

// Physical DIP pin -> breadboard hole, given the column the IC was
// snapped to (`icCol`) and its total pin count. Pin 1 is bottom-left
// (next to the notch), numbering runs left-to-right along the bottom row
// then right-to-left along the top row — standard 74xx DIP convention.
export function icPinHole(icCol, totalPins, pinNum) {
  const bottomCount = Math.ceil(totalPins / 2);
  if (pinNum <= bottomCount) {
    return `bb_${icCol + (pinNum - 1)}_f`;
  }
  const i = totalPins - pinNum;
  return `bb_${icCol + i}_e`;
}

// Builds the full netlist (a NetSet you can .find() any reference
// through) from the current wires + placed ICs.
export function buildNetlist(wires, placedICs) {
  const ns = new NetSet();

  // Wires directly union whatever two references they connect.
  wires.forEach((w) => ns.union(w.from, w.to));

  // Union every touched breadboard hole into its physical strip/rail node.
  const allHoleRefs = new Set();
  wires.forEach((w) => { allHoleRefs.add(w.from); allHoleRefs.add(w.to); });
  placedICs.forEach((p) => {
    const ic = ICS[p.ic];
    if (!ic) return;
    for (let pin = 1; pin <= ic.pins; pin++) {
      allHoleRefs.add(icPinHole(p.col, ic.pins, pin));
    }
  });
  allHoleRefs.forEach((ref) => {
    const stripKey = holeStripKey(ref);
    if (stripKey) ns.union(ref, stripKey);
    const railKey = railNetKey(ref);
    if (railKey) ns.union(ref, railKey);
  });

  // Union each IC's own pin reference (`${icId}_p${n}`) into the hole it
  // physically occupies, so `icPinNode(ic, n)` below resolves correctly.
  placedICs.forEach((p) => {
    const ic = ICS[p.ic];
    if (!ic) return;
    for (let pin = 1; pin <= ic.pins; pin++) {
      ns.union(`${p.id}_p${pin}`, icPinHole(p.col, ic.pins, pin));
    }
  });

  return ns;
}

// Resolves a node's driven boolean value from a `values` map, defaulting
// unconnected/undriven nodes to 0 (LOW) — the common, documented
// simplification real teaching simulators make for floating TTL inputs.
export function readNode(ns, values, ref) {
  const v = values.get(ns.find(ref));
  return v === undefined ? 1 : v;
}
export function writeNode(ns, values, ref, val) {
  values.set(ns.find(ref), val & 1);
}

export function allOutputPins(logic) {
  const pins = [];
  (logic.gates || []).forEach((g) => pins.push(g.out));
  (logic.flops || []).forEach((f) => { pins.push(f.q); pins.push(f.qb); });
  if (logic.msi === "adder") { pins.push(...logic.s, logic.cout); }
  if (logic.msi === "comparator") { pins.push(logic.gtOut, logic.ltOut, logic.eqOut); }
  if (logic.msi === "decoder") { pins.push(...logic.y); }
  if (logic.msi === "mux") { pins.push(logic.y, logic.yb); }
  if (logic.msi === "bcd7seg") { pins.push(...Object.values(logic.seg)); }
  if (logic.msi === "counter") { pins.push(...logic.q, logic.carry, logic.borrow); }
  if (logic.msi === "shiftreg") { pins.push(...logic.q); }
  return pins;
}
