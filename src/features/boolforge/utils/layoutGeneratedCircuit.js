const X_GAP = 220;
const Y_GAP = 130;
const ORIGIN_X = 80;
const ORIGIN_Y = 80;

/**
 * Spread AI-generated gates into left-to-right columns from the wire graph
 * so they are not dumped on a single horizontal line.
 */
export function layoutGeneratedCircuit(gates, wires, options = {}) {
  if (!Array.isArray(gates) || gates.length === 0) return gates;

  const xGap = options.xGap ?? X_GAP;
  const yGap = options.yGap ?? Y_GAP;
  const originX = options.originX ?? ORIGIN_X;
  const originY = options.originY ?? ORIGIN_Y;

  const ids = gates.map((gate) => gate.id);
  const preds = new Map(ids.map((id) => [id, new Set()]));
  const succs = new Map(ids.map((id) => [id, new Set()]));

  (wires || []).forEach((wire) => {
    if (!succs.has(wire.fromId) || !preds.has(wire.toId)) return;
    succs.get(wire.fromId).add(wire.toId);
    preds.get(wire.toId).add(wire.fromId);
  });

  const indegree = new Map(ids.map((id) => [id, preds.get(id).size]));
  const layer = new Map();
  const queue = [];

  ids.forEach((id) => {
    if (indegree.get(id) === 0) {
      layer.set(id, 0);
      queue.push(id);
    }
  });

  while (queue.length > 0) {
    const u = queue.shift();
    succs.get(u).forEach((v) => {
      layer.set(v, Math.max(layer.get(v) || 0, (layer.get(u) || 0) + 1));
      indegree.set(v, indegree.get(v) - 1);
      if (indegree.get(v) === 0) queue.push(v);
    });
  }

  const maxAssigned = Math.max(0, ...layer.values());
  ids.forEach((id) => {
    if (!layer.has(id)) layer.set(id, maxAssigned + 1);
  });

  const maxLogic = Math.max(
    0,
    ...gates
      .filter((gate) => (gate.type || "").toUpperCase() !== "OUTPUT")
      .map((gate) => layer.get(gate.id) || 0),
  );
  const outCol = maxLogic + 1;

  gates.forEach((gate) => {
    const type = (gate.type || "").toUpperCase();
    if (type === "INPUT") layer.set(gate.id, 0);
    if (type === "OUTPUT") layer.set(gate.id, outCol);
  });

  const columns = new Map();
  gates.forEach((gate) => {
    const col = layer.get(gate.id) || 0;
    if (!columns.has(col)) columns.set(col, []);
    columns.get(col).push(gate);
  });

  const maxColSize = Math.max(1, ...[...columns.values()].map((col) => col.length));
  const totalHeight = (maxColSize - 1) * yGap;

  return gates.map((gate) => {
    const col = layer.get(gate.id) || 0;
    const siblings = columns.get(col) || [gate];
    const index = siblings.findIndex((item) => item.id === gate.id);
    const colHeight = (siblings.length - 1) * yGap;
    const yOffset = (totalHeight - colHeight) / 2;
    return {
      ...gate,
      x: originX + col * xGap,
      y: originY + yOffset + index * yGap,
    };
  });
}
