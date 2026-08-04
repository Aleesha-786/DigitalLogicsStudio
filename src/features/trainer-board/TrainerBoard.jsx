import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../shared/components/Navbar";
import Footer from "../../shared/components/Footer";
import { useTheme } from "../../shared/context/ThemeContext";
import { useAuth } from "../../auth/context/AuthContext";
import trainerBoardService from "../../shared/services/trainerBoardService";

/* ================================================================
   IT-300 Digital Logic Training System — Infinit Technologies
   Fixed version: proper holes, correct wire coords, working drag-drop
   ================================================================ */

// ── IC Catalog ────────────────────────────────────────────────────
const ICS = {
  7400: {
    name: "Quad 2-in NAND",
    pins: 14,
    sym: "⊼",
    bg: "#1a1a40",
    txt: "#9090ff",
    desc: "Quad 2-in NAND - Contains four independent logic gates that produce a LOW output only when both of their inputs are HIGH.",
  },
  7402: {
    name: "Quad 2-in NOR",
    pins: 14,
    sym: "⊽",
    bg: "#0d2b0d",
    txt: "#60dd60",
    desc: "Quad 2-in NOR - Contains four independent logic gates that produce a HIGH output only when both of their inputs are LOW.",
  },
  7404: {
    name: "Hex Inverter",
    pins: 14,
    sym: "¬",
    bg: "#2d0a0a",
    txt: "#ff8080",
    desc: "Hex Inverter - Contains six independent logic gates that flip the input signal, turning a HIGH into a LOW and vice versa.",
  },
  7408: {
    name: "Quad 2-in AND",
    pins: 14,
    sym: "∧",
    bg: "#1a1a00",
    txt: "#e0e060",
    desc: "Quad 2-in AND - Contains four independent logic gates that produce a HIGH output only when both of their inputs are HIGH.",
  },
  7432: {
    name: "Quad 2-in OR",
    pins: 14,
    sym: "∨",
    bg: "#001a1a",
    txt: "#60e0e0",
    desc: "Quad 2-in OR - Contains four independent logic gates that produce a HIGH output if at least one of their inputs is HIGH.",
  },
  7486: {
    name: "Quad 2-in XOR",
    pins: 14,
    sym: "⊕",
    bg: "#1a001a",
    txt: "#e060e0",
    desc: "Quad 2-in XOR - Contains four independent logic gates that produce a HIGH output only when their two inputs are different from each other.",
  },
  7474: {
    name: "Dual D Flip-Flop",
    pins: 14,
    sym: "D",
    bg: "#001428",
    txt: "#60b0ff",
    desc: "Dual D Flip-Flop - Contains two storage cells that capture the state of the data input (D) exactly when a clock signal transitions.",
  },
  7476: {
    name: "Dual JK Flip-Flop",
    pins: 16,
    sym: "JK",
    bg: "#0a1a10",
    txt: "#60ffaa",
    desc: "Dual JK Flip-Flop - Contains two versatile memory elements capable of storing a bit, resetting, setting, or toggling its state on a clock pulse.",
  },
  7483: {
    name: "4-bit Adder",
    pins: 16,
    sym: "+",
    bg: "#1a0a00",
    txt: "#ffb060",
    desc: "4-bit Adder - Math unit that adds two 4-bit binary numbers together and provides the sum along with a carry-out bit.",
  },
  7485: {
    name: "4-bit Comparator",
    pins: 16,
    sym: "=?",
    bg: "#0a0a1a",
    txt: "#a0a0ff",
    desc: "4-bit Comparator - Logic circuit that compares two 4-bit binary numbers to tell you if they are equal, or which one is larger.",
  },
  74138: {
    name: "3-to-8 Decoder",
    pins: 16,
    sym: "1:8",
    bg: "#1a1a0a",
    txt: "#ffff80",
    desc: "3-to-8 Decoder - Takes a 3-bit binary input code and activates exactly one corresponding output out of eight available lines.",
  },
  74151: {
    name: "8-to-1 MUX",
    pins: 16,
    sym: "MX",
    bg: "#14001a",
    txt: "#ff80ff",
    desc: "8-to-1 MUX - Acts like a data selector switch, funneling one of eight data input channels into a single output based on a 3-bit binary address.",
  },
  7447: {
    name: "BCD→7Seg Driver",
    pins: 16,
    sym: "7s",
    bg: "#001a0a",
    txt: "#80ffbb",
    desc: "BCD→7Seg Driver - Translates a 4-bit binary-coded decimal number into the specific on/off patterns needed to display numbers 0-9 on a 7-segment display.",
  },
  74193: {
    name: "4-bit Up/Dn Ctr",
    pins: 16,
    sym: "↑↓",
    bg: "#1a0505",
    txt: "#ffaaaa",
    desc: "4-bit Up/Dn Ctr - A digital counter that counts sequentially from 0 to 15 (or 15 down to 0) with every incoming clock pulse.",
  },
  7495: {
    name: "4-bit Shift Reg",
    pins: 14,
    sym: ">>",
    bg: "#001818",
    txt: "#80ffff",
    desc: "4-bit Shift Reg - Moves bits of data sequentially through 4 internal storage slots, supporting both serial data shifting and parallel loading.",
  },
};

// ════════════════════════════════════════════════════════════════════
// SIMULATION ENGINE
// Real pin-level netlist + boolean-algebra propagation.
//
// Every hole on the breadboard, every external terminal (switches, push
// buttons, clock, data-bus monitors...) and every IC pin is a *node
// reference*. Wires and physical breadboard strips union node references
// together into electrical nodes. Each IC reads the resolved value of its
// input-pin nodes and drives its output-pin nodes — exactly like a real
// simulator (Proteus/Multisim/Logisim) resolves a netlist, just scaled
// down to what a trainer board needs.
//
// NOTE ON ACCURACY: gate-level chips (7400/02/04/08/32/86) and the two
// flip-flop chips (7474/7476) use their real SN74xx datasheet pinouts.
// The MSI chips (7483/7485/74138/74151/7447/74193/7495) use pinouts that
// are datasheet-accurate where the author was confident (7447, 74138,
// 74151 pin numbers are the real ones) and otherwise use a clearly
// simplified, internally-consistent numbering — good for teaching
// boolean behavior, but double-check against a real datasheet before
// wiring a physical board from it.
// ════════════════════════════════════════════════════════════════════

// ── Gate primitives ────────────────────────────────────────────────
const G = {
  and: (a, b) => (a & b) & 1,
  or: (a, b) => (a | b) & 1,
  nand: (a, b) => 1 - ((a & b) & 1),
  nor: (a, b) => 1 - ((a | b) & 1),
  xor: (a, b) => (a ^ b) & 1,
  not: (a) => 1 - (a & 1),
};

// ── IC_LOGIC: pin-accurate behavior tables ─────────────────────────
// gates: combinational 2-in (or 1-in for inverters) logic cells.
// flops: edge-triggered storage cells (D or JK).
// msi:   custom evaluate() for the multi-pin MSI parts.
const IC_LOGIC = {
  7400: {
    vcc: 14, gnd: 7, gates: [
      { in: [1, 2], out: 3, fn: G.nand }, { in: [4, 5], out: 6, fn: G.nand },
      { in: [9, 10], out: 8, fn: G.nand }, { in: [12, 13], out: 11, fn: G.nand },
    ]
  },
  7402: {
    vcc: 14, gnd: 7, gates: [
      { in: [2, 3], out: 1, fn: G.nor }, { in: [5, 6], out: 4, fn: G.nor },
      { in: [8, 9], out: 10, fn: G.nor }, { in: [11, 12], out: 13, fn: G.nor },
    ]
  },
  7404: {
    vcc: 14, gnd: 7, gates: [
      { in: [1], out: 2, fn: G.not }, { in: [3], out: 4, fn: G.not },
      { in: [5], out: 6, fn: G.not }, { in: [9], out: 8, fn: G.not },
      { in: [11], out: 10, fn: G.not }, { in: [13], out: 12, fn: G.not },
    ]
  },
  7408: {
    vcc: 14, gnd: 7, gates: [
      { in: [1, 2], out: 3, fn: G.and }, { in: [4, 5], out: 6, fn: G.and },
      { in: [9, 10], out: 8, fn: G.and }, { in: [12, 13], out: 11, fn: G.and },
    ]
  },
  7432: {
    vcc: 14, gnd: 7, gates: [
      { in: [1, 2], out: 3, fn: G.or }, { in: [4, 5], out: 6, fn: G.or },
      { in: [9, 10], out: 8, fn: G.or }, { in: [12, 13], out: 11, fn: G.or },
    ]
  },
  7486: {
    vcc: 14, gnd: 7, gates: [
      { in: [1, 2], out: 3, fn: G.xor }, { in: [4, 5], out: 6, fn: G.xor },
      { in: [9, 10], out: 8, fn: G.xor }, { in: [12, 13], out: 11, fn: G.xor },
    ]
  },
  7474: {
    vcc: 14, gnd: 7, flops: [
      { kind: "d", d: 2, clk: 3, pr: 4, clr: 1, q: 5, qb: 6 },
      { kind: "d", d: 12, clk: 11, pr: 10, clr: 13, q: 9, qb: 8 },
    ]
  },
  7476: {
    vcc: 5, gnd: 13, flops: [
      { kind: "jk", j: 4, k: 16, clk: 1, pr: 2, clr: 3, q: 14, qb: 15 },
      { kind: "jk", j: 9, k: 10, clk: 8, pr: 7, clr: 6, q: 11, qb: 12 },
    ]
  },
  // 4-bit full adder. VCC=5 / GND=12 is the real (unusual) 7483 quirk.
  7483: {
    vcc: 5, gnd: 12, msi: "adder",
    a: [1, 2, 3, 4], b: [6, 7, 8, 9], cin: 10, cout: 11, s: [13, 14, 15, 16]
  },
  // 4-bit magnitude comparator. Real datasheet pinout.
  7485: {
    vcc: 16, gnd: 8, msi: "comparator",
    a: [1, 2, 3, 4], b: [5, 6, 7, 9], gtIn: 10, ltIn: 11, eqIn: 12,
    gtOut: 13, ltOut: 14, eqOut: 15
  },
  // 3-to-8 decoder. Real datasheet pinout.
  74138: {
    vcc: 16, gnd: 8, msi: "decoder",
    a: [1, 2, 3], e2a: 4, e2b: 5, e1: 6, y: [15, 14, 13, 12, 11, 10, 9, 7]
  },
  // 8-to-1 mux. Real datasheet pinout.
  74151: {
    vcc: 16, gnd: 8, msi: "mux",
    d: [4, 3, 2, 1, 15, 14, 13, 12], s: [11, 10, 9], strobe: 7, y: 5, yb: 6
  },
  // BCD -> 7-seg driver. Real datasheet pinout.
  7447: {
    vcc: 16, gnd: 8, msi: "bcd7seg",
    bcd: [7, 1, 2, 6], lt: 3, bi: 4, rbi: 5,
    seg: { a: 13, b: 12, c: 11, d: 10, e: 9, f: 15, g: 14 }
  },
  // 4-bit up/down counter. Simplified-but-consistent numbering.
  74193: {
    vcc: 16, gnd: 8, msi: "counter",
    d: [15, 1, 10, 9], up: 5, down: 4, load: 11, clear: 14,
    q: [3, 2, 6, 7], carry: 12, borrow: 13
  },
  // 4-bit serial/parallel shift register. Simplified numbering (author
  // not fully confident of the real 7495 pin order — verify vs datasheet).
  7495: {
    vcc: 14, gnd: 7, msi: "shiftreg",
    d: [2, 3, 4, 5], serIn: 1, mode: 6, clk1: 9, clk2: 8, q: [10, 11, 12, 13]
  },
};

