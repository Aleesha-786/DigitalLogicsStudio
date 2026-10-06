// Static list of the core logic-gate reference cards used on the
// Gate Explanation page. Kept as pure data so it can be reused or
// tested independently of the JSX that renders it.

export const gates = [
  { type: 'AND', title: 'AND', desc: 'Outputs 1 only if all inputs are 1.' },
  { type: 'OR', title: 'OR', desc: 'Outputs 1 if any input is 1.' },
  { type: 'NOT', title: 'NOT', desc: "Inverts the input: 1 \u2192 0, 0 \u2192 1." },
  { type: 'NAND', title: 'NAND', desc: 'Inverse of AND; outputs 0 only if all inputs are 1.' },
  { type: 'NOR', title: 'NOR', desc: 'Inverse of OR; outputs 1 only if all inputs are 0.' },
  { type: 'XOR', title: 'XOR', desc: 'Outputs 1 when inputs differ.' },
  { type: 'XNOR', title: 'XNOR', desc: 'Outputs 1 when inputs are equal.' },
  { type: 'BUFFER', title: 'BUFFER', desc: 'Passes input to output unchanged.' },
];

export const gateExplanationExample = "F = A'B + AB'";
export const gateExplanationVariables = ['A', 'B'];
