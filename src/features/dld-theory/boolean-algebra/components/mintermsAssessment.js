import { evaluate, parseExpression } from "../../../../shared/utils/boolExpr";

// Each round is a pool of expressions of similar difficulty; "Try a different
// expression" cycles through the pool. Passing every round completes the page.
const ROUND_POOLS = [
  {
    id: "round-1",
    title: "Warm-up",
    expressions: ["AB' + C", "A'B + AC", "(A + B)C'"],
  },
  {
    id: "round-2",
    title: "Three variables",
    expressions: ["A'B'C + AB", "(A + B')(B + C)", "AB + A'C + BC'"],
  },
  {
    id: "round-3",
    title: "Four variables",
    expressions: ["AB + CD", "A'B + CD'", "(A + B)(C + D')"],
  },
];

const bitsOf = (index, width) =>
  Array.from({ length: width }, (_, b) => (index >> (width - 1 - b)) & 1);

/** Parse an expression and work out its full truth table once. */
export const compileProblem = (expression) => {
  const parsed = parseExpression(expression);
  if (!parsed.ok) {
    throw new Error(`Invalid expression "${expression}": ${parsed.error}`);
  }
  const { ast, variables } = parsed;
  const rows = Array.from({ length: 2 ** variables.length }, (_, index) => {
    const bits = bitsOf(index, variables.length);
    const assignment = Object.fromEntries(
      variables.map((name, b) => [name, bits[b]]),
    );
    return { index, bits, value: evaluate(ast, assignment) };
  });
  return {
    expression,
    ast,
    variables,
    rows,
    minterms: rows.filter((r) => r.value === 1).map((r) => r.index),
    maxterms: rows.filter((r) => r.value === 0).map((r) => r.index),
  };
};

export const MINTERM_ROUNDS = ROUND_POOLS.map((round) => ({
  ...round,
  problems: round.expressions.map(compileProblem),
}));

/**
 * Grade the F column. `answers[i]` is 0, 1 or undefined (not answered yet).
 * Each row is "correct", "wrong" or "empty".
 */
export const gradeTable = (problem, answers) => {
  const rows = problem.rows.map((row) => {
    const answer = answers[row.index];
    if (answer === undefined || answer === null) return "empty";
    return answer === row.value ? "correct" : "wrong";
  });
  return {
    rows,
    wrong: rows.filter((r) => r === "wrong").length,
    empty: rows.filter((r) => r === "empty").length,
    allCorrect: rows.every((r) => r === "correct"),
  };
};

/** Compare a selected set of row indexes with the expected one. */
export const gradeSelection = (expected, selected) => {
  const want = new Set(expected);
  const got = new Set(selected);
  const missing = expected.filter((i) => !got.has(i));
  const extra = [...got].filter((i) => !want.has(i)).sort((a, b) => a - b);
  return { correct: missing.length === 0 && extra.length === 0, missing, extra };
};

const literal = (name, complemented) => (complemented ? `${name}'` : name);

/** TeX for the canonical sum of minterms, e.g. A'B'C + AB'C. */
export const sumOfMintermsTex = (problem, minterms) => {
  if (minterms.length === 0) return "0";
  return minterms
    .map((index) => {
      const { bits } = problem.rows[index];
      // A minterm uses the plain variable where the bit is 1.
      return problem.variables
        .map((name, b) => literal(name, bits[b] === 0))
        .join("");
    })
    .join(" + ");
};

/** TeX for the canonical product of maxterms, e.g. (A + B + C')(A' + B + C). */
export const productOfMaxtermsTex = (problem, maxterms) => {
  if (maxterms.length === 0) return "1";
  return maxterms
    .map((index) => {
      const { bits } = problem.rows[index];
      // A maxterm uses the plain variable where the bit is 0.
      const sum = problem.variables
        .map((name, b) => literal(name, bits[b] === 1))
        .join(" + ");
      return `(${sum})`;
    })
    .join("");
};

export const formatIndexes = (indexes) => indexes.join(", ");