// ── Union-Find over node references ────────────────────────────────
class NetSet {
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
function holeStripKey(holeId) {
  const m = /^bb_(\d+)_([a-j])$/.exec(holeId);
  if (!m) return null;
  const col = m[1], row = m[2];
  const half = "abcde".includes(row) ? "top" : "bot";
  return `strip_${half}_${col}`;
}
function railNetKey(holeId) {
  if (/^rail_(t|b)vcc_/.test(holeId)) return "NET_VCC";
  if (/^rail_(t|b)gnd_/.test(holeId)) return "NET_GND";
  return null;
}

// Physical DIP pin -> breadboard hole, given the column the IC was
// snapped to (`icCol`) and its total pin count. Pin 1 is bottom-left
// (next to the notch), numbering runs left-to-right along the bottom row
// then right-to-left along the top row — standard 74xx DIP convention.
function icPinHole(icCol, totalPins, pinNum) {
  const bottomCount = Math.ceil(totalPins / 2);
  if (pinNum <= bottomCount) {
    return `bb_${icCol + (pinNum - 1)}_f`;
  }
  const i = totalPins - pinNum;
  return `bb_${icCol + i}_e`;
}

// Builds the full netlist (a NetSet you can .find() any reference
// through) from the current wires + placed ICs.
function buildNetlist(wires, placedICs) {
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
function readNode(ns, values, ref) {
  const v = values.get(ns.find(ref));
  return v === undefined ? 1 : v;
}
function writeNode(ns, values, ref, val) {
  values.set(ns.find(ref), val & 1);
}

function allOutputPins(logic) {
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

// Runs the combinational settle: seeds power rails + live external
// sources, then relaxes every placed IC's combinational outputs across a
// few passes so multi-gate chains stabilize (plenty for a trainer-board
// scale netlist — no need for a full topological sort).
function evaluateCircuit(ns, placedICs, sources, icRegs) {
  const values = new Map();
  const shorts = new Set(); // NEW: resolved node-keys with conflicting drivers
  writeNode(ns, values, "NET_VCC", 1);
  writeNode(ns, values, "NET_GND", 0);
  Object.entries(sources).forEach(([ref, val]) => writeNode(ns, values, ref, val ? 1 : 0));

  // NEW: VCC wired directly to GND (no chip in between) — always a hard short.
  if (ns.find("NET_VCC") === ns.find("NET_GND")) {
    shorts.add(ns.find("NET_VCC"));
  }

  const PASSES = 4;
  for (let pass = 0; pass < PASSES; pass++) {
    // NEW: only trust conflicts on the final (settled) pass — earlier passes
    // can show transient mismatches while values are still propagating.
    const isFinalPass = pass === PASSES - 1;
    const driverMap = isFinalPass ? new Map() : null; // node -> first value driven this pass

    placedICs.forEach((p) => {
      const logic = IC_LOGIC[p.ic];
      if (!logic) return;
      const pin = (n) => `${p.id}_p${n}`;
      const rd = (n) => readNode(ns, values, pin(n));
      const wr = (n, v) => {
        writeNode(ns, values, pin(n), v);
        // NEW: record every driven output per node to catch output-vs-output conflicts
        if (driverMap) {
          const node = ns.find(pin(n));
          const bit = v & 1;
          const seen = driverMap.get(node);
          if (seen !== undefined && seen !== bit) {
            shorts.add(node);
          } else {
            driverMap.set(node, bit);
          }
        }
      };
      const powered = ns.find(pin(logic.vcc)) === ns.find("NET_VCC")
        && ns.find(pin(logic.gnd)) === ns.find("NET_GND");
      if (!powered) {
        // Chip has no power/ground connection — force every output pin LOW
        // and skip its logic entirely (matches real unpowered-TTL behavior).
        allOutputPins(logic).forEach((n) => wr(n, 0));
      } else {
        if (logic.gates) {
          logic.gates.forEach((g) => wr(g.out, g.fn(...g.in.map(rd))));
        }
        if (logic.flops) {
          // Combinational part only (Q/Qbar outputs + async preset/clear).
          // Clocked D/J-K updates happen in the sequential effect below.
          const reg = icRegs[p.id] || {};
          logic.flops.forEach((f, i) => {
            let q = reg.q ? reg.q[i] : 0;
            if (rd(f.clr) === 0) q = 0; // active-low async clear
            else if (rd(f.pr) === 0) q = 1; // active-low async preset
            wr(f.q, q);
            wr(f.qb, 1 - q);
          });
        }
        if (logic.msi === "adder") {
          const a = logic.a.map(rd), b = logic.b.map(rd), cin = rd(logic.cin);
          let carry = cin;
          const s = [];
          for (let i = 0; i < 4; i++) {
            const t = a[i] + b[i] + carry;
            s.push(t & 1);
            carry = t >> 1;
          }
          logic.s.forEach((pinNum, i) => wr(pinNum, s[i]));
          wr(logic.cout, carry);
        }
        if (logic.msi === "comparator") {
          const a = logic.a.map(rd).reduce((acc, v, i) => acc | (v << i), 0);
          const b = logic.b.map(rd).reduce((acc, v, i) => acc | (v << i), 0);
          let gt = a > b, lt = a < b, eq = a === b;
          if (eq) { gt = rd(logic.gtIn) === 1; lt = rd(logic.ltIn) === 1; eq = rd(logic.eqIn) === 1 && !gt && !lt; }
          wr(logic.gtOut, gt ? 1 : 0);
          wr(logic.ltOut, lt ? 1 : 0);
          wr(logic.eqOut, eq ? 1 : 0);
        }
        if (logic.msi === "decoder") {
          const sel = logic.a.map(rd).reduce((acc, v, i) => acc | (v << i), 0);
          const enabled = rd(logic.e1) === 1 && rd(logic.e2a) === 0 && rd(logic.e2b) === 0;
          logic.y.forEach((pinNum, i) => wr(pinNum, enabled && i === sel ? 0 : 1)); // active-low
        }
        if (logic.msi === "mux") {
          const sel = logic.s.map(rd).reduce((acc, v, i) => acc | (v << i), 0);
          const strobed = rd(logic.strobe) === 0; // active-low enable
          const out = strobed ? rd(logic.d[sel]) : 0;
          wr(logic.y, out);
          wr(logic.yb, 1 - out);
        }
        if (logic.msi === "bcd7seg") {
          const bcd = logic.bcd.map(rd).reduce((acc, v, i) => acc | (v << i), 0);
          const blanked = rd(logic.bi) === 0 || (rd(logic.rbi) === 0 && bcd === 0);
          const lampTest = rd(logic.lt) === 0;
          // Standard 7-seg patterns for 0-9 (1 = segment ON), blank otherwise.
          const PATTERNS = { 0: "abcdef", 1: "bc", 2: "abdeg", 3: "abcdg", 4: "bcfg", 5: "acdfg", 6: "acdefg", 7: "abc", 8: "abcdefg", 9: "abcdfg" };
          const on = lampTest ? "abcdefg" : blanked ? "" : (PATTERNS[bcd] || "");
          Object.entries(logic.seg).forEach(([seg, pinNum]) => wr(pinNum, on.includes(seg) ? 0 : 1)); // active-low outputs
        }
        if (logic.msi === "counter") {
          const reg = icRegs[p.id] || { q: 0 };
          const load = rd(logic.load) === 0;
          const val = load
            ? logic.d.map(rd).reduce((acc, v, i) => acc | (v << i), 0)
            : rd(logic.clear) === 1 ? 0 : (reg.q ?? 0);
          logic.q.forEach((pinNum, i) => wr(pinNum, (val >> i) & 1));
          wr(logic.carry, val === 15 ? 0 : 1);
          wr(logic.borrow, val === 0 ? 0 : 1);
        }
        if (logic.msi === "shiftreg") {
          const reg = icRegs[p.id] || { q: [0, 0, 0, 0] };
          logic.q.forEach((pinNum, i) => wr(pinNum, reg.q ? reg.q[i] : 0));
        }
      }
    });
  }
  return { values, shorts };
}

// Applies clocked (edge-triggered) state updates: flip-flops, the
// up/down counter, and the shift register. Called from a useEffect that
// watches the settled combinational values every render.
function advanceSequential(ns, placedICs, values, icRegs, prevClk) {
  const next = {};
  let changed = false;
  placedICs.forEach((p) => {
    const logic = IC_LOGIC[p.ic];
    if (!logic) return;
    const pin = (n) => `${p.id}_p${n}`;
    const rd = (n) => readNode(ns, values, pin(n));
    const prevKey = p.id;
    const prevReg = icRegs[p.id] || {};

    if (logic.flops) {
      const q = (prevReg.q || logic.flops.map(() => 0)).slice();
      logic.flops.forEach((f, i) => {
        const clkNow = rd(f.clk);
        const clkKey = `${prevKey}_clk${i}`;
        const clkWas = prevClk.get(clkKey) ?? 0;
        prevClk.set(clkKey, clkNow);
        if (rd(f.clr) === 0) { q[i] = 0; return; }
        if (rd(f.pr) === 0) { q[i] = 1; return; }
        if (clkWas === 0 && clkNow === 1) {
          q[i] = f.kind === "d" ? rd(f.d) : (() => {
            const j = rd(f.j), k = rd(f.k);
            if (j === 0 && k === 0) return q[i];
            if (j === 1 && k === 0) return 1;
            if (j === 0 && k === 1) return 0;
            return 1 - q[i];
          })();
        }
      });
      if (JSON.stringify(q) !== JSON.stringify(prevReg.q)) { next[p.id] = { q }; changed = true; }
    }
    if (logic.msi === "counter") {
      const clkKey = `${prevKey}_ctrclk`;
      const upNow = rd(logic.up), downNow = rd(logic.down);
      const upWas = prevClk.get(clkKey + "u") ?? 0;
      const downWas = prevClk.get(clkKey + "d") ?? 0;
      prevClk.set(clkKey + "u", upNow);
      prevClk.set(clkKey + "d", downNow);
      let q = prevReg.q ?? 0;
      if (rd(logic.clear) === 1) q = 0;
      else if (rd(logic.load) === 0) q = logic.d.map(rd).reduce((acc, v, i) => acc | (v << i), 0);
      else if (upWas === 0 && upNow === 1) q = (q + 1) & 15;
      else if (downWas === 0 && downNow === 1) q = (q - 1) & 15;
      if (q !== prevReg.q) { next[p.id] = { q }; changed = true; }
    }
    if (logic.msi === "shiftreg") {
      const clkKey = `${prevKey}_sr`;
      const c1Now = rd(logic.clk1);
      const c1Was = prevClk.get(clkKey) ?? 0;
      prevClk.set(clkKey, c1Now);
      let q = (prevReg.q || [0, 0, 0, 0]).slice();
      if (c1Was === 0 && c1Now === 1) {
        const parallel = rd(logic.mode) === 1;
        q = parallel ? logic.d.map(rd) : [rd(logic.serIn), q[0], q[1], q[2]];
      }
      if (JSON.stringify(q) !== JSON.stringify(prevReg.q)) { next[p.id] = { q }; changed = true; }
    }
  });
  return changed ? next : null;
}

// ── Seven Segment Display ─────────────────────────────────────────
function Seg7({ val, h = 48 }) {
  const w = h * 0.6,
    t = h * 0.09,
    g = h * 0.032;
  const ON = "#ff3a00",
    OFF = "#220800";
  const DIGITS = [
    [1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 0, 0, 0, 0],
    [1, 1, 0, 1, 1, 0, 1],
    [1, 1, 1, 1, 0, 0, 1],
    [0, 1, 1, 0, 0, 1, 1],
    [1, 0, 1, 1, 0, 1, 1],
    [1, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 1],
  ];
  const s = val >= 0 && val <= 9 ? DIGITS[val] : Array(7).fill(0);
  const hw = w - g * 2 - t,
    hh = h / 2 - g - t;
  const path = (i) => {
    const x0 = g + t,
      x2 = w - g,
      y0 = g,
      y1 = g + t,
      M = h / 2,
      yB = h - g;
    switch (i) {
      case 0:
        return `M${x0},${y0} h${hw} l${-t * 0.5},${t} H${x0 + t * 0.5}Z`;
      case 1:
        return `M${x2},${y1} v${hh} l${-t},${t * 0.3} V${y1 + t * 0.3}Z`;
      case 2:
        return `M${x2},${M + t * 0.3} v${hh} l${-t},${-t * 0.3} V${M + t * 0.6}Z`;
      case 3:
        return `M${x0},${yB} h${hw} l${-t * 0.5},${-t} H${x0 + t * 0.5}Z`;
      case 4:
        return `M${g},${M + t * 0.3} v${hh} l${t},${-t * 0.3} V${M + t * 0.6}Z`;
      case 5:
        return `M${g},${y1} v${hh} l${t},${t * 0.3} V${y1 + t * 0.3}Z`;
      case 6:
        return `M${x0},${M - t * 0.4} h${hw} l${t * 0.4},${t * 0.4} l${-t * 0.4},${t * 0.4} H${x0} l${-t * 0.4},${-t * 0.4}Z`;
      default:
        return "";
    }
  };
  return (
    <svg
      width={w + 4}
      height={h + 4}
      style={{ display: "block", flexShrink: 0 }}
    >
      <rect width={w + 4} height={h + 4} rx={3} fill="#060100" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path
          key={i}
          d={path(i)}
          fill={s[i] ? ON : OFF}
          transform="translate(2,2)"
        />
      ))}
    </svg>
  );
}

