/**
 * muxData.js — All static data for the Multiplexer page.
 *
 * Structure per MUX type:
 *   label        — human-readable name
 *   selectInputs — array of select pin names  (e.g. ["S1","S0"])
 *   dataInputs   — array of data pin names    (e.g. ["D0","D1","D2","D3"])
 *   output       — output pin name            ("Y")
 *   description  — one-line summary
 *   analogy      — real-world comparison
 *   mux()        — pure fn (dataVals[], selectVals[]) → { Y, active }
 *   booleanEqs   — array of { label, eq, color, explanation, trick }
 *   truthHeaders — column headers for the truth table
 *   truthRows    — array of string[] rows
 */

export const MUX_TYPES = {
  // ── 2-to-1 ──────────────────────────────────────────────────────────────────
  "2to1": {
    label: "2-to-1 MUX",
    selectInputs: ["S"],
    dataInputs: ["D0", "D1"],
    output: "Y",
    description: "1 select bit → routes one of 2 data inputs to output Y",
    analogy: "Like a railway switch: one lever (S) decides which track (D0 or D1) the train (signal) travels",
    mux: (data, sel) => {
      const active = sel[0];
      return { Y: data[active] ?? 0, active };
    },
    booleanEqs: [
      {
        label: "Output Y",
        eq: "Y = S'·D0 + S·D1",
        color: "#00ff88",
        explanation: "When S=0: S' is 1, so S'·D0 = D0 and S·D1 = 0 → Y = D0. When S=1: S' is 0, so S'·D0 = 0 and S·D1 = D1 → Y = D1. The select bit acts like a gate for each data line.",
        trick: "Think of S as a pointer: S=0 → point to D0, S=1 → point to D1. The complement (S') covers the zero case.",
      },
    ],
    truthHeaders: ["S", "D0", "D1", "Y"],
    truthRows: [
      ["0", "0", "x", "0"],
      ["0", "1", "x", "1"],
      ["1", "x", "0", "0"],
      ["1", "x", "1", "1"],
    ],
  },

  // ── 4-to-1 ──────────────────────────────────────────────────────────────────
  "4to1": {
    label: "4-to-1 MUX",
    selectInputs: ["S1", "S0"],
    dataInputs: ["D0", "D1", "D2", "D3"],
    output: "Y",
    description: "2 select bits → routes one of 4 data inputs to output Y",
    analogy: "Like a TV remote: two digits on the keypad (S1,S0) select one of four channels (D0–D3)",
    mux: (data, sel) => {
      const active = (sel[0] << 1) | sel[1];
      return { Y: data[active] ?? 0, active };
    },
    booleanEqs: [
      {
        label: "Output Y",
        eq: "Y = S1'·S0'·D0 + S1'·S0·D1 + S1·S0'·D2 + S1·S0·D3",
        color: "#60a5fa",
        explanation: "Each term is a minterm of S1,S0 AND-ed with its corresponding data input. Only one minterm is 1 at a time (since exactly one select combination is active), so only one data input is passed through. The OR combines all four possibilities.",
        trick: "Each minterm 'enables' exactly one data line. S1'S0' → D0, S1'S0 → D1, S1S0' → D2, S1S0 → D3. Mirror the decoder minterm pattern!",
      },
    ],
    truthHeaders: ["S1", "S0", "Y"],
    truthRows: [
      ["0", "0", "D0"],
      ["0", "1", "D1"],
      ["1", "0", "D2"],
      ["1", "1", "D3"],
    ],
  },

  // ── 8-to-1 ──────────────────────────────────────────────────────────────────
  "8to1": {
    label: "8-to-1 MUX",
    selectInputs: ["S2", "S1", "S0"],
    dataInputs: ["D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7"],
    output: "Y",
    description: "3 select bits → routes one of 8 data inputs to output Y",
    analogy: "Like a 8-way valve in a pipeline: 3 control levers (S2,S1,S0) open exactly one of 8 pipes",
    mux: (data, sel) => {
      const active = (sel[0] << 2) | (sel[1] << 1) | sel[2];
      return { Y: data[active] ?? 0, active };
    },
    booleanEqs: [
      {
        label: "Output Y",
        eq: "Y = Σ(Si'·Si'·Si'·Di) for i=0..7  [minterm expansion]",
        color: "#a78bfa",
        explanation: "Each of the 8 minterms (S2,S1,S0 combinations 000–111) enables exactly one data input. The full equation is: Y = S2'S1'S0'·D0 + S2'S1'S0·D1 + S2'S1S0'·D2 + S2'S1S0·D3 + S2S1'S0'·D4 + S2S1'S0·D5 + S2S1S0'·D6 + S2S1S0·D7",
        trick: "Convert the select bits to binary (000=0, 001=1, … 111=7). That binary number is the index of the data input that passes through.",
      },
    ],
    truthHeaders: ["S2", "S1", "S0", "Y"],
    truthRows: Array.from({ length: 8 }, (_, i) => [
      String((i >> 2) & 1),
      String((i >> 1) & 1),
      String(i & 1),
      `D${i}`,
    ]),
  },
};

