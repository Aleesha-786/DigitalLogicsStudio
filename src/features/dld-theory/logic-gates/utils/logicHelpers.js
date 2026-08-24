// Pure, framework-free helper functions extracted from OddFunction.jsx.
// No React, no state — safe to reuse or unit test anywhere (e.g. a future
// "Parity Generator" feature).

/**
 * XOR of 3 boolean inputs: (A ⊕ B) ⊕ C.
 * @param {{A: boolean, B: boolean, C: boolean}} inputs
 * @returns {boolean}
 */
export function calculateXOR3(inputs) {
  const values = Object.values(inputs);
  return values[0] !== values[1] !== values[2];
}

/**
 * Parity check: true when the number of `true` values is odd.
 * @param {Record<string, boolean>} inputs
 * @returns {boolean}
 */
export function calculateParity(inputs) {
  const values = Object.values(inputs);
  const ones = values.filter(Boolean).length;
  return ones % 2 === 1;
}

/**
 * Static truth table for the 3-variable odd function (XOR/parity),
 * matching the shape InteractiveDemo expects: { inputs, outputs }.
 */
export function generateOddFunctionTruthTable() {
  return [
    { inputs: { A: false, B: false, C: false }, outputs: { 'A\u2295B\u2295C': false, Parity: false } },
    { inputs: { A: false, B: false, C: true }, outputs: { 'A\u2295B\u2295C': true, Parity: true } },
    { inputs: { A: false, B: true, C: false }, outputs: { 'A\u2295B\u2295C': true, Parity: true } },
    { inputs: { A: false, B: true, C: true }, outputs: { 'A\u2295B\u2295C': false, Parity: false } },
    { inputs: { A: true, B: false, C: false }, outputs: { 'A\u2295B\u2295C': true, Parity: true } },
    { inputs: { A: true, B: false, C: true }, outputs: { 'A\u2295B\u2295C': false, Parity: false } },
    { inputs: { A: true, B: true, C: false }, outputs: { 'A\u2295B\u2295C': false, Parity: false } },
    { inputs: { A: true, B: true, C: true }, outputs: { 'A\u2295B\u2295C': true, Parity: true } },
  ];
}
