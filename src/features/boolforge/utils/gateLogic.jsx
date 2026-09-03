import { IC_META, IC_TYPES } from "../../../shared/data/gates";

export const computeGateOutput = (gate, inputs, outputIndex = 0) => {
  const ci = inputs.filter((v) => v !== undefined);
  switch (gate.type) {
    case "INPUT":
      return gate.inputValues[0] || false;
    case "AND": {
      const n = gate.inputs || 2;
      let allHigh = true;
      for (let i = 0; i < n; i++)
        if (!(inputs[i] ?? false)) {
          allHigh = false;
          break;
        }
      return allHigh;
    }
    case "OR":
      return ci.some(Boolean);
    case "NOT":
      return inputs[0] !== undefined ? !inputs[0] : false;
    case "NAND": {
      const n = gate.inputs || 2;
      let allHigh = true;
      for (let i = 0; i < n; i++)
        if (!(inputs[i] ?? false)) {
          allHigh = false;
          break;
        }
      return !allHigh;
    }
    case "NOR":
      return !ci.some(Boolean);
    case "XOR":
      return ci.length >= 2 && ci.reduce((acc, v) => acc !== v, false);
    case "XNOR":
      return ci.length >= 2 && !ci.reduce((acc, v) => acc !== v, false);
    case "BUFFER":
    case "OUTPUT":
      return inputs[0] ?? false;
    case "MUX2": {
      const s = inputs[2] ?? false;
      return s ? (inputs[1] ?? false) : (inputs[0] ?? false);
    }
    case "MUX4": {
      const s0 = inputs[4] ?? false,
        s1 = inputs[5] ?? false;
      const sel = (s1 ? 2 : 0) + (s0 ? 1 : 0);
      return inputs[sel] ?? false;
    }
    case "MUX8": {
      const s0 = inputs[8] ?? false,
        s1 = inputs[9] ?? false,
        s2 = inputs[10] ?? false;
      const sel = (s2 ? 4 : 0) + (s1 ? 2 : 0) + (s0 ? 1 : 0);
      return inputs[sel] ?? false;
    }
    case "DEMUX2": {
      const d = inputs[0] ?? false,
        s = inputs[1] ?? false;
      if (outputIndex === 0) return !s && d;
      if (outputIndex === 1) return s && d;
      return false;
    }
    case "DEMUX4": {
      const d = inputs[0] ?? false,
        s0 = inputs[1] ?? false,
        s1 = inputs[2] ?? false;
      const sel = (s1 ? 2 : 0) + (s0 ? 1 : 0);
      return sel === outputIndex && d;
    }
    case "DEMUX8": {
      const d = inputs[0] ?? false,
        s0 = inputs[1] ?? false,
        s1 = inputs[2] ?? false,
        s2 = inputs[3] ?? false;
      const sel = (s2 ? 4 : 0) + (s1 ? 2 : 0) + (s0 ? 1 : 0);
      return sel === outputIndex && d;
    }
    case "ENC4": {
      let code = 0;
      for (let i = 3; i >= 0; i--) {
        if (inputs[i]) {
          code = i;
          break;
        }
      }
      return outputIndex === 0 ? Boolean(code & 2) : Boolean(code & 1);
    }
    case "ENC8": {
      let code = 0;
      for (let i = 7; i >= 0; i--) {
        if (inputs[i]) {
          code = i;
          break;
        }
      }
      return outputIndex === 0
        ? Boolean(code & 4)
        : outputIndex === 1
          ? Boolean(code & 2)
          : Boolean(code & 1);
    }
    case "DEC4": {
      const sel = ((inputs[1] ?? false) ? 2 : 0) + ((inputs[0] ?? false) ? 1 : 0);
      return sel === outputIndex;
    }
    case "DEC8": {
      const sel =
        ((inputs[2] ?? false) ? 4 : 0) +
        ((inputs[1] ?? false) ? 2 : 0) +
        ((inputs[0] ?? false) ? 1 : 0);
      return sel === outputIndex;
    }
    case "HALF_ADDER": {
      const a = inputs[0] ?? false,
        b = inputs[1] ?? false;
      return outputIndex === 0 ? a !== b : a && b;
    }
    case "FULL_ADDER": {
      const a = inputs[0] ?? false,
        b = inputs[1] ?? false,
        cin = inputs[2] ?? false;
      const sum = (a !== b) !== cin;
      const cout = (a && b) || (cin && a !== b);
      return outputIndex === 0 ? sum : cout;
    }
    case "ADD4": {
      const a = [inputs[0], inputs[1], inputs[2], inputs[3]].map((v) => v ?? false);
      const b = [inputs[4], inputs[5], inputs[6], inputs[7]].map((v) => v ?? false);
      let carry = inputs[8] ?? false;
      const sums = [];
      for (let i = 0; i < 4; i++) {
        const xor_ab = a[i] !== b[i];
        sums[i] = xor_ab !== carry;
        carry = (a[i] && b[i]) || (carry && xor_ab);
      }
      return outputIndex === 4 ? carry : sums[outputIndex];
    }
    case "CLADD4": {
      const a = [inputs[0], inputs[1], inputs[2], inputs[3]].map((v) => v ?? false);
      const b = [inputs[4], inputs[5], inputs[6], inputs[7]].map((v) => v ?? false);
      const cin = inputs[8] ?? false;
      const g = a.map((ai, i) => ai && b[i]);
      const p = a.map((ai, i) => ai !== b[i]);
      const c = [cin];
      for (let i = 0; i < 4; i++) c[i + 1] = g[i] || (p[i] && c[i]);
      const sums = p.map((pi, i) => pi !== c[i]);
      return outputIndex === 4 ? c[4] : sums[outputIndex];
    }
    case "HALF_SUBTRACTOR": {
      const a = inputs[0] ?? false,
        b = inputs[1] ?? false;
      return outputIndex === 0 ? a !== b : !a && b;
    }
    case "FULL_SUBTRACTOR": {
      const a = inputs[0] ?? false,
        b = inputs[1] ?? false,
        bin = inputs[2] ?? false;
      const diff = (a !== b) !== bin;
      const bout = (!a && b) || (!a && bin) || (b && bin);
      return outputIndex === 0 ? diff : bout;
    }
    default:
      return false;
  }
};
  // Runs the fixed-point combinational simulation over an arbitrary