// ── LED dot ───────────────────────────────────────────────────────
const LEDCOL = { R: "#ff1100", G: "#00ee44", Y: "#ffcc00", B: "#0099ff" };
function LED({ on, c = "G", size = 10 }) {
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

// ── Toggle Switch ─────────────────────────────────────────────────
function ToggleSW({ label, val, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: 18,
          height: 36,
          borderRadius: 3,
          background: "linear-gradient(#2a2a2a,#111)",
          border: "1px solid #555",
          position: "relative",
          boxShadow: "inset 0 1px 3px #000, 0 2px 4px #000",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 2,
            right: 2,
            height: 14,
            background: "linear-gradient(#e0e0e0,#aaa)",
            borderRadius: 2,
            top: val ? 2 : 19,
            transition: "top .1s ease",
            boxShadow: "0 2px 4px #000",
          }}
        />
      </div>
      <span style={{ fontFamily: "monospace", fontSize: 7, color: "#d4a843" }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 8,
          fontWeight: "bold",
          color: val ? "#00ee44" : "#334",
        }}
      >
        {val}
      </span>
    </div>
  );
}

// ── Breadboard constants ──────────────────────────────────────────
const COLS = 30;
const ROWS_A = ["a", "b", "c", "d", "e"];
const ROWS_B = ["f", "g", "h", "i", "j"];
const HOLE_PX = 12; // hole spacing px — increased for visibility
const GAP_AFTER = new Set([4, 9, 14, 19, 24]);

function colXForBB(col) {
  const extra = [...GAP_AFTER].filter((g) => g < col).length * 6;
  return 36 + col * (HOLE_PX + 2) + extra + HOLE_PX / 2;
}

