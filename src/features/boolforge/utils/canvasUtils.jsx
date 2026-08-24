import { SINGLE_INPUT_GATES, GATE_HEIGHT, GATE_WIDTH, IC_HEIGHTS } from './constants';
import { IC_META, IC_TYPES } from "../../../shared/data/gates";

export function defaultInputCount(type) {
  if (type === "INPUT") return 0;
  if (SINGLE_INPUT_GATES.has(type)) return 1;
  if (IC_TYPES.has(type)) return IC_META[type].inputs;
  return 2;
}

export function getICHeight(type) {
  return IC_HEIGHTS[type] ?? 100;
}

export function getGateHeight(gate) {
  return IC_TYPES.has(gate.type) ? getICHeight(gate.type) : GATE_HEIGHT;
}

export function getInputY(gate, inputIndex) {
  const h = getGateHeight(gate);
  if (IC_TYPES.has(gate.type)) {
    const n = IC_META[gate.type].inputs;
    if (n === 1) return gate.y + h / 2;
    return gate.y + 0.1 * h + (inputIndex / (n - 1)) * (0.8 * h);
  }
  const n = gate.inputs;
  if (n === 1) return gate.y + h / 2;
  if (n === 2) return gate.y + (inputIndex === 0 ? 0.35 : 0.65) * h;
  return gate.y + 0.15 * h + (inputIndex / (n - 1)) * 0.7 * h;
}

export function getOutputY(gate, outputIndex) {
  const h = getGateHeight(gate);
  if (!IC_TYPES.has(gate.type)) return gate.y + h / 2;
  const n = IC_META[gate.type].outputs;
  if (n === 1) return gate.y + h / 2;
  return gate.y + 0.1 * h + (outputIndex / (n - 1)) * (0.8 * h);
}

export function getCurvePoints(fromX, fromY, toX, toY) {
  const dx = toX - fromX;
  const distance = Math.hypot(dx, toY - fromY) || 1;
  const controlDistance = Math.max(40, Math.min(Math.abs(dx) / 2, distance / 3));
  return {
    fromX, fromY, toX, toY,
    cp1x: fromX + controlDistance, cp1y: fromY,
    cp2x: toX - controlDistance, cp2y: toY,
  };
}

export function getWirePoints(fromGate, toGate, fromOutputIndex, toIndex) {
  return getCurvePoints(
    fromGate.x + GATE_WIDTH,
    getOutputY(fromGate, fromOutputIndex ?? 0),
    toGate.x,
    getInputY(toGate, toIndex),
  );
}

export function wirePathD(pts) {
  return `M ${pts.fromX} ${pts.fromY} C ${pts.cp1x} ${pts.cp1y}, ${pts.cp2x} ${pts.cp2y}, ${pts.toX} ${pts.toY}`;
}

export function hitWireAt(x, y, wires, gateMap, radius = 12) {
  const SAMPLES = 64;
  for (const wire of wires) {
    const fromGate = gateMap.get(wire.fromId);
    const toGate = gateMap.get(wire.toId);
    if (!fromGate || !toGate) continue;
    const pts = getWirePoints(
      fromGate,
      toGate,
      wire.fromOutputIndex,
      wire.toIndex,
    );
    for (let i = 0; i <= SAMPLES; i++) {
      const t = i / SAMPLES;
      const mt = 1 - t;
      const bx =
        mt ** 3 * pts.fromX +
        3 * mt ** 2 * t * pts.cp1x +
        3 * mt * t ** 2 * pts.cp2x +
        t ** 3 * pts.toX;
      const by =
        mt ** 3 * pts.fromY +
        3 * mt ** 2 * t * pts.cp1y +
        3 * mt * t ** 2 * pts.cp2y +
        t ** 3 * pts.toY;
      if (Math.hypot(bx - x, by - y) <= radius) return wire;
    }
  }
  return null;
}
