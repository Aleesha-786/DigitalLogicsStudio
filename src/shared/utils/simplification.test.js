import { compileSimplification, gradeStep } from "./simplification";

const problem = compileSimplification({
  expression: "AB + A(B + C) + B(B + C)",
  answers: ["B + AC"],
});

describe("compileSimplification", () => {
  test("prepares the given expression and its answer for display and grading", () => {
    expect(problem.variables).toEqual(["A", "B", "C"]);
    expect(problem.givenTex).toBe("AB + A(B + C) + B(B + C)");
    expect(problem.answerTex).toBe("B + AC");
  });

  test("fails loudly on an expression that cannot be read", () => {
    expect(() =>
      compileSimplification({ expression: "A + (B", answers: ["A"] }),
    ).toThrow('Invalid Boolean expression "A + (B"');
  });
});

describe("gradeStep", () => {
  test("accepts each equivalent step along the way", () => {
    ["AB + AB + AC + BB + BC", "AB + AC + B + BC", "AB + AC + B"].forEach(
      (step) => expect(gradeStep(problem, step).status).toBe("valid"),
    );
  });

  test("completes on the simplest form however it is ordered", () => {
    ["B + AC", "AC + B", "f = ca+b", "(B) + A.C"].forEach((answer) =>
      expect(gradeStep(problem, answer).status).toBe("solved"),
    );
  });

  test("does not complete on an equivalent form that is not the simplest", () => {
    ["B + AC + AB", "(B + A)(B + C)", "(B'(AC)')'"].forEach((step) =>
      expect(gradeStep(problem, step).status).toBe("valid"),
    );
  });

  test("accepts every listed way of writing the simplest form", () => {
    const consensus = compileSimplification({
      expression: "AB + A'C + BC",
      answers: ["AB + A'C", "(A + C)(A' + B)"],
    });
    expect(gradeStep(consensus, "A'C + BA").status).toBe("solved");
    expect(gradeStep(consensus, "(B + A')(C + A)").status).toBe("solved");
    expect(gradeStep(consensus, "AB + A'C + BC").status).toBe("valid");
  });

  test("discards a step with a different truth table and says where it differs", () => {
    const outcome = gradeStep(problem, "B + C");
    expect(outcome.status).toBe("discarded");
    expect(outcome.tex).toBe("B + C");
    expect(outcome.counterexample).toEqual({
      assignment: { A: 0, B: 0, C: 1 },
      expected: 0,
      actual: 1,
    });
  });

  test("reports unreadable input as invalid rather than wrong", () => {
    expect(gradeStep(problem, "B + (AC")).toEqual({
      status: "invalid",
      message: "A closing parenthesis is missing.",
    });
  });
});
