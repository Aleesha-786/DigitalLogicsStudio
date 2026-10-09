import {
  evaluateExpression,
  extractVariables,
  parseSOP,
  stripLabel,
} from "./boolMath";

const truthTable = (expression, variables) =>
  Array.from({ length: 2 ** variables.length }, (_, i) => {
    const assign = {};
    variables.forEach((v, b) => {
      assign[v] = Boolean((i >> (variables.length - 1 - b)) & 1);
    });
    return evaluateExpression(expression, assign);
  });

describe("evaluateExpression", () => {
  test.each([
    ["F = AB' + C", ["A", "B", "C"], (A, B, C) => (A && !B) || C],
    ["F = (A + C)(B + C)", ["A", "B", "C"], (A, B, C) => (A || C) && (B || C)],
    ["A • B", ["A", "B"], (A, B) => A && B],
    ["F = A ⊕ B", ["A", "B"], (A, B) => A !== B],
    ["A ^ B", ["A", "B"], (A, B) => A !== B],
    ["A XOR B", ["A", "B"], (A, B) => A !== B],
    ["F = A ⊙ B", ["A", "B"], (A, B) => A === B],
    ["F = A + 1", ["A"], () => true],
    ["F = A • 0 + B", ["A", "B"], (A, B) => B],
    ["!AB", ["A", "B"], (A, B) => !A && B],
    ["(A+B)'", ["A", "B"], (A, B) => !(A || B)],
    ["A ⊕ B C", ["A", "B", "C"], (A, B, C) => A !== (B && C)],
    ["a b + c", ["A", "B", "C"], (A, B, C) => (A && B) || C],
  ])("%s", (expression, variables, reference) => {
    const expected = Array.from({ length: 2 ** variables.length }, (_, i) =>
      reference(
        ...variables.map((_, b) =>
          Boolean((i >> (variables.length - 1 - b)) & 1),
        ),
      )
        ? 1
        : 0,
    );
    expect(truthTable(expression, variables)).toEqual(expected);
  });

  test("the F = label is never treated as an input", () => {
    expect(evaluateExpression("F = A", { A: true })).toBe(1);
  });

  test("malformed input evaluates to 0 instead of throwing", () => {
    expect(evaluateExpression("A + ", { A: true })).toBe(0);
    expect(evaluateExpression("(A", { A: true })).toBe(0);
  });
});

describe("helpers", () => {
  test("stripLabel removes only a leading label", () => {
    expect(stripLabel("F = AB' + C")).toBe("AB' + C");
    expect(stripLabel("AB' + C")).toBe("AB' + C");
  });

  test("extractVariables ignores the label and operator words", () => {
    expect(extractVariables("F = AB' + C + D")).toEqual(["A", "B", "C", "D"]);
    expect(extractVariables("F = A XOR B")).toEqual(["A", "B"]);
  });

  test("parseSOP skips AND symbols and constants", () => {
    expect(parseSOP("F = A • B' + C")).toEqual([
      [
        { v: "A", n: false },
        { v: "B", n: true },
      ],
      [{ v: "C", n: false }],
    ]);
  });
});
