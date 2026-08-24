import { useCallback, useMemo, useRef } from "react";
import { IC_META, IC_TYPES } from "../../../shared/data/gates";
import { computeGateOutput, generateTruthTable } from "../utils";

// Independent of UI: runs the combinational-logic simulation over the
// current gates/wires graph, and produces the truth table.
export function useSimulation({ gates, wires, gateMap }) {
  const gateStateRef = useRef(new Map());

  const gateValues = useMemo(() => {
    const incomingWires = new Map();
    gates.forEach((g) => incomingWires.set(g.id, []));
    wires.forEach((w) => {
      if (incomingWires.has(w.toId)) incomingWires.get(w.toId).push(w);
    });

    let prev = new Map();
    gates.forEach((g) => {
      if (g.type === "INPUT") {
        prev.set(g.id, g.inputValues[0] || false);
      } else if (IC_TYPES.has(g.type)) {
        const numOut = IC_META[g.type].outputs;
        const cached = gateStateRef.current.get(g.id);
        prev.set(g.id, Array.isArray(cached) ? cached : Array(numOut).fill(false));
      } else {
        prev.set(g.id, gateStateRef.current.get(g.id) ?? false);
      }
    });

    const MAX_ITER = 100;
    for (let iter = 0; iter < MAX_ITER; iter++) {
      const next = new Map(prev);
      let changed = false;
      for (const gate of gates) {
        if (gate.type === "INPUT") {
          const incoming = incomingWires.get(gate.id) || [];
          let v = gate.inputValues[0] || false;
          if (incoming.length > 0) {
            const w = incoming[0];
            const srcVal = prev.get(w.fromId);
            if (IC_TYPES.has(gateMap.get(w.fromId)?.type) && Array.isArray(srcVal)) {
              v = srcVal[w.fromOutputIndex ?? 0] ?? false;
            } else {
              v = srcVal ?? false;
            }
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
          if (IC_TYPES.has(gateMap.get(w.fromId)?.type) && Array.isArray(srcVal)) {
            inputs[w.toIndex] = srcVal[w.fromOutputIndex ?? 0] ?? false;
          } else {
            inputs[w.toIndex] = srcVal ?? false;
          }
        }
        if (IC_TYPES.has(gate.type)) {
          const numOut = IC_META[gate.type].outputs;
          const newVals = Array.from({ length: numOut }, (_, i) =>
            computeGateOutput(gate, inputs, i)
          );
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
    gateStateRef.current = prev;
    return prev;
  }, [gates, wires, gateMap]);

  const evaluateGate = useCallback(
    (gate, outputIndex = 0) => {
      if (!gate) return false;
      const val = gateValues.get(gate.id);
      if (Array.isArray(val)) return val[outputIndex] ?? false;
      return val ?? false;
    },
    [gateValues]
  );

  const truthTable = useMemo(() => generateTruthTable(gates, wires), [gates, wires]);

  return { gateValues, evaluateGate, truthTable };
}
