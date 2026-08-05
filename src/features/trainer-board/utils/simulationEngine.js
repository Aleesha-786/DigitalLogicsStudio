import { IC_LOGIC } from "./icCatalog";
import { readNode, writeNode, allOutputPins } from "./netlist";

// Runs the combinational settle: seeds power rails + live external
// sources, then relaxes every placed IC's combinational outputs across a
// few passes so multi-gate chains stabilize (plenty for a trainer-board
// scale netlist — no need for a full topological sort).
export function evaluateCircuit(ns, placedICs, sources, icRegs) {
  const values = new Map();
  const shorts = new Set(); // NEW: resolved node-keys with conflicting drivers
  writeNode(ns, values, "NET_VCC", 1);
  writeNode(ns, values, "NET_GND", 0);
  Object.entries(sources).forEach(([ref, val]) => writeNode(ns, values, ref, val ? 1 : 0));

  // NEW: VCC wired directly to GND (no chip in between) — always a hard short.
  if (ns.find("NET_VCC") === ns.find("NET_GND")) {
    shorts.add(ns.find("NET_VCC"));
  }

  const PASSES = 4;
  for (let pass = 0; pass < PASSES; pass++) {
    // NEW: only trust conflicts on the final (settled) pass — earlier passes
    // can show transient mismatches while values are still propagating.
    const isFinalPass = pass === PASSES - 1;
    const driverMap = isFinalPass ? new Map() : null; // node -> first value driven this pass

    placedICs.forEach((p) => {
      const logic = IC_LOGIC[p.ic];
      if (!logic) return;
      const pin = (n) => `${p.id}_p${n}`;
      const rd = (n) => readNode(ns, values, pin(n));
      const wr = (n, v) => {
        writeNode(ns, values, pin(n), v);
        // NEW: record every driven output per node to catch output-vs-output conflicts
        if (driverMap) {
          const node = ns.find(pin(n));
          const bit = v & 1;
          const seen = driverMap.get(node);
          if (seen !== undefined && seen !== bit) {
            shorts.add(node);
          } else {
            driverMap.set(node, bit);
          }
        }
      };
      const powered = ns.find(pin(logic.vcc)) === ns.find("NET_VCC")
        && ns.find(pin(logic.gnd)) === ns.find("NET_GND");
      if (!powered) {
        // Chip has no power/ground connection — force every output pin LOW
        // and skip its logic entirely (matches real unpowered-TTL behavior).
        allOutputPins(logic).forEach((n) => wr(n, 0));
      } else {
        if (logic.gates) {
          logic.gates.forEach((g) => wr(g.out, g.fn(...g.in.map(rd))));
        }
        if (logic.flops) {
          // Combinational part only (Q/Qbar outputs + async preset/clear).
          // Clocked D/J-K updates happen in the sequential effect below.
          const reg = icRegs[p.id] || {};
          logic.flops.forEach((f, i) => {
            let q = reg.q ? reg.q[i] : 0;
            if (rd(f.clr) === 0) q = 0; // active-low async clear
            else if (rd(f.pr) === 0) q = 1; // active-low async preset
            wr(f.q, q);
            wr(f.qb, 1 - q);
          });
        }
        if (logic.msi === "adder") {
          const a = logic.a.map(rd), b = logic.b.map(rd), cin = rd(logic.cin);
          let carry = cin;
          const s = [];
          for (let i = 0; i < 4; i++) {
            const t = a[i] + b[i] + carry;
            s.push(t & 1);
            carry = t >> 1;
          }
          logic.s.forEach((pinNum, i) => wr(pinNum, s[i]));
          wr(logic.cout, carry);
        }
        if (logic.msi === "comparator") {
          const a = logic.a.map(rd).reduce((acc, v, i) => acc | (v << i), 0);
          const b = logic.b.map(rd).reduce((acc, v, i) => acc | (v << i), 0);
          let gt = a > b, lt = a < b, eq = a === b;
          if (eq) { gt = rd(logic.gtIn) === 1; lt = rd(logic.ltIn) === 1; eq = rd(logic.eqIn) === 1 && !gt && !lt; }
          wr(logic.gtOut, gt ? 1 : 0);
          wr(logic.ltOut, lt ? 1 : 0);
          wr(logic.eqOut, eq ? 1 : 0);
        }
        if (logic.msi === "decoder") {
          const sel = logic.a.map(rd).reduce((acc, v, i) => acc | (v << i), 0);
          const enabled = rd(logic.e1) === 1 && rd(logic.e2a) === 0 && rd(logic.e2b) === 0;
          logic.y.forEach((pinNum, i) => wr(pinNum, enabled && i === sel ? 0 : 1)); // active-low
        }
        if (logic.msi === "mux") {
          const sel = logic.s.map(rd).reduce((acc, v, i) => acc | (v << i), 0);
          const strobed = rd(logic.strobe) === 0; // active-low enable
          const out = strobed ? rd(logic.d[sel]) : 0;
          wr(logic.y, out);
          wr(logic.yb, 1 - out);
        }
        if (logic.msi === "bcd7seg") {
          const bcd = logic.bcd.map(rd).reduce((acc, v, i) => acc | (v << i), 0);
          const blanked = rd(logic.bi) === 0 || (rd(logic.rbi) === 0 && bcd === 0);
          const lampTest = rd(logic.lt) === 0;
          // Standard 7-seg patterns for 0-9 (1 = segment ON), blank otherwise.
          const PATTERNS = { 0: "abcdef", 1: "bc", 2: "abdeg", 3: "abcdg", 4: "bcfg", 5: "acdfg", 6: "acdefg", 7: "abc", 8: "abcdefg", 9: "abcdfg" };
          const on = lampTest ? "abcdefg" : blanked ? "" : (PATTERNS[bcd] || "");
          Object.entries(logic.seg).forEach(([seg, pinNum]) => wr(pinNum, on.includes(seg) ? 0 : 1)); // active-low outputs
        }
        if (logic.msi === "counter") {
          const reg = icRegs[p.id] || { q: 0 };
          const load = rd(logic.load) === 0;
          const val = load
            ? logic.d.map(rd).reduce((acc, v, i) => acc | (v << i), 0)
            : rd(logic.clear) === 1 ? 0 : (reg.q ?? 0);
          logic.q.forEach((pinNum, i) => wr(pinNum, (val >> i) & 1));
          wr(logic.carry, val === 15 ? 0 : 1);
          wr(logic.borrow, val === 0 ? 0 : 1);
        }
        if (logic.msi === "shiftreg") {
          const reg = icRegs[p.id] || { q: [0, 0, 0, 0] };
          logic.q.forEach((pinNum, i) => wr(pinNum, reg.q ? reg.q[i] : 0));
        }
      }
    });
  }
  return { values, shorts };
}

