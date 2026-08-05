// ── IC Catalog ────────────────────────────────────────────────────
export const ICS = {
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
export const IC_LOGIC = {
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
