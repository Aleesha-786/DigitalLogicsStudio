// Truth tables and "build every other gate from this one" implementation
// strings for the Universal Gates page. Pure data — no React, no state.

export const gateImplementations = {
  NAND: {
    title: 'NAND Gate',
    description: 'NOT AND - The negation of AND gate output',
    truthTable: [
      { inputs: { A: false, B: false }, outputs: { Q: true } },
      { inputs: { A: false, B: true }, outputs: { Q: true } },
      { inputs: { A: true, B: false }, outputs: { Q: true } },
      { inputs: { A: true, B: true }, outputs: { Q: false } },
    ],
    implementations: {
      NOT: 'Q = NAND(A, A)',
      AND: 'Q = NAND(NAND(A, B), NAND(A, B))',
      OR: 'Q = NAND(NAND(A, A), NAND(B, B))',
      XOR: 'Q = NAND(NAND(NAND(A, B), A), NAND(NAND(A, B), B))',
      NOR: 'Q = NAND(NAND(NAND(A, A), NAND(B, B)), NAND(NAND(A, A), NAND(B, B)))',
    },
  },
  NOR: {
    title: 'NOR Gate',
    description: 'NOT OR - The negation of OR gate output',
    truthTable: [
      { inputs: { A: false, B: false }, outputs: { Q: true } },
      { inputs: { A: false, B: true }, outputs: { Q: false } },
      { inputs: { A: true, B: false }, outputs: { Q: false } },
      { inputs: { A: true, B: true }, outputs: { Q: false } },
    ],
    implementations: {
      NOT: 'Q = NOR(A, A)',
      OR: 'Q = NOR(NOR(A, B), NOR(A, B))',
      AND: 'Q = NOR(NOR(A, A), NOR(B, B))',
      XOR: 'Q = NOR(NOR(A, NOR(A, B)), NOR(B, NOR(A, B)))',
      NAND: 'Q = NOR(NOR(NOR(A, A), NOR(B, B)), NOR(NOR(A, A), NOR(B, B)))',
    },
  },
};

export const universalGateDemoInputs = [
  { name: 'A', label: 'Input A' },
  { name: 'B', label: 'Input B' },
];

export const complexExpressions = [
  { expression: "F = A\u00b7B + C\u00b7D", hint: 'Hint: Break into AND and OR operations' },
  { expression: "F = (A + B)\u00b7(C' + D)", hint: 'Hint: Handle complement and distribution' },
];

export const implementationDescriptions = {
  NOT: 'Using both inputs of the same universal gate creates a NOT gate',
  AND: 'Double negation of NAND gives AND functionality',
  OR: "De Morgan's law applied to NAND creates OR",
  XOR: 'Complex combination using only universal gates',
  NOR: 'Creating NOR from NAND (or vice versa)',
};
