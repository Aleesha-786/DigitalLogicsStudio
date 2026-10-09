import {
  MINTERM_ROUNDS,
  compileProblem,
  gradeSelection,
  gradeTable,
  productOfMaxtermsTex,
  sumOfMintermsTex,
} from "./mintermsAssessment";
import { evaluateExpression } from "../../../../shared/utils/boolMath";

describe("compileProblem", () => {
  test("AB' + C has minterms 1, 3, 4, 5, 7 and maxterms 0, 2, 6", () => {
    const problem = compileProblem("AB' + C");
    expect(problem.variables).toEqual(["A", "B", "C"]);
    expect(problem.minterms).toEqual([1, 3, 4, 5, 7]);
    expect(problem.maxterms).toEqual([0, 2, 6]);
  });

  test("minterms and maxterms partition every row", () => {
    MINTERM_ROUNDS.forEach((round) =>
      round.problems.forEach((problem) => {
        const all = [...problem.minterms, ...problem.maxterms].sort(
          (a, b) => a - b,
        );
        expect(all).toEqual(problem.rows.map((r) => r.index));
      }),
    );
  });

  test("every pool expression matches the independent evaluator", () => {
    MINTERM_ROUNDS.forEach((round) =>
      round.problems.forEach((problem) => {
        problem.rows.forEach((row) => {
          const assign = Object.fromEntries(
            problem.variables.map((name, b) => [name, row.bits[b] === 1]),
          );
          expect(row.value).toBe(
            evaluateExpression(problem.expression, assign),
          );
        });
      }),
    );
  });

  test("rounds get harder: 3, 3 then 4 variables", () => {
    expect(MINTERM_ROUNDS.map((r) => r.problems[0].variables.length)).toEqual([
      3, 3, 4,
    ]);
  });
});

describe("gradeTable", () => {
  const problem = compileProblem("AB' + C");

  test("a fully correct table passes", () => {
    const answers = Object.fromEntries(problem.rows.map((r) => [r.index, r.value]));
    expect(gradeTable(problem, answers).allCorrect).toBe(true);
  });

  test("flags wrong and unanswered rows separately", () => {
    const result = gradeTable(problem, { 0: 1, 1: 1 });
    expect(result.rows[0]).toBe("wrong");
    expect(result.rows[1]).toBe("correct");
    expect(result.rows[2]).toBe("empty");
    expect(result.wrong).toBe(1);
    expect(result.empty).toBe(6);
    expect(result.allCorrect).toBe(false);
  });
});

describe("gradeSelection", () => {
  test("exact match is correct", () => {
    expect(gradeSelection([1, 3], [3, 1]).correct).toBe(true);
  });

  test("reports missing and extra rows", () => {
    expect(gradeSelection([1, 3, 5], [1, 2])).toEqual({
      correct: false,
      missing: [3, 5],
      extra: [2],
    });
  });
});

describe("canonical forms", () => {
  const problem = compileProblem("AB' + C");

  test("sum of minterms", () => {
    expect(sumOfMintermsTex(problem, [1, 4])).toBe("A'B'C + AB'C'");
  });

  test("product of maxterms", () => {
    expect(productOfMaxtermsTex(problem, [0, 6])).toBe(
      "(A + B + C)(A' + B' + C)",
    );
  });

  test("the canonical forms are equivalent to the original function", () => {
    const sop = sumOfMintermsTex(problem, problem.minterms);
    const pos = productOfMaxtermsTex(problem, problem.maxterms);
    problem.rows.forEach((row) => {
      const assign = Object.fromEntries(
        problem.variables.map((name, b) => [name, row.bits[b] === 1]),
      );
      expect(evaluateExpression(sop, assign)).toBe(row.value);
      expect(evaluateExpression(pos, assign)).toBe(row.value);
    });
  });

  test("constant functions", () => {
    const always = compileProblem("A + A'");
    expect(sumOfMintermsTex(always, [])).toBe("0");
    expect(productOfMaxtermsTex(always, [])).toBe("1");
  });
});