// ── Quiz questions ─────────────────────────────────────────────────────────────
export const MUX_QUIZ = [
  {
    q: "In a 4-to-1 MUX with S1=1, S0=0, which data input reaches the output?",
    opts: ["D0", "D1", "D2", "D3"],
    ans: 2,
    exp: "S1=1, S0=0 → binary 10 = 2 → D2 is selected.",
    hint: "Convert S1S0 to decimal.",
  },
  {
    q: "How many select lines does an 8-to-1 MUX require?",
    opts: ["2", "3", "4", "8"],
    ans: 1,
    exp: "8 = 2³, so 3 select lines are needed. In general, a 2ⁿ-to-1 MUX needs n select lines.",
    hint: "Think: 2 raised to what power equals 8?",
  },
  {
    q: "What is the Boolean equation for a 2-to-1 MUX output?",
    opts: ["Y = S·D0 + S'·D1", "Y = S'·D0 + S·D1", "Y = S·D0·D1", "Y = S + D0 + D1"],
    ans: 1,
    exp: "Y = S'·D0 + S·D1. When S=0: S'=1 so Y=D0. When S=1: S=1 so Y=D1.",
    hint: "When S=0 (complement active), D0 passes; when S=1, D1 passes.",
  },
  {
    q: "A MUX can implement any Boolean function. How?",
    opts: [
      "By connecting all data inputs to VCC",
      "By connecting data inputs to 0 or 1 based on the truth table output column",
      "By using the select lines as outputs",
      "By cascading with a decoder",
    ],
    ans: 1,
    exp: "Feed the function's truth table output values (0 or 1) to D0…Dn. The select inputs become the function variables — the MUX routes the correct output for each input combination.",
    hint: "The select lines act as the function's input variables.",
  },
  {
    q: "Two 4-to-1 MUXes can be combined with one 2-to-1 MUX to make what?",
    opts: ["A 4-to-1 MUX", "An 8-to-1 MUX", "A 16-to-1 MUX", "A demultiplexer"],
    ans: 1,
    exp: "Two 4-to-1 MUXes feed their outputs into a 2-to-1 MUX. The final MUX uses one extra select bit to choose between the two groups → 8-to-1 total. This is cascading.",
    hint: "2 groups of 4 inputs = 8 inputs total.",
  },
];

export const MUX_QUIZ_FEEDBACK = {
  perfect: "🏆 Perfect! You have mastered multiplexers.",
  good:    "👍 Good work! Review the equations for the missed questions.",
  review:  "📚 Keep studying — focus on the select-line to data-input mapping.",
};

// ── Tips ───────────────────────────────────────────────────────────────────────
export const MUX_TIPS = [
  "A 2ⁿ-to-1 MUX always needs exactly n select lines.",
  "The select bits form a binary address that picks the data input.",
  "A MUX can implement any Boolean function by hardwiring D inputs to the truth table output column.",
  "Cascading two 2ⁿ-to-1 MUXes + one 2-to-1 MUX gives a 2ⁿ⁺¹-to-1 MUX.",
  "A MUX is essentially a decoder whose outputs are AND-ed with data lines then OR-ed together.",
  "In FPGA look-up tables (LUTs), a hidden MUX tree implements any Boolean function.",
];
