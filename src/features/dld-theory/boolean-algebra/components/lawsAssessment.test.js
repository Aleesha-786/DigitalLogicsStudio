import { LAWS_ASSESSMENT_PROBLEMS, gradeStep } from "./lawsAssessment";

const [first] = LAWS_ASSESSMENT_PROBLEMS;

test("every problem's listed answers are accepted as its simplest form", () => {
  LAWS_ASSESSMENT_PROBLEMS.forEach((problem) => {
    problem.answers.forEach((answer) => {
      expect([problem.expression, gradeStep(problem, answer).status]).toEqual([
        problem.expression,
        "solved",
      ]);
    });
  });
});

test("retyping the given expression is a valid step, not a solution", () => {
  LAWS_ASSESSMENT_PROBLEMS.forEach((problem) => {
    expect(gradeStep(problem, problem.expression).status).toBe("valid");
  });
});

describe("gradeStep on AB + A(B + C) + B(B + C)", () => {
  test("accepts each equivalent step along the way", () => {
    ["AB + AB + AC + BB + BC", "AB + AC + B + BC", "AB + AC + B"].forEach(
      (step) => expect(gradeStep(first, step).status).toBe("valid"),
    );
  });

  test("completes on the simplest form however it is ordered", () => {
    ["B + AC", "AC + B", "f = ca+b", "(B) + A.C"].forEach((answer) =>
      expect(gradeStep(first, answer).status).toBe("solved"),
    );
  });

  test("does not complete on an equivalent form that is not the simplest", () => {
    ["B + AC + AB", "(B + A)(B + C)", "(B'(AC)')'"].forEach((step) =>
      expect(gradeStep(first, step).status).toBe("valid"),
    );
  });

  test("discards a step with a different truth table and says where it differs", () => {
    const outcome = gradeStep(first, "B + C");
    expect(outcome.status).toBe("discarded");
    expect(outcome.tex).toBe("B + C");
    expect(outcome.counterexample).toEqual({
      assignment: { A: 0, B: 0, C: 1 },
      expected: 0,
      actual: 1,
    });
  });

  test("reports unreadable input as invalid rather than wrong", () => {
    expect(gradeStep(first, "B + (AC")).toEqual({
      status: "invalid",
      message: "A closing parenthesis is missing.",
    });
  });
});
