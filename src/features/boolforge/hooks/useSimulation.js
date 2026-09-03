import { useCallback, useMemo, useRef } from "react";
import { evaluateCircuitGraph, generateTruthTable } from "../utils";

// Independent of UI: runs the combinational-logic simulation over the
// current gates/wires graph, and produces the truth table.
export function useSimulation({ gates, wires, gateMap }) {
  const gateStateRef = useRef(new Map());

  const gateValues = useMemo(() => {
    const result = evaluateCircuitGraph(gates, wires, gateStateRef.current);
    gateStateRef.current = result;
    return result;
  }, [gates, wires]);

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