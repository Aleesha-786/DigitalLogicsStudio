import { parseExpressionToCircuit } from "./expressionParser";
import { evaluateExpression, extractVariables } from "./boolMath";

// Simulate the generated circuit so the test checks behaviour, not layout.
const simulate = (circuit, assign) => {
  const gates = Object.fromEntries(circuit.gates.map((g) => [g.id, g]));
  const inputsOf = {};
  circuit.wires.forEach((w) => {
    (inputsOf[w.toId] ||= [])[w.toIndex] = w.fromId;
  });
  const value = (id) => {
    const gate = gates[id];
    const ins = (inputsOf[id] || []).map(value);
    switch (gate.type) {
      case "INPUT":
        if (gate.label === "1") return true;
        if (gate.label === "0") return false;
        return Boolean(assign[gate.label]);
      case "NOT":
        return !ins[0];
      case "AND":
        return ins.length > 0 && ins.every(Boolean);
      case "OR":
        return ins.some(Boolean);
      case "XOR":
        return ins.reduce((a, b) => a !== b);
      case "XNOR":
        return !ins.reduce((a, b) => a !== b);
      case "OUTPUT":
        return ins[0];
      default:
        throw new Error(`Unknown gate ${gate.type}`);
    }
  };
  return value(circuit.gates.find((g) => g.type === "OUTPUT").id);
};

describe("parseExpressionToCircuit", () => {
  test.each([
    "AB' + C",
    "AB' + C + D",
    "(A + B)'",
    "A • (A + B)",
    "A + (B • C)",
    "(A + B + C)(A + B' + C)(A' + B' + C)",
    "A ⊕ B",
    "A ⊙ B",
    "A ^ B ^ C",
    "(A + B)(C + D)",
    "A(B + C(D + E))",
    "A + B'C + D'E",
  ])("circuit for %s matches the expression", (expression) => {
    const variables = extractVariables(expression);
    const circuit = parseExpressionToCircuit(expression, variables);
    for (let i = 0; i < 2 ** variables.length; i += 1) {
      const assign = {};
      variables.forEach((v, b) => {
        assign[v] = Boolean((i >> (variables.length - 1 - b)) & 1);
      });
      expect(simulate(circuit, assign)).toBe(
        Boolean(evaluateExpression(expression, assign)),
      );
    }
  });

  test("a group containing the first input keeps that input (gate id 0)", () => {
    const circuit = parseExpressionToCircuit("(A + B)'", ["A", "B"]);
    expect(circuit.gates.map((g) => g.type)).toEqual([
      "INPUT",
      "INPUT",
      "OR",
      "NOT",
      "OUTPUT",
    ]);
  });
});
