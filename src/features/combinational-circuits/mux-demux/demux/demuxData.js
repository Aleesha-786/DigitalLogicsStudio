/**
 * demuxData.js — All static data for the Demultiplexer page.
 *
 * Structure per DEMUX type:
 *   label        — human-readable name
 *   selectInputs — array of select pin names  (e.g. ["S1","S0"])
 *   outputs      — array of output pin names  (e.g. ["Y0","Y1","Y2","Y3"])
 *   input        — input pin name ("D")
 *   description  — one-line summary
 *   analogy      — real-world comparison
 *   demux()      — pure fn (d, selectVals[]) → { [outName]: 0|1, active }
 *   booleanEqs   — array of { out, eq, color, explanation, trick }
 *   truthHeaders — column headers for the truth table
 *   truthRows    — array of string[] rows
 */

export const DEMUX_TYPES = {
  // ── 1-to-2 ──────────────────────────────────────────────────────────────────
  "1to2": {
    label: "1-to-2 DEMUX",
    selectInputs: ["S"],
    outputs: ["Y0", "Y1"],
    input: "D",
    description: "1 select bit → routes single input D to one of 2 outputs",
    analogy: "Like a garden hose valve: you decide which of two pipes (Y0 or Y1) receives the water (D)",
    demux: (d, sel) => {
      const active = sel[0];
      return { Y0: active === 0 ? d : 0, Y1: active === 1 ? d : 0, active };
    },
    booleanEqs: [
      {
        out: "Y0", eq: "Y0 = S'·D", color: "#34d399",
        explanation: "Y0 is active when S=0 (S'=1) — the complement routes D to output 0. When S=1, S'=0 so Y0 is forced LOW regardless of D.",
        trick: "S=0 → complement S' is 1 → gate opens for Y0. Mirror of a 1-to-2 decoder with D as enable.",
      },
      {
        out: "Y1", eq: "Y1 = S·D", color: "#60a5fa",
        explanation: "Y1 is active when S=1 — the select bit itself gates D through to output 1. When S=0 the gate is closed.",
        trick: "S=1 → S itself is 1 → gate opens for Y1. No complement needed.",
      },
    ],
    truthHeaders: ["S", "D", "Y0", "Y1"],
    truthRows: [
      ["0", "0", "0", "0"],
      ["0", "1", "1", "0"],
      ["1", "0", "0", "0"],
      ["1", "1", "0", "1"],
    ],
  },

  // ── 1-to-4 ──────────────────────────────────────────────────────────────────
  "1to4": {
    label: "1-to-4 DEMUX",
    selectInputs: ["S1", "S0"],
    outputs: ["Y0", "Y1", "Y2", "Y3"],
    input: "D",
    description: "2 select bits → routes single input D to one of 4 outputs",
    analogy: "Like a train dispatcher: two levers (S1,S0) send one train (D) to one of four platforms (Y0–Y3)",
    demux: (d, sel) => {
      const active = (sel[0] << 1) | sel[1];
      const out = { Y0: 0, Y1: 0, Y2: 0, Y3: 0, active };
      out[`Y${active}`] = d;
      return out;
    },
    booleanEqs: [
      { out: "Y0", eq: "Y0 = S1'·S0'·D", color: "#34d399", explanation: "Address 00 → both bits complemented. Y0 carries D only when S1=0 AND S0=0.", trick: "00 → both bits 0 → both complemented. Exactly like decoder minterm m0 multiplied by D." },
      { out: "Y1", eq: "Y1 = S1'·S0·D",  color: "#60a5fa", explanation: "Address 01 → S1 complemented, S0 direct. Y1 carries D only when S1=0 AND S0=1.", trick: "01 → first 0 (complement) then 1 (direct). Pattern mirrors decoder m1 × D." },
      { out: "Y2", eq: "Y2 = S1·S0'·D",  color: "#a78bfa", explanation: "Address 10 → S1 direct, S0 complemented. Y2 carries D only when S1=1 AND S0=0.", trick: "10 → first 1 (direct) then 0 (complement). Same as decoder m2 × D." },
      { out: "Y3", eq: "Y3 = S1·S0·D",   color: "#fbbf24", explanation: "Address 11 → both bits direct. Y3 carries D only when S1=1 AND S0=1.", trick: "11 → both bits 1 → no complements at all. Decoder m3 × D." },
    ],
    truthHeaders: ["S1", "S0", "D", "Y0", "Y1", "Y2", "Y3"],
    truthRows: [
      ["0", "0", "0", "0", "0", "0", "0"],
      ["0", "0", "1", "1", "0", "0", "0"],
      ["0", "1", "0", "0", "0", "0", "0"],
      ["0", "1", "1", "0", "1", "0", "0"],
      ["1", "0", "0", "0", "0", "0", "0"],
      ["1", "0", "1", "0", "0", "1", "0"],
      ["1", "1", "0", "0", "0", "0", "0"],
      ["1", "1", "1", "0", "0", "0", "1"],
    ],
  },

  // ── 1-to-8 ──────────────────────────────────────────────────────────────────
  "1to8": {
    label: "1-to-8 DEMUX",
    selectInputs: ["S2", "S1", "S0"],
    outputs: ["Y0","Y1","Y2","Y3","Y4","Y5","Y6","Y7"],
    input: "D",
    description: "3 select bits → routes single input D to one of 8 outputs",
    analogy: "Like a postal sorting machine: 3 binary codes (S2,S1,S0) direct one parcel (D) to one of 8 destination bins",
    demux: (d, sel) => {
      const active = (sel[0] << 2) | (sel[1] << 1) | sel[2];
      const out = { active };
      for (let i = 0; i < 8; i++) out[`Y${i}`] = i === active ? d : 0;
      return out;
    },
    booleanEqs: Array.from({ length: 8 }, (_, i) => {
      const bits = i.toString(2).padStart(3, "0").split("").map((b, j) => (b === "1" ? `S${2-j}` : `S${2-j}'`));
      const eq = `Y${i} = ${bits.join("·")}·D`;
      const colors = ["#34d399","#4ade80","#60a5fa","#93c5fd","#fbbf24","#f97316","#a78bfa","#f472b6"];
      return {
        out: `Y${i}`, eq, color: colors[i],
        explanation: `Address ${i.toString(2).padStart(3,"0")}: ${bits.join(" AND ")} must all be 1. Then D passes through to Y${i}.`,
        trick: `Binary ${i.toString(2).padStart(3,"0")} = ${i}. Complement 0-bits, keep 1-bits — same rule as a 3-to-8 decoder minterm, then AND with D.`,
      };
    }),
    truthHeaders: ["S2", "S1", "S0", "D", "Active Output"],
    truthRows: Array.from({ length: 8 }, (_, i) => [
      String((i >> 2) & 1), String((i >> 1) & 1), String(i & 1), "D", `Y${i} = D, others = 0`,
    ]),
  },
};