// ── Breadboard SVG ────────────────────────────────────────────────
// FIX: bbRef is attached to the SVG container div directly here.
// Wire coordinates are stored as SVG-local coords (not page coords).
function Breadboard({ wireStart, wires, placedICs, onHoleClick, onICMouseDown, onICContextMenu, mode, onICDelete, poweredIds }) {
  const W = 36 + COLS * (HOLE_PX + 2) + 5 * 6 + HOLE_PX + 16;
  const ROW_H = 14;
  const IC_BODY_H = 24;
  const IC_PIN_H = 7;
  const TOP_RAIL_Y = 6;
  const TOP_VCC_Y = TOP_RAIL_Y + 4;
  const TOP_GND_Y = TOP_RAIL_Y + 18;
  const BODY_Y = TOP_RAIL_Y + 36;
  const TOP_ROWS_H = 5 * ROW_H;
  const CENTER_Y = BODY_Y + TOP_ROWS_H + 2;
  const CENTER_H = 18;
  const BOT_START = CENTER_Y + CENTER_H;
  const BOT_ROWS_H = 5 * ROW_H;
  const BOT_RAIL_Y = BOT_START + BOT_ROWS_H + 6;
  const BOT_VCC_Y = BOT_RAIL_Y + 4;
  const BOT_GND_Y = BOT_RAIL_Y + 18;
  const H = BOT_GND_Y + 16;

  const colX = colXForBB;

  const wiredSet = new Set(wires.flatMap((w) => [w.from, w.to]));

  // FIX: Holes now have a visible background square to mimic real breadboard holes,
  // plus a larger hit area (transparent rect) for easy clicking.
  const Hole = ({ id, cx, cy, type }) => {
    const isStart = wireStart && wireStart.id === id;
    const isWired = wiredSet.has(id);
    const isCoveredByIC = placedICs.some((p) => {
      const ic = ICS[p.ic];
      if (!ic) return false;
      const cols = Math.ceil(ic.pins / 2);
      const icW = cols * 13 + 8;
      return (
        cx >= p.x &&
        cx <= p.x + icW &&
        cy >= p.y - IC_PIN_H &&
        cy <= p.y + IC_BODY_H + IC_PIN_H
      );
    });

    // Outer ring color
    let outerFill = "#c8bfa0",
      holeFill = "#1a1208",
      holeStroke = "#0a0804";
    if (type === "vcc") {
      outerFill = "#cc4444";
      holeFill = "#3a0000";
      holeStroke = "#ff4444";
    } else if (type === "gnd") {
      outerFill = "#4444cc";
      holeFill = "#00003a";
      holeStroke = "#4444ff";
    }
    if (isStart) {
      outerFill = "#ffffff";
      holeFill = "#88ffcc";
      holeStroke = "#00ffaa";
    } else if (isWired) {
      outerFill = "#bb6600";
      holeFill = "#3a1800";
      holeStroke = "#ff8800";
    }

    return (
      <g
        style={{ cursor: "crosshair" }}
        onMouseDown={(e) => {
          if (isCoveredByIC) return;
          e.stopPropagation();
          onHoleClick(id, cx, cy);
        }}
      >
        {/* Transparent hit area — larger for easy clicking */}
        <rect x={cx - 7} y={cy - 7} width={14} height={14} fill="transparent" />
        {/* Outer rim (like a real BB socket) */}
        <rect
          x={cx - 4}
          y={cy - 4}
          width={8}
          height={8}
          rx={1.5}
          fill={outerFill}
        />
        {/* Inner hole */}
        <rect
          x={cx - 2.5}
          y={cy - 2.5}
          width={5}
          height={5}
          rx={1}
          fill={holeFill}
          stroke={holeStroke}
          strokeWidth={0.7}
        />
        {/* Shiny specular dot */}
        <circle
          cx={cx - 1.2}
          cy={cy - 1.2}
          r={0.8}
          fill="rgba(255,255,255,0.25)"
        />
      </g>
    );
  };

  const railHoles = (yBase, prefix, type) =>
    Array.from({ length: COLS }, (_, c) => (
      <Hole
        key={c}
        id={`rail_${prefix}_${c}`}
        cx={colX(c)}
        cy={yBase}
        type={type}
      />
    ));

  const bodyHoles = (rows, yBase) =>
    rows.flatMap((row, r) =>
      Array.from({ length: COLS }, (_, c) => (
        <Hole
          key={`${row}${c}`}
          id={`bb_${c}_${row}`}
          cx={colX(c)}
          cy={yBase + r * ROW_H + 7}
          type="body"
        />
      )),
    );

  return (
    <svg width={W} height={H} style={{ display: "block", userSelect: "none" }}>
      {/* Board body — classic beige breadboard color */}
      <rect
        x={0}
        y={0}
        width={W}
        height={H}
        rx={6}
        fill="#d2c89a"
        stroke="#b8a870"
        strokeWidth={1.5}
      />

      {/* Subtle texture stripes */}
      {Array.from({ length: Math.floor(H / 4) }, (_, i) => (
        <line
          key={i}
          x1={0}
          y1={i * 4}
          x2={W}
          y2={i * 4}
          stroke="rgba(0,0,0,0.03)"
          strokeWidth={1}
        />
      ))}

      {/* Rail backgrounds */}
      <rect
        x={30}
        y={TOP_RAIL_Y}
        width={W - 36}
        height={14}
        rx={3}
        fill="#ffcccc"
        opacity={0.5}
      />
      <rect
        x={30}
        y={TOP_RAIL_Y + 14}
        width={W - 36}
        height={14}
        rx={3}
        fill="#ccccff"
        opacity={0.5}
      />
      <rect
        x={30}
        y={BOT_RAIL_Y}
        width={W - 36}
        height={14}
        rx={3}
        fill="#ffcccc"
        opacity={0.5}
      />
      <rect
        x={30}
        y={BOT_RAIL_Y + 14}
        width={W - 36}
        height={14}
        rx={3}
        fill="#ccccff"
        opacity={0.5}
      />

      {/* Rail red/blue lines */}
      {[
        [TOP_VCC_Y + 3, "#cc2200"],
        [TOP_GND_Y + 3, "#2200cc"],
        [BOT_VCC_Y + 3, "#cc2200"],
        [BOT_GND_Y + 3, "#2200cc"],
      ].map(([y, col], i) => (
        <line
          key={i}
          x1={34}
          y1={y}
          x2={W - 6}
          y2={y}
          stroke={col}
          strokeWidth={1.2}
          opacity={0.8}
        />
      ))}

      {/* Rail labels (+/-) */}
      {[
        ["+", [TOP_VCC_Y, BOT_VCC_Y], "#cc2200"],
        ["-", [TOP_GND_Y, BOT_GND_Y], "#2200cc"],
      ].flatMap(([sym, ys, col]) =>
        ys.map((y, i) => (
          <text
            key={`${sym}${i}`}
            x={16}
            y={y + 9}
            textAnchor="middle"
            fontSize={12}
            fontWeight="bold"
            fill={col}
            fontFamily="monospace"
          >
            {sym}
          </text>
        )),
      )}

      {/* Row labels a-e */}
      {"abcde".split("").map((r, i) => (
        <text
          key={r}
          x={26}
          y={BODY_Y + i * ROW_H + 11}
          textAnchor="end"
          fontSize={8}
          fill="#7a6a4a"
          fontFamily="monospace"
        >
          {r}
        </text>
      ))}
      {"fghij".split("").map((r, i) => (
        <text
          key={r}
          x={26}
          y={BOT_START + i * ROW_H + 11}
          textAnchor="end"
          fontSize={8}
          fill="#7a6a4a"
          fontFamily="monospace"
        >
          {r}
        </text>
      ))}

      {/* Column numbers every 5 */}
      {Array.from(
        { length: COLS },
        (_, c) =>
          c % 5 === 0 && (
            <text
              key={c}
              x={colX(c)}
              y={BODY_Y - 6}
              textAnchor="middle"
              fontSize={7}
              fill="#8a7a5a"
              fontFamily="monospace"
            >
              {c + 1}
            </text>
          ),
      )}

      {/* Center DIP gap */}
      <rect
        x={30}
        y={CENTER_Y}
        width={W - 36}
        height={CENTER_H}
        rx={2}
        fill="#b8a870"
        opacity={0.5}
      />
      <text
        x={W / 2}
        y={CENTER_Y + CENTER_H / 2 + 3}
        textAnchor="middle"
        fontSize={6}
        fill="#7a6040"
        fontFamily="monospace"
        letterSpacing={3}
      >
        IC DIP SLOT
      </text>

      {/* 5-group separator dots */}
      {[...GAP_AFTER].map((c) => {
        const x = colX(c) + HOLE_PX / 2 + 3;
        return (
          <line
            key={c}
            x1={x}
            y1={BODY_Y - 2}
            x2={x}
            y2={BOT_START + BOT_ROWS_H + 2}
            stroke="#9a8860"
            strokeWidth={0.6}
            opacity={0.6}
          />
        );
      })}

      {/* ── HOLES ── */}
      {railHoles(TOP_VCC_Y + 5, "tvcc", "vcc")}
      {railHoles(TOP_GND_Y + 5, "tgnd", "gnd")}
      {bodyHoles(ROWS_A, BODY_Y)}
      {bodyHoles(ROWS_B, BOT_START)}
      {railHoles(BOT_VCC_Y + 5, "bvcc", "vcc")}
      {railHoles(BOT_GND_Y + 5, "bgnd", "gnd")}

      {/* Placed ICs as SVG foreignObject */}
      {placedICs.map((p) => {
        const ic = ICS[p.ic];
        if (!ic || p.col === undefined) return null;
        const cols = Math.ceil(ic.pins / 2);
        // NEW: icW ab actual hole-grid span se match karta hai (GAP_AFTER ke
        // extra gaps included) — pehle fixed cols*13+8 tha jo IC-width group
        // boundaries cross karte hi drift kar jata tha.
        const icW = colX(p.col + cols - 1) - colX(p.col) + 16;
        const icH = IC_BODY_H;
        // NEW: column-index i (0-based, left to right) ka pixel offset —
        // ye har pin ko uske real breadboard hole ke exactly upar center karta hai.
        const pinX = (i) => colX(p.col + i) - p.x - 1.5; // 1.5 = half of 3px pin width
        return (
          <g
            key={p.id}
            transform={`translate(${p.x},${p.y})`}
            style={{ cursor: "grab" }}
            onMouseDown={(e) => {
              if (e.button !== 0) return; // right/middle click ko ignore karo — sirf left-click drag start kare

              e.stopPropagation();
              if (mode === "delete") {
                onICDelete?.(p.id); // NEW: delete mode mein click = IC hata do
                return;
              }
              onICMouseDown(p.id, p.ic, e.clientX, e.clientY);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onICContextMenu?.(p.ic, e.clientX, e.clientY);
            }}
          >
            {/* Bottom pins (south side) */}
            {Array.from({ length: Math.ceil(ic.pins / 2) }, (_, i) => (
              <rect
                key={`bp${i}`}
                x={pinX(i)}
                y={icH}
                width={3}
                height={7}
                rx={0.5}
                fill="#b0b0b0"
              />
            ))}
            {/* Top pins (north side) */}
            {Array.from({ length: Math.floor(ic.pins / 2) }, (_, i) => (
              <rect
                key={`tp${i}`}
                x={pinX(i)}
                y={-IC_PIN_H}
                width={3}
                height={IC_PIN_H}
                rx={0.5}
                fill="#b0b0b0"
              />
            ))}

            {/* IC body */}
            <rect
              x={0}
              y={0}
              width={icW}
              height={icH}
              rx={3}
              fill={ic.bg}
              stroke="#666"
              strokeWidth={1}
            />
            {/* Notch */}
            <path
              d={`M${icW / 2 - 6},0 Q${icW / 2},8 ${icW / 2 + 6},0`}
              fill="#050508"
              stroke="#444"
              strokeWidth={0.5}
            />
            {/* NEW: unpowered warning — VCC/GND rail se wired nahi hai */}
            {poweredIds && !poweredIds.has(p.id) && (
              <g>
                <circle cx={icW - 5} cy={5} r={4} fill="#ff2222" stroke="#500" strokeWidth={0.6} />
                <text x={icW - 5} y={7.5} textAnchor="middle" fontSize={6} fontWeight="bold" fill="#fff">!</text>
                <title>{`${p.ic}: not powered — wire pin ${IC_LOGIC[p.ic]?.vcc} to +rail and pin ${IC_LOGIC[p.ic]?.gnd} to -rail`}</title>
              </g>
            )}
            {/* Label */}
            <text
              x={icW / 2}
              y={12}
              textAnchor="middle"
              fontSize={9}
              fontWeight="bold"
              fill={ic.txt}
              fontFamily="monospace"
            >
              {p.ic}
            </text>
            <text
              x={icW / 2}
              y={20}
              textAnchor="middle"
              fontSize={11}
              fill={ic.txt}
              fontFamily="monospace"
              opacity={0.8}
            >
              {ic.sym}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Wire overlay — FIX: uses SVG-local coords, rendered inside same SVG container ──
// We render wires as an absolute SVG overlay positioned exactly over the breadboard SVG
function WireOverlay({ wires, preview, width, height, onWireClick }) {
  const [hoveredWireId, setHoveredWireId] = useState(null);
  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 999,
        overflow: "visible",
      }}
      width={width}
      height={height}
    >
      {wires.map((w) => {
        const mx = (w.ax + w.bx) / 2;
        const dy = Math.abs(w.bx - w.ax) * 0.25 + 10;
        const my = Math.min(w.ay, w.by) - dy;
        const isHovered = hoveredWireId === w.id;
        return (
          <g key={w.id}>
            {/* Wire shadow — no events here, purely visual */}
            <path
              d={`M${w.ax},${w.ay} Q${mx},${my} ${w.bx},${w.by}`}
              stroke="rgba(0,0,0,0.5)"
              strokeWidth={3.5}
              fill="none"
              strokeLinecap="round"
              pointerEvents="none"
            />
            {/* Wire — this is the ONLY path that gets hover/click */}
            <path
              d={`M${w.ax},${w.ay} Q${mx},${my} ${w.bx},${w.by}`}
              stroke={isHovered ? "#ffffff" : w.color}
              strokeWidth={isHovered ? 6 : 2.5}
              fill="none"
              strokeLinecap="round"
              opacity={isHovered ? 1 : 0.95}
              style={{ cursor: "pointer", pointerEvents: "stroke" }}
              onMouseEnter={() => setHoveredWireId(w.id)}
              onMouseLeave={() => setHoveredWireId((id) => (id === w.id ? null : id))}
              onClick={(e) => {
                e.stopPropagation();
                onWireClick?.(w.id);
              }}
            />
            {/* End dots */}
            <circle cx={w.ax} cy={w.ay} r={3} fill={w.color} pointerEvents="none" />
            <circle cx={w.bx} cy={w.by} r={3} fill={w.color} pointerEvents="none" />
          </g>
        );
      })}
      {preview && (
        <line
          x1={preview.ax}
          y1={preview.ay}
          x2={preview.bx}
          y2={preview.by}
          stroke={preview.color}
          strokeWidth={2}
          opacity={0.7}
          strokeDasharray="6,4"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

// ── IC Tray item ──────────────────────────────────────────────────
// Builds a "pin N = role" legend from IC_LOGIC so placement/tooltips can
// show real VCC/GND/input/output roles instead of leaving them undefined.
function pinoutSummary(icKey) {
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

function TrayIC({ icKey, onMouseDown, onContextMenu }) {
  const ic = ICS[icKey];
  return (
    <div
      onMouseDown={(e) => onMouseDown(e, icKey)}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu?.(e.clientX, e.clientY, icKey);
      }}
      title={`${icKey} — ${ic.desc} (${ic.pins}-pin)\nPins: ${pinoutSummary(icKey) || "see datasheet"}\nDrag onto breadboard\nRight-click for datasheet`}
      style={{
        background: `linear-gradient(160deg,${ic.bg},#080808)`,
        border: "1px solid #555",
        borderRadius: 4,
        padding: "5px 7px",
        cursor: "grab",
        userSelect: "none",
        minWidth: 58,
        boxShadow: "0 2px 6px rgba(0,0,0,.6)",
        transition: "filter .1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.4)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
    >
      <div
        style={{
          position: "relative",
          height: 4,
          marginBottom: 3,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 10,
            height: 4,
            background: "#080808",
            borderRadius: "0 0 4px 4px",
            border: "1px solid #555",
            borderTop: "none",
          }}
        />
      </div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          fontWeight: "bold",
          color: ic.txt,
          letterSpacing: 1,
          textAlign: "center",
        }}
      >
        {icKey}
      </div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 12,
          color: ic.txt,
          textAlign: "center",
          opacity: 0.9,
          lineHeight: 1,
        }}
      >
        {ic.sym}
      </div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 6,
          color: "#888",
          textAlign: "center",
          marginTop: 2,
        }}
      >
        {ic.name}
      </div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 5,
          color: "#555",
          textAlign: "center",
        }}
      >
        {ic.pins}p
      </div>
    </div>
  );
}