// Applies clocked (edge-triggered) state updates: flip-flops, the
// up/down counter, and the shift register. Called from a useEffect that
// watches the settled combinational values every render.
export function advanceSequential(ns, placedICs, values, icRegs, prevClk) {
  const next = {};
  let changed = false;
  placedICs.forEach((p) => {
    const logic = IC_LOGIC[p.ic];
    if (!logic) return;
    const pin = (n) => `${p.id}_p${n}`;
    const rd = (n) => readNode(ns, values, pin(n));
    const prevKey = p.id;
    const prevReg = icRegs[p.id] || {};

    if (logic.flops) {
      const q = (prevReg.q || logic.flops.map(() => 0)).slice();
      logic.flops.forEach((f, i) => {
        const clkNow = rd(f.clk);
        const clkKey = `${prevKey}_clk${i}`;
        const clkWas = prevClk.get(clkKey) ?? 0;
        prevClk.set(clkKey, clkNow);
        if (rd(f.clr) === 0) { q[i] = 0; return; }
        if (rd(f.pr) === 0) { q[i] = 1; return; }
        if (clkWas === 0 && clkNow === 1) {
          q[i] = f.kind === "d" ? rd(f.d) : (() => {
            const j = rd(f.j), k = rd(f.k);
            if (j === 0 && k === 0) return q[i];
            if (j === 1 && k === 0) return 1;
            if (j === 0 && k === 1) return 0;
            return 1 - q[i];
          })();
        }
      });
      if (JSON.stringify(q) !== JSON.stringify(prevReg.q)) { next[p.id] = { q }; changed = true; }
    }
    if (logic.msi === "counter") {
      const clkKey = `${prevKey}_ctrclk`;
      const upNow = rd(logic.up), downNow = rd(logic.down);
      const upWas = prevClk.get(clkKey + "u") ?? 0;
      const downWas = prevClk.get(clkKey + "d") ?? 0;
      prevClk.set(clkKey + "u", upNow);
      prevClk.set(clkKey + "d", downNow);
      let q = prevReg.q ?? 0;
      if (rd(logic.clear) === 1) q = 0;
      else if (rd(logic.load) === 0) q = logic.d.map(rd).reduce((acc, v, i) => acc | (v << i), 0);
      else if (upWas === 0 && upNow === 1) q = (q + 1) & 15;
      else if (downWas === 0 && downNow === 1) q = (q - 1) & 15;
      if (q !== prevReg.q) { next[p.id] = { q }; changed = true; }
    }
    if (logic.msi === "shiftreg") {
      const clkKey = `${prevKey}_sr`;
      const c1Now = rd(logic.clk1);
      const c1Was = prevClk.get(clkKey) ?? 0;
      prevClk.set(clkKey, c1Now);
      let q = (prevReg.q || [0, 0, 0, 0]).slice();
      if (c1Was === 0 && c1Now === 1) {
        const parallel = rd(logic.mode) === 1;
        q = parallel ? logic.d.map(rd) : [rd(logic.serIn), q[0], q[1], q[2]];
      }
      if (JSON.stringify(q) !== JSON.stringify(prevReg.q)) { next[p.id] = { q }; changed = true; }
    }
  });
  return changed ? next : null;
}
