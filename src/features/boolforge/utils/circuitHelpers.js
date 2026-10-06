import { IC_TYPES, IC_META } from "../../../shared/data/gates";
import { computeGateOutput } from "./gateLogic";

function IC_META_LENGTH(type) {
  return IC_META[type].outputs;
}

// ── evaluateGateWithGates ─────────────────────────────────────────────────
// Pure re-simulation of a specific gate's value given an arbitrary gates
// array (used by the truth table generator to test different input
// combinations without mutating the live circuit state).
export function evaluateGateWithGates(gate, gatesArray, wires, outputIndex = 0) {
  const localGateMap = new Map();
  gatesArray.forEach((g) => localGateMap.set(g.id, g));
  const incomingWires = new Map();
  gatesArray.forEach((g) => incomingWires.set(g.id, []));
  wires.forEach((w) => {
    if (incomingWires.has(w.toId)) incomingWires.get(w.toId).push(w);
  });

  let prev = new Map();
  gatesArray.forEach((g) => {
    if (g.type === "INPUT") prev.set(g.id, g.inputValues[0] || false);
    else if (IC_TYPES.has(g.type)) prev.set(g.id, Array(IC_META_LENGTH(g.type)).fill(false));
    else prev.set(g.id, false);
  });

  for (let iter = 0; iter < 100; iter++) {
    const next = new Map(prev);
    let changed = false;
    for (const g of gatesArray) {
      if (g.type === "INPUT") continue;
      const inputs = [];
      for (const w of incomingWires.get(g.id) || []) {
        const srcVal = prev.get(w.fromId);
        if (IC_TYPES.has(localGateMap.get(w.fromId)?.type) && Array.isArray(srcVal))
          inputs[w.toIndex] = srcVal[w.fromOutputIndex ?? 0] ?? false;
        else inputs[w.toIndex] = srcVal ?? false;
      }
      if (IC_TYPES.has(g.type)) {
        const numOut = IC_META_LENGTH(g.type);
        const newVals = Array.from({ length: numOut }, (_, i) => computeGateOutput(g, inputs, i));
        const oldVals = prev.get(g.id);
        if (!Array.isArray(oldVals) || newVals.some((v, i) => v !== oldVals[i])) {
          next.set(g.id, newVals);
          changed = true;
        }
      } else {
        const newVal = computeGateOutput(g, inputs);
        next.set(g.id, newVal);
        if (prev.get(g.id) !== newVal) changed = true;
      }
    }
    prev = next;
    if (!changed) break;
  }
  const val = prev.get(gate.id);
  if (Array.isArray(val)) return val[outputIndex] ?? false;
  return val ?? false;
}

// ── deriveExpression ───────────────────────────────────────────────────────
// Walks the wiring graph backward from a gate to build a boolean expression
// string (e.g. "A.B+C'").
export function deriveExpression(gate, gatesArray, wires, depth = 0, visited = new Set()) {
  if (!gate || depth > 20 || visited.has(gate.id)) return "?";
  const newVisited = new Set(visited);
  newVisited.add(gate.id);
  if (gate.type === "INPUT") {
    const incoming = wires.find((w) => w.toId === gate.id);
    if (incoming) {
      const src = gatesArray.find((g) => g.id === incoming.fromId);
      return deriveExpression(src, gatesArray, wires, depth + 1, newVisited);
    }
    return gate.label;
  }

  const incomingForGate = wires.filter((w) => w.toId === gate.id);
  const slotExprs = {};
  incomingForGate.forEach((w) => {
    const src = gatesArray.find((g) => g.id === w.fromId);
    slotExprs[w.toIndex] = deriveExpression(src, gatesArray, wires, depth + 1, newVisited);
  });
  const slots = Object.keys(slotExprs).sort((a, b) => Number(a) - Number(b)).map((k) => slotExprs[k]);
  if (slots.length === 0) return gate.label || gate.type;

  const wrap = (expr) => (expr.includes("+") || expr.includes("⊕") ? `(${expr})` : expr);
  switch (gate.type) {
    case "OUTPUT":
    case "BUFFER": return slots[0];
    case "NOT": return `${wrap(slots[0])}'`;
    case "AND": return slots.map(wrap).join(".");
    case "NAND": return `(${slots.map(wrap).join(".")})'`;
    case "OR": return slots.join("+");
    case "NOR": return `(${slots.join("+")})'`;
    case "XOR": return slots.join("⊕");
    case "XNOR": return `(${slots.join("⊕")})'`;
   default: return `${gate.label || gate.type}(${slots.join(",")})`;
  }
}