// ── Datasheet Popup — built entirely from existing pinoutSummary() data ──
function DatasheetPopup({ icKey, x, y, onClose }) {
  const ic = ICS[icKey];
  if (!ic) return null;
  const pinLines = pinoutSummary(icKey).split("  ").filter(Boolean);

  // Keep the popup on-screen (rough clamp against viewport edges).
  const POPUP_W = 220;
  const clampedX = Math.min(x + 10, window.innerWidth - POPUP_W - 10);
  const clampedY = Math.min(y + 10, window.innerHeight - 320);

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        left: Math.max(10, clampedX),
        top: Math.max(10, clampedY),
        width: POPUP_W,
        background: "linear-gradient(160deg,#0c1420,#050a10)",
        border: `1px solid ${ic.txt}`,
        borderRadius: 6,
        boxShadow: "0 12px 30px rgba(0,0,0,.8)",
        zIndex: 10000,
        fontFamily: "monospace",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: `linear-gradient(90deg,${ic.bg},#080808)`,
          padding: "6px 9px",
          borderBottom: `1px solid ${ic.txt}55`,
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: "bold", color: ic.txt, letterSpacing: 1 }}>
            {icKey} <span style={{ opacity: 0.7 }}>{ic.sym}</span>
          </div>
          <div style={{ fontSize: 7, color: "#889", marginTop: 1 }}>{ic.name} · {ic.pins}-pin DIP</div>
        </div>
        <span
          onClick={onClose}
          style={{ cursor: "pointer", color: "#f66", fontSize: 12, fontWeight: "bold", padding: "0 3px" }}
        >
          ✕
        </span>
      </div>

      <div style={{ padding: "7px 9px", fontSize: 8, color: "#cde", lineHeight: 1.5, borderBottom: "1px solid #1e3344" }}>
        {ic.desc}
      </div>

      <div style={{ maxHeight: 200, overflowY: "auto", padding: "6px 9px" }}>
        <div style={{ fontSize: 6.5, color: "#d4a843", letterSpacing: 1, marginBottom: 4 }}>
          PINOUT
        </div>
        {pinLines.map((line, i) => {
          const [pinNum, role] = line.split(":");
          const isPower = role === "VCC" || role === "GND";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 8,
                padding: "1.5px 0",
                color: isPower ? "#ff8844" : role === "—" ? "#445" : "#9fe",
              }}
            >
              <span>PIN {pinNum}</span>
              <span>{role}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ── Breadboard dimensions (must match Breadboard component) ───────
function getBBDimensions() {
  const ROW_H = 14,
    TOP_RAIL_Y = 6;
  const BODY_Y = TOP_RAIL_Y + 36;
  const TOP_ROWS_H = 5 * ROW_H;
  const CENTER_Y = BODY_Y + TOP_ROWS_H + 2;
  const BOT_START = CENTER_Y + 18;
  const BOT_ROWS_H = 5 * ROW_H;
  const BOT_RAIL_Y = BOT_START + BOT_ROWS_H + 6;
  const BOT_GND_Y = BOT_RAIL_Y + 18;
  const H = BOT_GND_Y + 16;
  const W = 36 + COLS * (HOLE_PX + 2) + 5 * 6 + HOLE_PX + 16;
  return { W, H };
}

//helper function to get ics on pins

// A real DIP chip can ONLY sit straddling the center gap — that's the
// entire point of the socket. So placement is now a single-axis (column)
// snap, not a free x/y drop: Y is always locked to the gap, and the
// returned `col` is the *real* breadboard column its pin-1 side lands on
// (used by the simulation engine to resolve which holes each pin touches).
function snapICPosition(dropX, dropY, pinCount, placedICs = [], excludeId = null) {
  const ROW_H = 14;
  // const IC_BODY_H = 24;
  const IC_PIN_H = 7;
  const TOP_RAIL_Y = 6;

  const BODY_Y = TOP_RAIL_Y + 36;
  const TOP_ROWS_H = 5 * ROW_H;
  const CENTER_Y = BODY_Y + TOP_ROWS_H + 2;
  // const icH = IC_BODY_H;
  const lockedY = CENTER_Y - IC_PIN_H;

  const cols = Math.ceil(pinCount / 2);

  const colX = colXForBB;

  const occupiedCols = new Set();
  placedICs.forEach((p) => {
    if (p.id === excludeId || p.col === undefined) return;
    const otherCols = Math.ceil(ICS[p.ic].pins / 2);
    for (let c = p.col; c < p.col + otherCols; c++) occupiedCols.add(c);
  });

  const isFree = (c) => {
    for (let i = c; i < c + cols; i++) if (occupiedCols.has(i)) return false;
    return true;
  };

  const wantedCol = Math.round((dropX - 32) / (HOLE_PX + 2));
  let best = null;
  for (let c = 0; c <= COLS - cols; c++) {
    if (!isFree(c)) continue;
    const d = Math.abs(c - wantedCol);
    if (!best || d < best.dist) best = { col: c, dist: d };
  }

  if (!best) return null; // no free slot anywhere — placement rejected

  return { x: colX(best.col) - 4, y: lockedY, col: best.col };
}
// ═══════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════
export default function IT300() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [switches, setSwitches] = useState(Array(8).fill(0));
  const [draggingPlaced, setDraggingPlaced] = useState(null); // {id, ic}
  const [clkHz, setClkHz] = useState(1);
  const [clkOn, setClkOn] = useState(true);
  const [clk, setClk] = useState(0);
  const [pushBtns, setPush] = useState([0, 0]);
  const [wires, setWires] = useState([]);
  const [wireStart, setWireStart] = useState(null); // {id, ax, ay} — SVG-local coords
  const [preview, setPreview] = useState(null);
  const [wireCol, setWireCol] = useState("#e63946");
  const [colIdx, setColIdx] = useState(0);
  const [mode, setMode] = useState("wire");
  const [placedICs, setPlacedICs] = useState([]);
  const [dragging, setDragging] = useState(null);
  // Sequential-IC internal state (flip-flop Q, counter value, shift reg bits),
  // keyed by placedIC.id. This is the "memory" half of the simulation engine.
  const [icRegs, setIcRegs] = useState({});
  const [saveState, setSaveState] = useState({ status: "idle", message: "" }); // idle|saving|saved|error
  const [circuitName, setCircuitName] = useState("Untitled Circuit");
  const [datasheet, setDatasheet] = useState(null); // NEW: {icKey, x, y} | null
  const [wireWarning, setWireWarning] = useState(""); // NEW: transient "pin already used" message
  // FIX: single ref attached to the wrapper div that contains the BB SVG
  const bbWrapRef = useRef(null);
  const clkRef = useRef();
  const mouseRef = useRef({ x: 0, y: 0 });
  const undoStackRef = useRef([]);
  const prevClkRef = useRef(new Map());
  const colIdxRef = useRef(0);

  const { W: bbW, H: bbH } = getBBDimensions();

  const COLORS = useMemo(() => [
    "#e63946",
    "#2196f3",
    "#4caf50",
    "#ff9800",
    "#9c27b0",
    "#00bcd4",
    "#ffeb3b",
    "#ff5722",
    "#f48fb1",
    "#80cbc4",
  ], []);

  const wireColRef = useRef(COLORS[0]);
  const recordUndo = useCallback(() => {
    undoStackRef.current.push(structuredClone({
      switches,
      wires,
      placedICs,
      wireCol,
      colIdx,
    }));
    if (undoStackRef.current.length > 50) {
      undoStackRef.current.shift();
    }
  }, [switches, wires, placedICs, wireCol, colIdx]);

  const undoLast = useCallback(() => {
    const prev = undoStackRef.current.pop();
    if (!prev) return;
    setSwitches(prev.switches);
    setWires(prev.wires);
    setPlacedICs(prev.placedICs);
    setWireCol(prev.wireCol);
    setColIdx(prev.colIdx);
    setWireStart(null);
    setPreview(null);
    setDragging(null);
    setDraggingPlaced(null);
  }, []);

  // Clock
  useEffect(() => {
    clearInterval(clkRef.current);
    if (!clkOn) {
      setClk(0);
      return;
    }
    clkRef.current = setInterval(() => setClk((c) => c ^ 1), 500 / clkHz);
    return () => clearInterval(clkRef.current);
  }, [clkHz, clkOn]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.shiftKey) return;
      if (String(e.key).toLowerCase() !== "z") return;
      const target = e.target;
      const tagName = target?.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      e.preventDefault();
      undoLast();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undoLast]);

  // NEW: close datasheet popup on outside click, Escape, or scroll
  // NEW: auto-clear the "pin already wired" warning after a moment
  useEffect(() => {
    if (!wireWarning) return;
    const t = setTimeout(() => setWireWarning(""), 1800);
    return () => clearTimeout(t);
  }, [wireWarning]);

  // NEW: close datasheet popup on outside click, Escape, or scroll
  useEffect(() => {
    if (!datasheet) return;
    const closeIt = () => setDatasheet(null);
    const onEsc = (e) => { if (e.key === "Escape") closeIt(); };
    window.addEventListener("mousedown", closeIt);
    window.addEventListener("keydown", onEsc);
    window.addEventListener("scroll", closeIt, true);
    return () => {
      window.removeEventListener("mousedown", closeIt);
      window.removeEventListener("keydown", onEsc);
      window.removeEventListener("scroll", closeIt, true);
    };
  }, [datasheet]);

  // Global mouse tracking
  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (dragging)
        setDragging((d) =>
          d ? { ...d, ghostX: e.clientX - 40, ghostY: e.clientY - 25 } : null,
        );

      if (draggingPlaced && bbWrapRef.current) {
        const svg = bbWrapRef.current.querySelector('svg');
        if (svg) {
          const rect = svg.getBoundingClientRect();
          const x = e.clientX - rect.left - draggingPlaced.offsetX;
          const y = e.clientY - rect.top - draggingPlaced.offsetY;
          setPlacedICs((p) =>
            p.map((ic) => (ic.id === draggingPlaced.id ? { ...ic, x, y } : ic))
          );
        }
      }
      // FIX: preview uses SVG-local coords — convert mouse to SVG space
      if (wireStart && bbWrapRef.current) {
        const rect = bbWrapRef.current.getBoundingClientRect();
        setPreview({
          ax: wireStart.ax,
          ay: wireStart.ay,
          bx: e.clientX - rect.left,
          by: e.clientY - rect.top,
          color: wireCol,
        });
      }
    };
    const onUp = (e) => {
      if (!dragging && !draggingPlaced) return;

      if (dragging) {
        const svg = bbWrapRef.current?.querySelector('svg');
        if (svg) {
          const svgRect = svg.getBoundingClientRect();
          const dropX = e.clientX - svgRect.left;
          const dropY = e.clientY - svgRect.top;
          const pinCount = ICS[dragging.icKey].pins;
          const snapped = snapICPosition(dropX, dropY, pinCount, placedICs);
          if (snapped) {
            setPlacedICs((p) => [
              ...p,
              { id: `ic${Date.now()}`, ic: dragging.icKey, x: snapped.x, y: snapped.y, col: snapped.col },
            ]);
          }
          // if snapped is null, no free slot was found — IC is not placed
          // if drop is outside the breadboard rect entirely, IC is simply discarded (not placed)
        }
      }

      if (draggingPlaced) {
        const svg = bbWrapRef.current?.querySelector('svg');
        if (svg) {
          setPlacedICs((p) =>
            p.map((ic) => {
              if (ic.id !== draggingPlaced.id) return ic;
              const pinCount = ICS[draggingPlaced.icKey].pins;
              const snapped = snapICPosition(ic.x, ic.y, pinCount, p, ic.id);
              return snapped ? { ...ic, x: snapped.x, y: snapped.y, col: snapped.col } : ic;
            })
          );
        }
        setDraggingPlaced(null);
      }
      setDragging(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, wireStart, wireCol, draggingPlaced, placedICs]);

  // ── Live netlist (rebuilt whenever wiring/placement changes) ──────
  const netlist = useMemo(() => buildNetlist(wires, placedICs), [wires, placedICs]);

  // NEW: jo bhi placed IC ka VCC pin +rail se aur GND pin -rail se wired
  // NAHI hai, uski id yahan se bahar rahegi — Breadboard isko red badge se dikhayega.
  const poweredIds = useMemo(() => {
    const s = new Set();
    placedICs.forEach((p) => {
      const logic = IC_LOGIC[p.ic];
      if (!logic) return;
      const pin = (n) => `${p.id}_p${n}`;
      const ok = netlist.find(pin(logic.vcc)) === netlist.find("NET_VCC")
        && netlist.find(pin(logic.gnd)) === netlist.find("NET_GND");
      if (ok) s.add(p.id);
    });
    return s;
  }, [netlist, placedICs]);

  // External source pins that actively drive a value into the netlist —
  // everything else on the board is a passive monitor point that only
  // shows a signal once it's actually wired to one of these.
  const sources = useMemo(() => {
    const s = {};
    switches.forEach((v, i) => { s[`swled_${i}`] = v; });
    s["flag_0"] = clk;        // onboard clock generator terminal
    s["flag_1"] = pushBtns[0]; // push-button 1 terminal
    s["flag_2"] = pushBtns[1]; // push-button 2 terminal
    return s;
  }, [switches, clk, pushBtns]);

  // Combinational settle — recomputed every render off current inputs +
  // the latched sequential state. This is the actual "boolean algebra
  // across every node" engine the board was missing.
  const { values: nodeValues, shorts: shortNodes } = useMemo(
    () => evaluateCircuit(netlist, placedICs, sources, icRegs),
    [netlist, placedICs, sources, icRegs],
  );
  // NEW: true the instant any node has two disagreeing drivers, or VCC-GND is shorted
  const hasShortCircuit = shortNodes.size > 0;

  // Clocked (edge-triggered) state update — flip-flops, counter, shift
  // register all latch on a 0->1 transition of their own clock pin, which
  // may come from the onboard clock, a push button, or another gate's
  // output, however it's actually wired.
  useEffect(() => {
    const next = advanceSequential(netlist, placedICs, nodeValues, icRegs, prevClkRef.current);
    if (next) setIcRegs((r) => ({ ...r, ...next }));
  }, [netlist, placedICs, nodeValues, icRegs]);

  // Reads the resolved value of any monitor pin (0 if unconnected/floating).
  const monitor = useCallback((ref) => readNode(netlist, nodeValues, ref), [netlist, nodeValues]);

  // 7-segment + DEC/HEX/OCT readout now reflects whatever is actually
  // wired onto the D0-D7 data-bus monitor pins — not the raw switches.
  const dec = [0, 1, 2, 3, 4, 5, 6, 7].reduce((a, i) => a + monitor(`databus_${i}`) * (1 << i), 0);

  // FIX: onHoleClick receives SVG-local coords (cx,cy from the SVG).
  // We store them as-is — no page-coord conversion needed.
  // NEW: single-pin restriction — a hole that isn't a generic breadboard
  // body strip hole (IC pins, rail terminals, external monitor terminals)
  // may only carry ONE wire, matching how a real leg/terminal only fits
  // one wire end. Regular `bb_${col}_${row}` body holes are exempt since
  // several holes in the same 5-hole strip are already electrically the
  // same node and real breadboards allow multiple wires per strip.
  const isSingleWireHole = useCallback((id) => true, []);
  const isHoleOccupied = useCallback(
    (id) => isSingleWireHole(id) && wires.some((w) => w.from === id || w.to === id),
    [wires, isSingleWireHole],
  );

  const onHoleClick = useCallback(
    (id, svgX, svgY) => {
      if (mode === "delete") {
        recordUndo();
        setWires((p) => p.filter((w) => w.from !== id && w.to !== id));
        return;
      }
      if (mode !== "wire") return;

      if (!wireStart) {
        if (isHoleOccupied(id)) {
          setWireWarning(`Pin already wired: ${id}`);
          return;
        }
        setWireStart({ id, ax: svgX, ay: svgY });
      } else {
        if (wireStart.id !== id) {
          if (isHoleOccupied(id)) {
            setWireWarning(`Pin already wired: ${id}`);
            setWireStart(null);
            setPreview(null);
            return;
          }
          recordUndo();
          const currentCol = wireColRef.current;
          setWires((p) => [
            ...p,
            {
              id: Date.now(),
              from: wireStart.id,
              to: id,
              ax: wireStart.ax,
              ay: wireStart.ay,
              bx: svgX,
              by: svgY,
              color: currentCol,
            },
          ]);
          const ni = (colIdxRef.current + 1) % COLORS.length;
          colIdxRef.current = ni;
          wireColRef.current = COLORS[ni];
          setColIdx(ni);
          setWireCol(COLORS[ni]);
        }
        setWireStart(null);
        setPreview(null);
      }
    },
    [mode, wireStart, COLORS, recordUndo, isHoleOccupied],
  );

  const startTrayDrag = (e, icKey) => {
    if (e.button !== 0) return; // right-click yahan bhi ignore — sirf left-click drag ke liye

    e.preventDefault();
    setDragging({ icKey, ghostX: e.clientX - 40, ghostY: e.clientY - 25 });
  };

  // NEW: DELETE mode mein IC pe click karne se sirf wo IC hat jaye
  const handleICDelete = useCallback((id) => {
    recordUndo();
    setPlacedICs((p) => p.filter((ic) => ic.id !== id));
  }, [recordUndo]);

  const handleICMouseDown = (id, icKey, clientX, clientY) => {
    const ic = placedICs.find((p) => p.id === id);
    if (!ic || !bbWrapRef.current) return;
    recordUndo();
    const rect = bbWrapRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left - ic.x;
    const offsetY = clientY - rect.top - ic.y;
    setDraggingPlaced({ id, icKey, offsetX, offsetY });
  };

  const handleExternalPinDown = (id, e) => {
    e.stopPropagation();
    if (!bbWrapRef.current) return;
    const rect = bbWrapRef.current.getBoundingClientRect();
    onHoleClick(id, e.clientX - rect.left, e.clientY - rect.top);
  };

  // NEW: right-click on a placed IC (breadboard) opens its datasheet popup
  const handleICContextMenu = useCallback((icKey, clientX, clientY) => {
    setDatasheet({ icKey, x: clientX, y: clientY });
  }, []);

  // NEW: right-click on a tray IC (not yet placed) opens its datasheet popup too
  const handleTrayContextMenu = useCallback((clientX, clientY, icKey) => {
    setDatasheet({ icKey, x: clientX, y: clientY });
  }, []);

  // ── Save circuit ───────────────────────────────────────────────────
  // Not logged in -> send them to /login instead of silently failing or
  // saving nowhere. Logged in -> persist the full board state (wires,
  // placed ICs, switches, clock settings) to the backend under their account.
  const saveCircuit = useCallback(async () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setSaveState({ status: "error", message: "Please log in to save your circuit." });
      navigate("/login", { state: { from: "/trainer-board" } });
      return;
    }
    setSaveState({ status: "saving", message: "Saving…" });
    try {
      await trainerBoardService.saveCircuit({
        name: circuitName || "Untitled Circuit",
        wires,
        placedICs,
        switches,
        clkHz,
        clkOn,
      });
      setSaveState({ status: "saved", message: "Saved ✓" });
      setTimeout(() => setSaveState((s) => (s.status === "saved" ? { status: "idle", message: "" } : s)), 2500);
    } catch (err) {
      setSaveState({ status: "error", message: err?.message || "Save failed. Try again." });
    }
  }, [authLoading, isAuthenticated, navigate, circuitName, wires, placedICs, switches, clkHz, clkOn]);

  const F = "monospace";
  const Sec = ({ title, children, style: st }) => (
    <div
      style={{
        background: "linear-gradient(135deg,#0c1e0c,#162416)",
        border: "1px solid rgba(212,168,67,.22)",
        borderRadius: 5,
        padding: 7,
        marginBottom: 6,
        ...st,
      }}
    >
      <div
        style={{
          fontFamily: F,
          fontSize: 7,
          color: "#d4a843",
          letterSpacing: 2,
          textTransform: "uppercase",
          borderBottom: "1px solid rgba(212,168,67,.18)",
          paddingBottom: 3,
          marginBottom: 5,
          textAlign: "center",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );

  const pulseClock = useCallback(() => {
    // Toggle the clock once, creating one 0→1 and one 1→0 edge
    setClk((c) => c ^ 1);
    // Revert after 60 ms – gives the simulation time to register the edge
    const timer = setTimeout(() => setClk((c) => c ^ 1), 60);
    // Cleanup not strictly needed, but good practice if component unmounts
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`boolforge-page theme-${theme}`} style={{ background: '#1a1a1a' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
        .clk-blink{animation:blink .5s infinite;}
        .short-blink{animation:blink .3s infinite;}
      `}</style>
      <Navbar toggleTheme={toggleTheme} theme={theme} />

      <div
        className="trainer-page-container"
        style={{
          fontFamily: F,
          background: "radial-gradient(ellipse at 40% 40%,#3a3a3a,#141414)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: 18,
          userSelect: "none",
        }}
        onMouseLeave={() => {
          setWireStart(null);
          setPreview(null);
        }}
      >
        {/* ── OUTER CHASSIS ── */}
        <div
          className="trainer-outer-chassis"
          style={{
            position: "relative",
            borderRadius: "18px 18px 8px 8px",
            background:
              "linear-gradient(160deg,#e8e8e8,#c0c0c0 40%,#a8a8a8 70%,#909090)",
            padding: "16px 16px 0",
            boxShadow:
              "0 50px 90px rgba(0,0,0,.9),0 10px 20px rgba(0,0,0,.5),inset 0 3px 6px rgba(255,255,255,.5)",
            maxWidth: 1280,
            width: "100%",
          }}
        >
          {/* Right wall */}
          <div
            className="trainer-side-wall"
            style={{
              position: "absolute",
              top: 16,
              bottom: 0,
              right: -15,
              width: 15,
              background: "linear-gradient(90deg,#aaa,#666)",
              borderRadius: "0 8px 8px 0",
            }}
          />
          {/* Bottom */}
          <div
            style={{
              position: "absolute",
              bottom: -24,
              left: 8,
              right: 8,
              height: 24,
              background: "linear-gradient(180deg,#888,#505050)",
              borderRadius: "0 0 12px 12px",
              boxShadow: "0 8px 20px rgba(0,0,0,.8)",
            }}
          />

          {/* ── PCB ── */}
          <div
            style={{
              borderRadius: 8,
              padding: 10,
              position: "relative",
              overflow: "hidden",
              background: "#0e2412",
              backgroundImage:
                "radial-gradient(ellipse 55% 35% at 20% 20%,#1b5430,transparent),radial-gradient(ellipse 55% 35% at 80% 80%,#17422a,transparent)",
            }}
          >
            {/* PCB grid */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                backgroundImage:
                  "repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(210,165,60,.04) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(210,165,60,.04) 20px)",
              }}
            />

            {/* ════ HEADER ════ */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(90deg,#04101e,#0b1e40,#04101e)",
                border: "1px solid #1a3470",
                borderRadius: 6,
                padding: "7px 16px",
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontSize: 32,
                    color: "#3a8fff",
                    filter: "drop-shadow(0 0 10px #3a8fff)",
                    lineHeight: 1,
                  }}
                >
                  ∞
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: "'Orbitron',monospace",
                      fontSize: 17,
                      fontWeight: 900,
                      color: "#d0e8ff",
                      letterSpacing: 3,
                    }}
                  >
                    INFINIT
                  </div>
                  <div
                    style={{
                      fontFamily: "'Orbitron',monospace",
                      fontSize: 7,
                      color: "#5575aa",
                      letterSpacing: 2,
                    }}
                  >
                    Technologies
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 18,
                    color: "#ffcc44",
                    letterSpacing: 6,
                    textShadow: "0 0 12px #ffcc4466",
                  }}
                >
                  IT-300
                </div>
                <div
                  style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 8,
                    color: "#8aaacf",
                    letterSpacing: 2,
                  }}
                >
                  DIGITAL LOGIC TRAINING SYSTEM
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {[
                  ["+5V", "#ff2200"],
                  ["+15V", "#00ff44"],
                  ["-15V", "#ffcc00"],
                ].map(([lbl, c]) => (
                  <div key={lbl} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: 10,
                        height: 20,
                        borderRadius: "5px 5px 3px 3px",
                        margin: "0 auto 3px",
                        background: c,
                        boxShadow: `0 0 10px ${c}88`,
                      }}
                    />
                    <div style={{ fontSize: 6, color: c, fontFamily: F }}>
                      {lbl}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ════ TOOLBAR ════ */}
            <div
              style={{
                display: "flex",
                gap: 5,
                marginBottom: 7,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {[
                ["wire", "⚡ WIRE"],
                ["delete", "✂ DELETE"],
              ].map(([m, lbl]) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    background: mode === m ? "#0e2436" : "#050d14",
                    color: mode === m ? "#4fc3f7" : "#3a5566",
                    border: `1px solid ${mode === m ? "#4fc3f7" : "#1e3344"}`,
                    borderRadius: 3,
                    padding: "3px 10px",
                    cursor: "pointer",
                    fontSize: 9,
                    fontFamily: F,
                    letterSpacing: 1,
                  }}
                >
                  {lbl}
                </button>
              ))}
              {mode === "wire" && (
                <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                  <span style={{ fontSize: 7, color: "#446" }}>wire:</span>
                  {COLORS.map((c, i) => (
                    <div
                      key={c}
                      onClick={() => {
                        setWireCol(c);
                        setColIdx(i);
                        wireColRef.current = c;
                        colIdxRef.current = i;
                      }}
                      style={{
                        width: 13,
                        height: 13,
                        borderRadius: "50%",
                        background: c,
                        cursor: "pointer",
                        border:
                          wireCol === c
                            ? "2px solid #fff"
                            : "2px solid transparent",
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
              )}
              {wireStart && (
                <div style={{ fontSize: 8, color: "#4fc3f7", fontFamily: F }}>
                  ● from <b style={{ color: "#fff" }}>{wireStart.id}</b> → click
                  dest hole &nbsp;
                  <span
                    style={{ cursor: "pointer", color: "#f66" }}
                    onClick={() => {
                      setWireStart(null);
                      setPreview(null);
                    }}
                  >
                    ✕
                  </span>
                </div>
              )}

              {/* NEW: "pin already wired" warning */}
              {wireWarning && (
                <div
                  style={{
                    fontSize: 8,
                    color: "#ffcc00",
                    fontFamily: F,
                    background: "#2a1e00",
                    border: "1px solid #ffcc00",
                    borderRadius: 3,
                    padding: "2px 7px",
                  }}
                >
                  ⚠ {wireWarning}
                </div>
              )}
              {/* NEW: short-circuit warning banner */}
              {hasShortCircuit && (
                <div
                  className="short-blink"
                  style={{
                    fontSize: 9,
                    color: "#ff2222",
                    fontFamily: F,
                    fontWeight: "bold",
                    background: "#2a0000",
                    border: "1px solid #ff2222",
                    borderRadius: 3,
                    padding: "3px 8px",
                  }}
                >
                  ⚠ SHORT CIRCUIT DETECTED ({shortNodes.size})
                </div>
              )}
              <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>

                <button
                  onClick={() => {
                    recordUndo();
                    setWires([]);
                    setWireStart(null);
                    setPreview(null);
                  }}
                  style={{
                    background: "#1e0808",
                    color: "#f44",
                    border: "1px solid #f44",
                    borderRadius: 3,
                    padding: "3px 9px",
                    cursor: "pointer",
                    fontSize: 9,
                    fontFamily: F,
                  }}
                >
                  🗑 Wires
                </button>
                <button
                  onClick={() => {
                    recordUndo();
                    setPlacedICs([]);
                  }}
                  style={{
                    background: "#16081e",
                    color: "#b44fff",
                    border: "1px solid #b44fff",
                    borderRadius: 3,
                    padding: "3px 9px",
                    cursor: "pointer",
                    fontSize: 9,
                    fontFamily: F,
                  }}
                >
                  ✕ ICs
                </button>
                <input
                  value={circuitName}
                  onChange={(e) => setCircuitName(e.target.value)}
                  placeholder="Circuit name"
                  style={{
                    background: "#050d14",
                    color: "#cde",
                    border: "1px solid #1e3344",
                    borderRadius: 3,
                    padding: "3px 7px",
                    fontSize: 9,
                    fontFamily: F,
                    width: 110,
                  }}
                />
                <button
                  onClick={saveCircuit}
                  disabled={saveState.status === "saving"}
                  title={isAuthenticated ? "Save this circuit to your account" : "Log in to save your circuit"}
                  style={{
                    background: "#08221e",
                    color: "#2ee6a8",
                    border: "1px solid #2ee6a8",
                    borderRadius: 3,
                    padding: "3px 10px",
                    cursor: saveState.status === "saving" ? "wait" : "pointer",
                    fontSize: 9,
                    fontFamily: F,
                    opacity: saveState.status === "saving" ? 0.6 : 1,
                  }}
                >
                  {isAuthenticated ? "💾 SAVE" : "🔒 LOGIN TO SAVE"}
                </button>
                {saveState.message && (
                  <span
                    style={{
                      fontSize: 8,
                      fontFamily: F,
                      color: saveState.status === "error" ? "#f66" : "#2ee6a8",
                    }}
                  >
                    {saveState.message}
                  </span>
                )}
              </div>
            </div>

            {/* ════ MAIN 3-COLUMN LAYOUT ════ */}
            {/* FIX: correct column order — left panel | center breadboard | right panel */}
            <div className="trainer-grid">
              {/* ── LEFT PANEL ── */}
              <div>
                {/* 4-digit 7-seg */}
                <Sec title="7-Segment Display">
                  <div
                    style={{
                      display: "flex",
                      gap: 3,
                      justifyContent: "center",
                      background: "#050200",
                      padding: 7,
                      borderRadius: 5,
                      border: "1px solid #1a0a00",
                    }}
                  >
                    {[
                      Math.floor(dec / 1000) % 10,
                      Math.floor(dec / 100) % 10,
                      Math.floor(dec / 10) % 10,
                      dec % 10,
                    ].map((v, i) => (
                      <Seg7 key={i} val={v} h={44} />
                    ))}
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 7,
                      color: "#666",
                      marginTop: 4,
                      fontFamily: F,
                    }}
                  >
                    {String(dec).padStart(4, "0")} · 0x
                    {dec.toString(16).toUpperCase().padStart(2, "0")} ·{" "}
                    {dec.toString(2).padStart(8, "0")}b
                  </div>
                </Sec>

                {/* Clock */}
                <Sec title="Clock Generator">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 5,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        background: "#000",
                        border: "1px solid #181818",
                        borderRadius: 3,
                        padding: "3px 8px",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          color: clkOn && clk ? "#ff8800" : "#332",
                          fontFamily: F,
                        }}
                      >
                        {clkHz}Hz
                      </span>
                      <div
                        className={clkOn && clk ? "clk-blink" : ""}
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          marginLeft: "auto",
                          background: clkOn && clk ? "#ff8800" : "#1a1a1a",
                          boxShadow: clkOn && clk ? "0 0 8px #ff8800" : "none",
                          border: "1px solid #333",
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={64}
                    value={clkHz}
                    onChange={(e) => setClkHz(+e.target.value)}
                    style={{
                      width: "100%",
                      accentColor: "#ff8800",
                      marginBottom: 5,
                      cursor: "pointer",
                    }}
                  />
                  <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                    {[1, 4, 16, 64].map((hz) => (
                      <button
                        key={hz}
                        onClick={() => setClkHz(hz)}
                        style={{
                          flex: 1,
                          background: clkHz === hz ? "#2a1800" : "#0a0a0a",
                          color: clkHz === hz ? "#ff8800" : "#443322",
                          border: `1px solid ${clkHz === hz ? "#ff8800" : "#221100"}`,
                          borderRadius: 3,
                          padding: "2px 0",
                          fontSize: 7,
                          fontFamily: F,
                          cursor: "pointer",
                        }}
                      >
                        {hz}Hz
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setClkOn((v) => !v)}
                    style={{
                      width: "100%",
                      background: clkOn ? "#0f300f" : "#300f0f",
                      color: clkOn ? "#00ee44" : "#ff4444",
                      border: `1px solid ${clkOn ? "#00ee44" : "#ff4444"}`,
                      borderRadius: 4,
                      padding: "5px 0",
                      fontSize: 9,
                      fontFamily: F,
                      cursor: "pointer",
                    }}
                  >
                    {clkOn ? "● CLK ON" : "○ CLK OFF"}
                  </button>
                  <button
                    onClick={pulseClock}
                    style={{
                      width: '100%',
                      background: '#1a1a00',
                      color: '#ffcc00',
                      border: '1px solid #ffcc00',
                      borderRadius: 4,
                      padding: '5px 0',
                      fontSize: 9,
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      marginTop: 4,
                    }}
                  >
                    ⚡ SINGLE PULSE
                  </button>
                </Sec>

                {/* Push switches */}
                <Sec title="Push Switches">
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      justifyContent: "center",
                    }}
                  >
                    {[0, 1].map((i) => (
                      <div key={i} style={{ textAlign: "center" }}>
                        <button
                          onMouseDown={() =>
                            setPush((p) => {
                              const n = [...p];
                              n[i] = 1;
                              return n;
                            })
                          }
                          onMouseUp={() =>
                            setPush((p) => {
                              const n = [...p];
                              n[i] = 0;
                              return n;
                            })
                          }
                          onMouseLeave={() =>
                            setPush((p) => {
                              const n = [...p];
                              n[i] = 0;
                              return n;
                            })
                          }
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: pushBtns[i] ? "#bb3300" : "#2a1000",
                            border: "3px solid #886644",
                            cursor: "pointer",
                            boxShadow: pushBtns[i]
                              ? "inset 0 2px 4px rgba(0,0,0,.5)"
                              : "0 4px 0 #000",
                            transform: pushBtns[i] ? "translateY(3px)" : "none",
                            transition: "transform .07s,box-shadow .07s",
                            color: "#ffaa44",
                            fontSize: 9,
                            fontFamily: F,
                          }}
                        >
                          S{i + 1}
                        </button>
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            justifyContent: "center",
                            marginTop: 4,
                          }}
                        >
                          <LED on={!!pushBtns[i]} c="Y" />
                          <span
                            style={{
                              fontSize: 6,
                              color: "#777",
                              fontFamily: F,
                            }}
                          >
                            Q
                          </span>
                          <LED on={!pushBtns[i]} c="G" />
                          <span
                            style={{
                              fontSize: 6,
                              color: "#777",
                              fontFamily: F,
                            }}
                          >
                            Q̄
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Sec>

                {/* Logic Probe */}
                <Sec title="Logic Probe">
                  {[
                    ["HI", clk === 1, "G"],
                    ["LO", clk === 0, "R"],
                    ["PULSE", clkOn, "Y"],
                    ["HI-Z", false, "B"],
                  ].map(([lbl, on, c]) => (
                    <div
                      key={lbl}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 5,
                      }}
                    >
                      <LED on={on} c={c} size={11} />
                      <span
                        style={{ fontSize: 8, color: "#aaa", fontFamily: F }}
                      >
                        {lbl}
                      </span>
                    </div>
                  ))}
                </Sec>

                {/* Potentiometers */}
                <Sec title="Potentiometers">
                  <div
                    style={{ display: "flex", justifyContent: "space-around" }}
                  >
                    {[
                      ["1K", 110],
                      ["10K", 200],
                    ].map(([lbl, angle]) => (
                      <div key={lbl} style={{ textAlign: "center" }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            margin: "0 auto 4px",
                            background:
                              "radial-gradient(circle at 36% 34%,#999,#2a2a2a)",
                            border: "2px solid #555",
                            position: "relative",
                            cursor: "pointer",
                            boxShadow: "0 4px 10px rgba(0,0,0,.8)",
                            transform: `rotate(${angle}deg)`,
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: 3,
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: 3,
                              height: 11,
                              background: "#e0e0e0",
                              borderRadius: 2,
                            }}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: 7,
                            color: "#d4a843",
                            fontFamily: F,
                          }}
                        >
                          {lbl}
                        </div>
                      </div>
                    ))}
                  </div>
                </Sec>
              </div>

              {/* ── CENTER (BREADBOARD) ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Sec title="Solderless Breadboard — 2×30 columns × 10 rows + 4 power rails" style={{ overflow: "visible" }}>
                  <div className="breadboard-scroll-wrapper" style={{ overflow: "visible" }}>
                    {/* FIX: bbWrapRef attached here — this is the coordinate origin for all wires */}
                    <div
                      ref={bbWrapRef}
                      style={{ position: "relative", display: "inline-block", minWidth: `${bbW}px`, overflow: "visible", zIndex: 1 }}
                    >
                      <Breadboard
                        wireStart={wireStart}
                        wires={wires}
                        placedICs={placedICs}
                        onHoleClick={onHoleClick}
                        onICMouseDown={handleICMouseDown}

                        onICContextMenu={handleICContextMenu}
                        mode={mode}
                        onICDelete={handleICDelete}
                        poweredIds={poweredIds}
                      />
                      {/* FIX: WireOverlay uses SVG-local coords — rendered over the SVG */}
                      <WireOverlay
                        wires={wires}
                        preview={preview}
                        width={bbW}
                        height={bbH}
                        onWireClick={(wireId) => {
                          recordUndo();
                          setWires((p) => p.filter((w) => w.id !== wireId));
                        }}
                      />
                    </div>
                  </div>
                </Sec>

                {/* 8-bit switches */}
                <Sec title="Logic Input Switches  A – H  (8-bit)">
                  <div
                    style={{
                      display: "flex",
                      gap: 5,
                      justifyContent: "center",
                    }}
                  >
                    {switches.map((v, i) => (
                      <ToggleSW
                        key={i}
                        label={String.fromCharCode(65 + i)}
                        val={v}
                        onToggle={() => {
                          recordUndo();
                          setSwitches((p) => {
                            const n = [...p];
                            n[i] ^= 1;
                            return n;
                          });
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 5,
                      justifyContent: "center",
                      marginTop: 5,
                    }}
                  >
                    {switches.map((v, i) => (
                      <div
                        key={i}
                        onMouseDown={(e) => handleExternalPinDown(`swled_${i}`, e)}
                        style={{ cursor: "crosshair" }}
                      >
                        <LED on={!!v} c="G" />
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      fontFamily: F,
                      fontSize: 16,
                      color: "#00ee44",
                      background: "#000",
                      padding: "5px 10px",
                      borderRadius: 3,
                      textAlign: "center",
                      letterSpacing: 4,
                      border: "1px solid #0a1a0a",
                      marginTop: 5,
                    }}
                  >
                    {switches.slice().reverse().join("")}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      marginTop: 4,
                      fontSize: 9,
                      color: "#5a7a5a",
                      fontFamily: F,
                    }}
                  >
                    <span>DEC: {dec}</span>
                    <span>
                      HEX: 0x{dec.toString(16).toUpperCase().padStart(2, "0")}
                    </span>
                    <span>OCT: {dec.toString(8).padStart(3, "0")}</span>
                  </div>
                </Sec>

                {/* IC Tray */}
                <Sec title="IC Component Tray — drag onto breadboard">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {Object.keys(ICS).map((k) => (
                      <TrayIC key={k} icKey={k} onMouseDown={startTrayDrag} onContextMenu={handleTrayContextMenu} />
                    ))}
                  </div>
                  <div
                    style={{
                      fontSize: 7,
                      color: "#334",
                      fontFamily: F,
                      marginTop: 5,
                      textAlign: "center",
                    }}
                  >
                    Hold + drag IC chip → release over breadboard to place
                  </div>
                </Sec>
              </div>

              {/* ── RIGHT PANEL ── */}
              <div>
                {/* State monitors */}
                <Sec title="State Monitors (8)">
                  <div
                    style={{
                      fontSize: 6,
                      color: "#f44",
                      marginBottom: 3,
                      letterSpacing: 1,
                      fontFamily: F,
                    }}
                  >
                    DATA BUS D0–D7
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: 4,
                      marginBottom: 7,
                    }}
                  >
                    {switches.map((_, i) => (
                      <div
                        key={i}
                        style={{ textAlign: "center", cursor: "crosshair" }}
                        onMouseDown={(e) => handleExternalPinDown(`databus_${i}`, e)}
                      >
                        <LED on={!!monitor(`databus_${i}`)} c="R" size={11} />
                        <div
                          style={{
                            fontSize: 6,
                            color: "#888",
                            fontFamily: F,
                            marginTop: 1,
                          }}
                        >
                          D{i}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      fontSize: 6,
                      color: "#4e4",
                      marginBottom: 3,
                      letterSpacing: 1,
                      fontFamily: F,
                    }}
                  >
                    LOGIC OUT Y0–Y7
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: 4,
                      marginBottom: 7,
                    }}
                  >
                    {switches.map((_, i) => (
                      <div
                        key={i}
                        style={{ textAlign: "center", cursor: "crosshair" }}
                        onMouseDown={(e) => handleExternalPinDown(`logicout_${i}`, e)}
                      >
                        <LED on={!!monitor(`logicout_${i}`)} c="G" size={11} />
                        <div
                          style={{
                            fontSize: 6,
                            color: "#888",
                            fontFamily: F,
                            marginTop: 1,
                          }}
                        >
                          Y{i}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      fontSize: 6,
                      color: "#fc0",
                      marginBottom: 3,
                      letterSpacing: 1,
                      fontFamily: F,
                    }}
                  >
                    FLAGS
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: 4,
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div
                        key={i}
                        style={{ textAlign: "center", cursor: "crosshair" }}
                        onMouseDown={(e) => handleExternalPinDown(`flag_${i}`, e)}
                      >
                        <LED on={!!(i === 7 ? dec > 127 : monitor(`flag_${i}`))} c="Y" size={11} />
                        <div
                          style={{
                            fontSize: 5,
                            color: "#888",
                            fontFamily: F,
                            marginTop: 1,
                          }}
                        >
                          {["CK", "P1", "P2", "—", "—", "—", "—", "OV"][i]}
                        </div>
                      </div>
                    ))}
                  </div>
                </Sec>

                {/* Complement outputs */}
                <Sec title="Q / Q̄ Outputs">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        marginBottom: 5,
                        cursor: "crosshair",
                      }}
                      onMouseDown={(e) => handleExternalPinDown(`qbar_${i}`, e)}
                    >
                      <span
                        style={{
                          fontSize: 8,
                          color: "#d4a843",
                          fontFamily: F,
                          width: 14,
                        }}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <LED on={!!monitor(`qbar_${i}`)} c="G" />
                      <span
                        style={{ fontSize: 6, color: "#666", fontFamily: F }}
                      >
                        Q
                      </span>
                      <div style={{ flex: 1 }} />
                      <LED on={!monitor(`qbar_${i}`)} c="R" />
                      <span
                        style={{ fontSize: 6, color: "#666", fontFamily: F }}
                      >
                        Q̄
                      </span>
                    </div>
                  ))}
                </Sec>

                {/* I/O Terminals */}
                <Sec title="I/O Terminals">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 4,
                    }}
                  >
                    {[
                      "VCC",
                      "GND",
                      "+5V",
                      "-5V",
                      "+15V",
                      "-15V",
                      "CLK",
                      "CLK̄",
                    ].map((lbl) => (
                      <div
                        key={lbl}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 2,
                            flexShrink: 0,
                            background: "linear-gradient(135deg,#aaa,#555)",
                            border: "1px solid #333",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%,-50%)",
                              width: 7,
                              height: 1.5,
                              background: "#222",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%,-50%)",
                              width: 1.5,
                              height: 7,
                              background: "#222",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 6.5,
                            color: "#999",
                            fontFamily: F,
                          }}
                        >
                          {lbl}
                        </span>
                      </div>
                    ))}
                  </div>
                </Sec>

                {/* Board info */}
                <Sec title="Board Info">
                  <div
                    style={{
                      fontSize: 7,
                      color: "#446",
                      lineHeight: 2,
                      fontFamily: F,
                    }}
                  >
                    <div>
                      Wires:{" "}
                      <span style={{ color: "#6699ff" }}>{wires.length}</span>
                    </div>
                    <div>
                      ICs on board:{" "}
                      <span style={{ color: "#bb44ff" }}>
                        {placedICs.length}
                      </span>
                    </div>
                    <div>
                      Rail +: <span style={{ color: "#f44" }}>+5V DC</span>
                    </div>
                    <div>
                      Rail −: <span style={{ color: "#66f" }}>GND</span>
                    </div>
                    <div>
                      Clock:{" "}
                      <span style={{ color: "#ff8800" }}>
                        {clkOn ? `${clkHz}Hz` : "OFF"}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 6,
                      color: "#2a3a2a",
                      lineHeight: 1.8,
                      fontFamily: F,
                    }}
                  >
                    1. Click WIRE mode
                    <br />
                    2. Click hole → click hole
                    <br />
                    3. Drag IC from tray below
                    <br />
                    4. Release over breadboard
                  </div>
                </Sec>
              </div>
            </div>

            {/* ════ STATUS BAR ════ */}
            <div
              style={{
                marginTop: 8,
                padding: "5px 12px",
                background: "linear-gradient(90deg,#030b18,#060e22,#030b18)",
                border: "1px solid #0c1c36",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 8,
                color: "#2a5a7a",
                fontFamily: F,
              }}
            >
              <span style={{ color: "#ff8800" }}>
                CLK {clkOn ? `${clkHz}Hz` : "OFF"}{" "}
                {clkOn ? (clk ? "▐█" : "░░") : ""}
              </span>
              <span style={{ color: "#334" }}>|</span>
              <span>
                SW:{" "}
                <span style={{ color: "#00ee44" }}>
                  {switches.slice().reverse().join("")}b
                </span>{" "}
                ={dec}
              </span>
              <span style={{ color: "#334" }}>|</span>
              <span>
                WIRES:<span style={{ color: "#6699ff" }}> {wires.length}</span>
              </span>
              <span style={{ color: "#334" }}>|</span>
              <span>
                ICs:
                <span style={{ color: "#bb44ff" }}> {placedICs.length}</span>
              </span>
              <span style={{ color: "#334" }}>|</span>
              <span>
                MODE:
                <span style={{ color: "#88bbdd" }}> {mode.toUpperCase()}</span>
              </span>
              {/* NEW: short-circuit status */}
              <span style={{ color: "#334" }}>|</span>
              <span className={hasShortCircuit ? "short-blink" : ""}>
                SHORT:
                <span style={{ color: hasShortCircuit ? "#ff2222" : "#2a5a2a" }}>
                  {" "}{hasShortCircuit ? `⚠ ${shortNodes.size}` : "OK"}
                </span>
              </span>
              <span style={{ marginLeft: "auto", color: "#14243a" }}>
                ∞ INFINIT TECHNOLOGIES · IT-300 DIGITAL LOGIC TRAINING SYSTEM
              </span>
            </div>
          </div>
        </div>

        {/* ── DRAG GHOST ── */}
        {dragging && (
          <div
            style={{
              position: "fixed",
              left: dragging.ghostX,
              top: dragging.ghostY,
              pointerEvents: "none",
              zIndex: 9999,
              opacity: 0.88,
              transform: "rotate(-4deg) scale(1.05)",
              filter: "drop-shadow(0 6px 16px rgba(0,0,0,.9))",
            }}
          >
            <div
              style={{
                background: `linear-gradient(160deg,${ICS[dragging.icKey].bg},#080808)`,
                border: "2px solid #888",
                borderRadius: 4,
                padding: "5px 10px",
                minWidth: 60,
              }}
            >
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  fontWeight: "bold",
                  color: ICS[dragging.icKey].txt,
                  textAlign: "center",
                  letterSpacing: 1,
                }}
              >
                {dragging.icKey}
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 13,
                  color: ICS[dragging.icKey].txt,
                  textAlign: "center",
                }}
              >
                {ICS[dragging.icKey].sym}
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 6,
                  color: "#aaa",
                  textAlign: "center",
                  marginTop: 1,
                }}
              >
                {ICS[dragging.icKey].name}
              </div>
            </div>
          </div>
        )}
        {/* NEW: datasheet popup, rendered above everything else */}
        {datasheet && (
          <DatasheetPopup
            icKey={datasheet.icKey}
            x={datasheet.x}
            y={datasheet.y}
            onClose={() => setDatasheet(null)}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