// ── Quiz ───────────────────────────────────────────────────────────────────────
export const DEMUX_QUIZ = [
  {
    q: "In a 1-to-4 DEMUX with S1=1, S0=0, and D=1, which output is HIGH?",
    opts: ["Y0", "Y1", "Y2", "Y3"],
    ans: 2,
    exp: "S1=1, S0=0 → binary 10 = 2 → D is routed to Y2. Y2 = D = 1.",
    hint: "Convert S1S0 to decimal — that's the output index.",
  },
  {
    q: "What is the Boolean equation for Y1 in a 1-to-4 DEMUX?",
    opts: ["Y1 = S1·S0·D", "Y1 = S1'·S0·D", "Y1 = S1·S0'·D", "Y1 = S1'·S0'·D"],
    ans: 1,
    exp: "Y1 corresponds to address 01: S1=0 (complement S1'), S0=1 (direct S0). So Y1 = S1'·S0·D.",
    hint: "Address 01: first bit is 0 (complement), second bit is 1 (direct).",
  },
  {
    q: "How does a DEMUX differ from a decoder?",
    opts: [
      "They are identical circuits",
      "A DEMUX has a data input that is routed; a decoder always outputs 1 on the selected line",
      "A decoder has more outputs",
      "A DEMUX uses fewer select lines",
    ],
    ans: 1,
    exp: "A decoder always asserts the selected output HIGH. A DEMUX propagates the data input D — the selected output follows D (could be 0 or 1). With D tied HIGH, a DEMUX behaves exactly like a decoder.",
    hint: "What happens when D=0 in a DEMUX?",
  },
  {
    q: "How many select lines does a 1-to-8 DEMUX need?",
    opts: ["2", "3", "4", "8"],
    ans: 1,
    exp: "8 = 2³ → 3 select lines. In general, a 1-to-2ⁿ DEMUX needs n select lines.",
    hint: "2 raised to what power gives 8?",
  },
  {
    q: "If D=0 in any DEMUX, what are all the outputs?",
    opts: [
      "The selected output is HIGH, others are LOW",
      "All outputs are LOW",
      "All outputs follow the select pattern",
      "The selected output is LOW, others are HIGH",
    ],
    ans: 1,
    exp: "Every output equation is of the form Yi = (minterm of selects)·D. If D=0, every product is 0 → all outputs are LOW regardless of select.",
    hint: "Each output is ANDed with D. What is anything AND 0?",
  },
];

export const DEMUX_QUIZ_FEEDBACK = {
  perfect: "🏆 Excellent! You have mastered demultiplexers.",
  good:    "👍 Good work! Review the Boolean equations for missed questions.",
  review:  "📚 Keep studying — focus on how D is gated through the select minterms.",
};

// ── Tips ───────────────────────────────────────────────────────────────────────
export const DEMUX_TIPS = [
  "A 1-to-2ⁿ DEMUX needs exactly n select lines.",
  "A DEMUX with D tied HIGH behaves identically to a decoder.",
  "Each output equation is a decoder minterm AND-ed with the data input D.",
  "If D=0, all DEMUX outputs are forced LOW regardless of the select lines.",
  "A DEMUX is the 'reverse' of a MUX: MUX combines many → one; DEMUX distributes one → many.",
  "Cascading two 1-to-4 DEMUXes using a 1-to-2 DEMUX creates a 1-to-8 DEMUX.",
];
