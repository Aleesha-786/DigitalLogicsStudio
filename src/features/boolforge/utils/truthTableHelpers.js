import { IC_META, IC_TYPES } from "../../../shared/data/gates";
import { evaluateGateWithGates, deriveExpression } from "./circuitHelpers";

// Pure function: given the current gates & wires, compute the full truth
// table { headers, rows }. No React state involved.
export function generateTruthTable(gates, wires) {
  const inputs = gates.filter((g) => g.type === "INPUT");
  const outputs = gates.filter((g) => g.type === "OUTPUT");
  if (inputs.length === 0 || outputs.length === 0) return { headers: [], rows: [] };

  const intermediates = gates.filter((g) => g.type !== "INPUT" && g.type !== "OUTPUT").sort((a, b) => a.x - b.x);
  const visibleIntermediates = intermediates.filter((g) => {
    const outgoingWires = wires.filter((w) => w.fromId === g.id);
    return outgoingWires.length > 0 && outgoingWires.some((w) => !outputs.some((o) => o.id === w.toId));
  });

  const rawLabels = visibleIntermediates.map((g) => g.label || g.type);
  const labelCount = {};
  rawLabels.forEach((l) => { labelCount[l] = (labelCount[l] || 0) + 1; });
  const labelSeen = {};
  const getIntermediateLabel = (gate) => {
    const base = gate.label || gate.type;
    if (labelCount[base] > 1) {
      labelSeen[base] = (labelSeen[base] || 0) + 1;
      return `${base}${labelSeen[base]}`;
    }
    return base;
  };

  const numCombinations = 1 << inputs.length;
  const rows = [];
  for (let i = 0; i < numCombinations; i++) {
    const inputValues = inputs.map((_, idx) => Boolean((i >> (inputs.length - 1 - idx)) & 1));
    const tempGates = gates.map((g) => {
      if (g.type === "INPUT") {
        const index = inputs.findIndex((inp) => inp.id === g.id);
        return { ...g, inputValues: [inputValues[index]] };
      }
      return g;
    });

    const intermediateValues = visibleIntermediates.map((intGate) => {
      const gate = tempGates.find((g) => g.id === intGate.id);
      if (IC_TYPES.has(intGate.type)) {
        const numOut = IC_META[intGate.type].outputs;
        return Array.from({ length: numOut }, (_, oi) => evaluateGateWithGates(gate, tempGates, wires, oi) ? 1 : 0).join("/");
      }
      return evaluateGateWithGates(gate, tempGates, wires) ? 1 : 0;
    });

    const outputValues = outputs.map((outGate) => {
      const gate = tempGates.find((g) => g.id === outGate.id);
      return evaluateGateWithGates(gate, tempGates, wires) ? 1 : 0;
    });

    rows.push([...inputValues.map((v) => (v ? 1 : 0)), ...intermediateValues, ...outputValues]);
  }

  return {
    headers: [
      ...inputs.map((g) => g.label),
      ...visibleIntermediates.map(getIntermediateLabel),
      ...outputs.map((g) => {
        const expr = deriveExpression(g, gates, wires);
        return expr && expr !== g.label ? `${g.label}=${expr}` : g.label;
      }),
    ],
    rows,
  };
}
