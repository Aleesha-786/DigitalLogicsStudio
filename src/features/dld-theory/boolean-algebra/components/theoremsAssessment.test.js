import { THEOREM_PARTS } from "./theoremsAssessment";

const part = (id) => THEOREM_PARTS.find((p) => p.id === id);

// Grade `input` against the problem written as `expression`.
const grade = (id, expression, input) => {
  const { problems, grade: gradePart } = part(id);
  const problem = problems.find((p) => p.expression === expression);
  return gradePart(problem, input).status;
};

// One hand-written answer per problem, in the order the problems are listed.
const ANSWERS = {
  consensus: ["AB + A'C", "A'B + AC", "AB' + BC", "A'C + BC'", "AB + A'C"],
  dual: [
    "A(B + C)",
    "(A + B)(A' + C)",
    "A.1 + B'C",
    "(AB)'C",
    "(A' + B)(C + AD')",
  ],
  complement: [
    "(A' + B')C'",
    "A'B + C'",
    "(A + B')(A' + B)",
    "A' + B'(C + D')",
    "A'B' + CD'",
  ],
};

test.each(Object.keys(ANSWERS))("%s: every problem accepts its answer", (id) => {
  const { problems, grade: gradePart } = part(id);
  expect(problems).toHaveLength(ANSWERS[id].length);
  problems.forEach((problem, i) => {
    expect([problem.expression, gradePart(problem, ANSWERS[id][i]).status]).toEqual(
      [problem.expression, "solved"],
    );
  });
});

test.each(Object.keys(ANSWERS))(
  "%s: retyping the given expression never solves it",
  (id) => {
    const { problems, grade: gradePart } = part(id);
    problems.forEach((problem) => {
      expect(gradePart(problem, problem.expression).status).not.toBe("solved");
    });
  },
);

describe("consensus", () => {
  test("keeps an equivalent step and discards a wrong removal", () => {
    expect(grade("consensus", "AB + A'C + BC", "BC + A'C + AB")).toBe("valid");
    // Dropping a term that is not the consensus changes the function.
    expect(grade("consensus", "AB + A'C + BC", "AB + BC")).toBe("discarded");
  });
});

describe("dual", () => {
  test("accepts the dual in any operand order", () => {
    expect(grade("dual", "A + BC", "(C + B)A")).toBe("solved");
  });

  test("does not accept a simplified or rearranged dual as the answer", () => {
    expect(grade("dual", "A + BC", "AB + AC")).toBe("valid");
    expect(grade("dual", "(A + 0)(B' + C)", "A + B'C")).toBe("valid");
  });

  test("discards the unchanged expression and a swap that loses the grouping", () => {
    expect(grade("dual", "A + BC", "A + BC")).toBe("discarded");
    expect(grade("dual", "A + BC", "AB + C")).toBe("discarded");
  });

  test("leaves complements alone", () => {
    // Complementing the variables as well gives F', not the dual.
    expect(grade("dual", "AB + A'C", "(A' + B')(A + C')")).toBe("discarded");
  });
});

describe("complement", () => {
  test("keeps a complement that De Morgan's has not been applied to yet", () => {
    expect(grade("complement", "AB + C", "(AB + C)'")).toBe("valid");
    expect(grade("complement", "AB + C", "(AB)'C'")).toBe("valid");
  });

  test("accepts any equivalent form with complements only on variables", () => {
    expect(grade("complement", "A'B + AB'", "AB + A'B'")).toBe("solved");
  });

  test("discards the dual, which is not the complement", () => {
    expect(grade("complement", "AB + C", "(A + B)C")).toBe("discarded");
  });
});

test("unreadable input is reported, not graded", () => {
  THEOREM_PARTS.forEach(({ problems, grade: gradePart }) => {
    expect(gradePart(problems[0], "A + (B").status).toBe("invalid");
  });
});
