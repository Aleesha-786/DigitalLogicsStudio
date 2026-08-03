// Utility to parse Boolean expression and generate circuit
// Supports: SOP (AND/OR), XOR chains (⊕ or XOR keyword), and mixed expressions
export const parseExpressionToCircuit = (expression, variables) => {
  if (!expression || expression === "F = 0" || expression === "F = 1") {
    return { gates: [], wires: [] };
  }

  // ── Normalize the expression ─────────────────────────────────────────────
  // Remove common prefixes like "S = ", "F = ", "D = ", etc.
  let expr = expression.replace(/^[A-Za-z]\s*=\s*/, "").trim();

  // Normalize XOR: replace "XOR" keyword (case-insensitive) and ⊕ with §
  // We use § as a safe internal XOR separator token
  expr = expr.replace(/\s+XOR\s+/gi, "§");
  expr = expr.replace(/⊕/g, "§");

  // Normalize explicit AND operators and remove remaining spaces
  expr = expr.replace(/[•.*]/g, "•").replace(/\s+/g, "");

  // ── Detect if this is a pure XOR chain at the top level ─────────────────
  const isTopLevelXOR = expr.includes("§") && !expr.includes("+");

  // ── Scan which variables appear complemented ──────────────────────────────
  const complementedVars = new Set();
  for (let i = 0; i < expr.length; i++) {
    if (/[A-Za-z]/.test(expr[i]) && expr[i + 1] === "'") {
      complementedVars.add(expr[i]);
    }
  }

  // ── Helper: split at top-level by a separator ─────────────────────────────
  const splitTopLevel = (str, sep) => {
    const parts = [];
    let depth = 0;
    let last = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === "(") depth++;
      else if (ch === ")") depth = Math.max(0, depth - 1);
      else if (ch === sep && depth === 0) {
        parts.push(str.slice(last, i));
        last = i + 1;
      }
    }
    parts.push(str.slice(last));
    return parts.filter((p) => p.length > 0);
  };

  const gates = [];
  const wires = [];
  let gateId = 0;
  let wireId = 0;

  // Layout constants
  const inputSpacing = 120;
  const inputStartY = 80;
  const termStartY = 80;
  const termSpacing = 160;

  // ── Create INPUT gates for each variable ──────────────────────────────────
  const inputGates = {};
  variables.forEach((variable, index) => {
    const g = {
      id: gateId++,
      type: "INPUT",
      label: variable,
      x: 50,
      y: inputStartY + index * inputSpacing,
      inputs: 0,
      hasOutput: true,
      inputValues: [false],
    };
    gates.push(g);
    inputGates[variable] = g.id;
  });

  // ── Create NOT gates ONLY for variables that appear complemented ──────────
  const notGates = {};
  variables.forEach((variable, index) => {
    if (!complementedVars.has(variable)) return;
    const g = {
      id: gateId++,
      type: "NOT",
      label: `${variable}'`,
      x: 240,
      y: inputStartY + index * inputSpacing,
      inputs: 1,
      hasOutput: true,
      inputValues: [],
    };
    gates.push(g);
    notGates[variable] = g.id;
    wires.push({
      id: wireId++,
      fromId: inputGates[variable],
      toId: g.id,
      toIndex: 0,
    });
  });

  // ── X offsets ─────────────────────────────────────────────────────────────
  const hasNotGates = complementedVars.size > 0;
  const andX = hasNotGates ? 430 : 270;
  const orX = hasNotGates ? 620 : 460;
  const xorBaseX = hasNotGates ? 300 : 230;

  // ── Helper: resolve a literal token to a gate id ──────────────────────────
  const resolveToken = (token, fallbackY) => {
    if (token === "1" || token === "0") {
      const g = {
        id: gateId++,
        type: "INPUT",
        label: token,
        x: andX,
        y: fallbackY,
        inputs: 0,
        hasOutput: true,
        inputValues: [token === "1"],
      };
      gates.push(g);
      return g.id;
    }
    const variable = token.replace("'", "");
    const isInverted = token.endsWith("'");
    return isInverted ? notGates[variable] : inputGates[variable];
  };

  // ══════════════════════════════════════════════════════════════════════════
  // XOR CHAIN BUILDER
  // Builds a left-associative chain of 2-input XOR gates for N operands:
  //   A XOR B XOR C  →  XOR(XOR(A, B), C)
  // ══════════════════════════════════════════════════════════════════════════
  const buildXorChain = (operands, centerY) => {
    if (operands.length === 0) return null;
    if (operands.length === 1) return resolveToken(operands[0].trim(), centerY);

    // Resolve all operand gate IDs first
    const operandIds = operands.map((op, i) => {
      const opTrimmed = op.trim();
      // Check if it's a parenthesised sub-expression
      if (opTrimmed.startsWith("(") && opTrimmed.endsWith(")")) {
        const inner = opTrimmed.slice(1, -1);
        return buildXorSubExpr(inner, centerY + i * 60);
      }
      return resolveToken(opTrimmed, centerY + i * 60);
    });

    // Chain XOR gates left to right
    let prevId = operandIds[0];
    for (let i = 1; i < operandIds.length; i++) {
      const xorY = centerY + (i - 1) * 60;
      const xorX = xorBaseX + (i - 1) * 200;
      const xorGate = {
        id: gateId++,
        type: "XOR",
        label: `XOR${i - 1}`,
        x: xorX,
        y: xorY,
        inputs: 2,
        hasOutput: true,
        inputValues: [],
      };
      gates.push(xorGate);
      wires.push({
        id: wireId++,
        fromId: prevId,
        toId: xorGate.id,
        toIndex: 0,
      });
      wires.push({
        id: wireId++,
        fromId: operandIds[i],
        toId: xorGate.id,
        toIndex: 1,
      });
      prevId = xorGate.id;
    }
    return prevId;
  };

  // Build XOR sub-expression (handles OR/AND inside parens in XOR operands)
  const buildXorSubExpr = (inner, termY) => {
    // If inner itself has XOR
    if (inner.includes("§")) {
      const parts = splitTopLevel(inner, "§");
      return buildXorChain(parts, termY);
    }
    // Otherwise treat as SOP term
    const innerTerms = splitTopLevel(inner, "+");
    const ids = innerTerms
      .map((t) => parseProduct(t, 0))
      .filter((id) => id !== null && id !== undefined);
    if (ids.length === 0) return null;
    if (ids.length === 1) return ids[0];

    const orGate = {
      id: gateId++,
      type: "OR",
      label: `ORsub`,
      x: andX + 80,
      y: termY,
      inputs: ids.length,
      hasOutput: true,
      inputValues: [],
    };
    gates.push(orGate);
    ids.forEach((srcId, idx) => {
      wires.push({
        id: wireId++,
        fromId: srcId,
        toId: orGate.id,
        toIndex: idx,
      });
    });
    return orGate.id;
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SOP PARSER (unchanged logic, kept intact)
  // ══════════════════════════════════════════════════════════════════════════

  const parseProduct = (term, termIndex) => {
    const termY = termStartY + termIndex * termSpacing;
    const factors = [];

    for (let i = 0; i < term.length; i++) {
      const ch = term[i];
      if (ch === "(") {
        let j = i + 1,
          depth = 1;
        while (j < term.length && depth > 0) {
          if (term[j] === "(") depth++;
          else if (term[j] === ")") depth--;
          j++;
        }
        const inner = term.slice(i + 1, j - 1);
        const hasNot = j < term.length && term[j] === "'";
        let subId = buildSubExpression(inner, termIndex);
        if (hasNot) {
          const ng = {
            id: gateId++,
            type: "NOT",
            label: `(${inner})'`,
            x: andX - 80,
            y: termY,
            inputs: 1,
            hasOutput: true,
            inputValues: [],
          };
          gates.push(ng);
          wires.push({ id: wireId++, fromId: subId, toId: ng.id, toIndex: 0 });
          subId = ng.id;
          i = j;
        } else {
          i = j - 1;
        }
        factors.push({ type: "gate", id: subId });
      } else if (ch === "•") {
        // explicit AND separator — skip
      } else {
        let token = ch;
        if (i + 1 < term.length && term[i + 1] === "'") {
          token += "'";
          i++;
        }
        factors.push({ type: "literal", token });
      }
    }

    if (factors.length === 0) return null;

    if (factors.length === 1) {
      const f = factors[0];
      if (f.type === "gate") return f.id;
      return resolveToken(f.token, termY);
    }

    const andGate = {
      id: gateId++,
      type: "AND",
      label: `AND${termIndex}`,
      x: andX,
      y: termY,
      inputs: factors.length,
      hasOutput: true,
      inputValues: [],
    };
    gates.push(andGate);

    factors.forEach((f, idx) => {
      const srcId = f.type === "gate" ? f.id : resolveToken(f.token, termY);
      wires.push({
        id: wireId++,
        fromId: srcId,
        toId: andGate.id,
        toIndex: idx,
      });
    });

    return andGate.id;
  };

  const buildSubExpression = (inner, termIndex) => {
    const termY = termStartY + termIndex * termSpacing;
    const innerTerms = splitTopLevel(inner, "+");
    const ids = innerTerms
      .map((t) => parseProduct(t, termIndex))
      .filter(Boolean);
    if (ids.length === 0) return null;
    if (ids.length === 1) return ids[0];

    const orGate = {
      id: gateId++,
      type: "OR",
      label: `OR${termIndex}_sub`,
      x: andX + 120,
      y: termY,
      inputs: ids.length,
      hasOutput: true,
      inputValues: [],
    };
    gates.push(orGate);
    ids.forEach((srcId, idx) => {
      wires.push({
        id: wireId++,
        fromId: srcId,
        toId: orGate.id,
        toIndex: idx,
      });
    });
    return orGate.id;
  };

  // ══════════════════════════════════════════════════════════════════════════
  // TOP-LEVEL ROUTING: XOR chain vs SOP
  // ══════════════════════════════════════════════════════════════════════════
  let outputSourceId;
  const numVars = variables.length;
  const centerY = inputStartY + ((numVars - 1) * inputSpacing) / 2;

  if (isTopLevelXOR) {
    // Pure XOR chain: A§B§C…
    const xorOperands = splitTopLevel(expr, "§");
    outputSourceId = buildXorChain(xorOperands, centerY);

    // Output gate — positioned after the last XOR gate
    const lastXorCount = xorOperands.length - 1;
    const outX = xorBaseX + (lastXorCount - 1) * 200 + 250;
    const outY = centerY + (lastXorCount - 1) * 60;

    const outputGate = {
      id: gateId++,
      type: "OUTPUT",
      label: "Z",
      x: outX,
      y: outY,
      inputs: 1,
      hasOutput: false,
      inputValues: [],
    };
    gates.push(outputGate);
    wires.push({
      id: wireId++,
      fromId: outputSourceId,
      toId: outputGate.id,
      toIndex: 0,
    });
  } else if (expr.includes("§")) {
    // Mixed: XOR at top level mixed with SOP terms
    // Split on § first to get XOR operands, each of which may be an SOP expression
    const xorOperands = splitTopLevel(expr, "§");
    const resolvedIds = xorOperands
      .map((op, i) => {
        const opTrimmed = op.trim();
        if (opTrimmed.includes("+")) {
          // SOP sub-expression — parse as OR of products
          return buildXorSubExpr(opTrimmed, centerY + i * 80);
        }
        if (opTrimmed.startsWith("(") && opTrimmed.endsWith(")")) {
          return buildXorSubExpr(opTrimmed.slice(1, -1), centerY + i * 80);
        }
        return resolveToken(opTrimmed.trim(), centerY + i * 80);
      })
      .filter((id) => id !== null && id !== undefined);

    // Chain XOR gates
    let prevId = resolvedIds[0];
    for (let i = 1; i < resolvedIds.length; i++) {
      const xorGate = {
        id: gateId++,
        type: "XOR",
        label: `XOR${i - 1}`,
        x: xorBaseX + (i - 1) * 220,
        y: centerY + (i - 1) * 60,
        inputs: 2,
        hasOutput: true,
        inputValues: [],
      };
      gates.push(xorGate);
      wires.push({
        id: wireId++,
        fromId: prevId,
        toId: xorGate.id,
        toIndex: 0,
      });
      wires.push({
        id: wireId++,
        fromId: resolvedIds[i],
        toId: xorGate.id,
        toIndex: 1,
      });
      prevId = xorGate.id;
    }
    outputSourceId = prevId;

    const lastXorCount = resolvedIds.length - 1;
    const outX = xorBaseX + (lastXorCount - 1) * 220 + 260;
    const outputGate = {
      id: gateId++,
      type: "OUTPUT",
      label: "Z",
      x: outX,
      y: centerY + (lastXorCount - 1) * 60,
      inputs: 1,
      hasOutput: false,
      inputValues: [],
    };
    gates.push(outputGate);
    wires.push({
      id: wireId++,
      fromId: outputSourceId,
      toId: outputGate.id,
      toIndex: 0,
    });
  } else {
    // Pure SOP expression
    const terms = splitTopLevel(expr, "+");
    const termGateIds = [];

    terms.forEach((term, termIndex) => {
      if (term === "1") {
        const g = {
          id: gateId++,
          type: "INPUT",
          label: "1",
          x: andX,
          y: termStartY + termIndex * termSpacing,
          inputs: 0,
          hasOutput: true,
          inputValues: [true],
        };
        gates.push(g);
        termGateIds.push(g.id);
        return;
      }
      if (term === "0") {
        const g = {
          id: gateId++,
          type: "INPUT",
          label: "0",
          x: andX,
          y: termStartY + termIndex * termSpacing,
          inputs: 0,
          hasOutput: true,
          inputValues: [false],
        };
        gates.push(g);
        termGateIds.push(g.id);
        return;
      }
      const id = parseProduct(term, termIndex);
      if (id !== null && id !== undefined) termGateIds.push(id);
    });

    if (termGateIds.length === 0) return { gates, wires };

    if (termGateIds.length === 1) {
      outputSourceId = termGateIds[0];
    } else {
      const finalCenterY =
        termStartY + ((termGateIds.length - 1) * termSpacing) / 2;
      const finalOrGate = {
        id: gateId++,
        type: "OR",
        label: "OR",
        x: orX,
        y: finalCenterY,
        inputs: termGateIds.length,
        hasOutput: true,
        inputValues: [],
      };
      gates.push(finalOrGate);
      termGateIds.forEach((srcId, idx) => {
        wires.push({
          id: wireId++,
          fromId: srcId,
          toId: finalOrGate.id,
          toIndex: idx,
        });
      });
      outputSourceId = finalOrGate.id;
    }

    const finalCenterY =
      termStartY + ((termGateIds.length - 1) * termSpacing) / 2;
    const outputGate = {
      id: gateId++,
      type: "OUTPUT",
      label: "Z",
      x: orX + 200,
      y: finalCenterY,
      inputs: 1,
      hasOutput: false,
      inputValues: [],
    };
    gates.push(outputGate);
    wires.push({
      id: wireId++,
      fromId: outputSourceId,
      toId: outputGate.id,
      toIndex: 0,
    });
  }

  return {
    gates,
    wires,
    gateIdCounter: gateId,
    wireIdCounter: wireId,
    inputCounter: variables.length,
    outputCounter: 1,
  };
};