// gates/wires graph. Used for both the top-level canvas circuit and,
// recursively, for any CUSTOM_ component's own internal circuit — so a
// custom component simulates by literally re-running this same
// algorithm on its stored definition, with its own input values fed
// into its own INPUT gates.
//
// `prevState` is a Map used both to seed multi-output/feedback gates
// with their last known value (so latches built from gates hold state
// across renders) and, for CUSTOM_ gates, to stash each instance's own
// nested state under the key `${gate.id}:inner` so multiple placed
// instances of the same component don't share state.
  export function evaluateCircuitGraph(gates, wires, prevState = new Map()) {
  const gateMap = new Map(gates.map((g) => [g.id, g]));
  const incomingWires = new Map();
  gates.forEach((g) => incomingWires.set(g.id, []));
  wires.forEach((w) => {
    if (incomingWires.has(w.toId)) incomingWires.get(w.toId).push(w);
  });

  const isMultiOutput = (g) =>
    g && (IC_TYPES.has(g.type) || (g.type?.startsWith("CUSTOM_") && g.customDefinition));

  let prev = new Map();
  gates.forEach((g) => {
    if (g.type === "INPUT") {
      prev.set(g.id, g.inputValues?.[0] || false);
    } else if (isMultiOutput(g)) {
      const numOut = IC_TYPES.has(g.type)
        ? IC_META[g.type].outputs
        : g.customDefinition.outputs.length;
      const cached = prevState.get(g.id);
      prev.set(g.id, Array.isArray(cached) ? cached : Array(numOut).fill(false));
    } else {
      prev.set(g.id, prevState.get(g.id) ?? false);
    }
  });

  const MAX_ITER = 100;
  for (let iter = 0; iter < MAX_ITER; iter++) {
    const next = new Map(prev);
    let changed = false;

    for (const gate of gates) {
      if (gate.type === "INPUT") {
        const incoming = incomingWires.get(gate.id) || [];
        let v = gate.inputValues?.[0] || false;
        if (incoming.length > 0) {
          const w = incoming[0];
          const srcVal = prev.get(w.fromId);
          v = isMultiOutput(gateMap.get(w.fromId)) && Array.isArray(srcVal)
            ? srcVal[w.fromOutputIndex ?? 0] ?? false
            : srcVal ?? false;
        }
        if (prev.get(gate.id) !== v) {
          next.set(gate.id, v);
          changed = true;
        }
        continue;
      }

      const inputs = [];
      for (const w of incomingWires.get(gate.id) || []) {
        const srcVal = prev.get(w.fromId);
        inputs[w.toIndex] = isMultiOutput(gateMap.get(w.fromId)) && Array.isArray(srcVal)
          ? srcVal[w.fromOutputIndex ?? 0] ?? false
          : srcVal ?? false;
      }

      if (gate.type?.startsWith("CUSTOM_") && gate.customDefinition) {
        const { gates: innerGates, wires: innerWires } = gate.customDefinition;
        const innerInputGates = innerGates.filter((g) => g.type === "INPUT");
        const innerOutputGates = innerGates.filter((g) => g.type === "OUTPUT");
        const seededInner = innerGates.map((g) =>
          g.type === "INPUT"
            ? { ...g, inputValues: [inputs[innerInputGates.indexOf(g)] ?? false] }
            : g,
        );
        const innerPrevState = prevState.get(`${gate.id}:inner`) || new Map();
        const innerResult = evaluateCircuitGraph(seededInner, innerWires, innerPrevState);
        prevState.set(`${gate.id}:inner`, innerResult);
        const newVals = innerOutputGates.map((og) => innerResult.get(og.id) ?? false);
        const oldVals = prev.get(gate.id);
        if (!Array.isArray(oldVals) || newVals.some((v, i) => v !== oldVals[i])) {
          next.set(gate.id, newVals);
          changed = true;
        }
      } else if (IC_TYPES.has(gate.type)) {
        const numOut = IC_META[gate.type].outputs;
        const newVals = Array.from({ length: numOut }, (_, i) => computeGateOutput(gate, inputs, i));
        const oldVals = prev.get(gate.id);
        if (!Array.isArray(oldVals) || newVals.some((v, i) => v !== oldVals[i])) {
          next.set(gate.id, newVals);
          changed = true;
        }
      } else {
        const newVal = computeGateOutput(gate, inputs);
        next.set(gate.id, newVal);
        if (prev.get(gate.id) !== newVal) changed = true;
      }
    }

    prev = next;
    if (!changed) break;
  }

  return prev;
}

