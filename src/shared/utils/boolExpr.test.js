import {
  canonicalForm,
  compareExpressions,
  parseExpression,
  toTex,
} from "./boolExpr";

const ast = (text) => {
  const parsed = parseExpression(text);
  if (!parsed.ok) throw new Error(`${text}: ${parsed.error}`);
  return parsed.ast;
};

const equivalent = (a, b) => compareExpressions(ast(a), ast(b)).equivalent;

describe("parseExpression", () => {
  test("reads implied AND, postfix NOT and parentheses with the usual precedence", () => {
    expect(toTex(ast("a'b + c(a+b)'"))).toBe("A'B + C(A + B)'");
    expect(equivalent("A + BC", "A + (B.C)")).toBe(true);
    expect(equivalent("A + BC", "(A + B)C")).toBe(false);
    expect(equivalent("AB'", "A(B')")).toBe(true);
  });

  test("accepts the alternative operator spellings", () => {
    expect(equivalent("!A & B | C", "A'B + C")).toBe(true);
    expect(equivalent("~(A*B)", "(A·B)’")).toBe(true);
    expect(equivalent("A • B", "AB")).toBe(true);
    expect(equivalent("F = A + 0", "A.1")).toBe(true);
  });

  test("lists the variables used", () => {
    expect(parseExpression("c + ab'").variables).toEqual(["A", "B", "C"]);
  });

  test.each([
    ["", "Type an expression first."],
    ["   ", "Type an expression first."],
    ["A ^ B", '"^" isn\'t supported'],
    ["A +", 'missing after "+"'],
    ["+ A", 'can\'t start with "+"'],
    ["A + + B", 'missing between "+" and "+"'],
    ["(A + B", "closing parenthesis is missing"],
    ["A + B)", "no opening one"],
    ["()", "Empty parentheses"],
    ["'A", "needs something before it"],
    ["A!", 'missing after "!"'],
    ["ABCDEFGHI", "at most 8"],
  ])("rejects %p", (input, message) => {
    const parsed = parseExpression(input);
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toContain(message);
  });
});

describe("compareExpressions", () => {
  test("recognises the laws as equivalences", () => {
    expect(equivalent("A + AB", "A")).toBe(true);
    expect(equivalent("(AB)'", "A' + B'")).toBe(true);
    expect(equivalent("(A + B)'", "A'B'")).toBe(true);
    expect(equivalent("A(B + C)", "AB + AC")).toBe(true);
    expect(equivalent("A + A'", "1")).toBe(true);
  });

  test("compares over the variables of both sides", () => {
    expect(equivalent("A", "A + BB'")).toBe(true);
    expect(equivalent("A", "A + B")).toBe(false);
  });

  test("reports the first row where the two differ", () => {
    const result = compareExpressions(ast("A + B"), ast("AB"));
    expect(result).toEqual({
      equivalent: false,
      counterexample: { assignment: { A: 0, B: 1 }, expected: 1, actual: 0 },
    });
  });
});

describe("canonicalForm", () => {
  const same = (a, b) => canonicalForm(ast(a)) === canonicalForm(ast(b));

  test("ignores the order and grouping of AND / OR operands", () => {
    expect(same("B + AC", "CA + B")).toBe(true);
    expect(same("A + B + C", "C + (B + A)")).toBe(true);
    expect(same("(A)(B)", "BA")).toBe(true);
  });

  test("still tells equivalent but differently written forms apart", () => {
    expect(same("A + B", "(A'B')'")).toBe(false);
    expect(same("A", "A + A")).toBe(false);
    expect(same("A", "A''")).toBe(false);
    expect(same("A(B + C)", "AB + AC")).toBe(false);
  });
});

describe("toTex", () => {
  test("keeps grouping and spells out AND next to a constant", () => {
    expect(toTex(ast("(A+B)(A+C)"))).toBe("(A + B)(A + C)");
    expect(toTex(ast("A + (B + C)"))).toBe("A + (B + C)");
    expect(toTex(ast("A1 + (AB)'"))).toBe("A \\cdot 1 + (AB)'");
    expect(toTex(ast("A''"))).toBe("A''");
  });
});
