// Step-by-step Boolean simplification problems (type: "simplify").
//
// Solved in SimplifyProblemModal: the learner types one step at a time, every
// step is checked against the truth table of `expression`, and the problem is
// solved once a step is written as `correctAnswer` (in any order of operands)
// or as one of `acceptedAnswers` — the other equally short ways of writing it.
//
// The truth table, inputs and equation are derived from `expression` below, so
// a problem only has to state its expression and its simplest form.
//
// IDs continue the DLD range. 45 is skipped on purpose: problemCatalog.js
// marks every id divisible by 5 as premium, and a premium problem can't be
// opened.

import { evaluate, parseExpression } from "../../../shared/utils/boolExpr";

const definitions = [
  {
    id: 41,
    title: "Simplify: Redundant Literal",
    difficulty: "Easy",
    tags: ["Absorption"],
    expression: "A + AB + A'B",
    correctAnswer: "A + B",
    hint: "Absorb AB into A first. What is left, A + A'B, is the OR form of the distributive law: (A + A')(A + B).",
  },
  {
    id: 42,
    title: "Simplify: De Morgan Then Distribute",
    difficulty: "Easy",
    tags: ["De Morgan"],
    expression: "(A'B)'B",
    correctAnswer: "AB",
    hint: "Break the complemented product with De Morgan, distribute B across the sum, then drop the term that contains B'B.",
  },
  {
    id: 43,
    title: "Simplify: Every Row Covered",
    difficulty: "Easy",
    tags: ["Complement"],
    expression: "AB + A'B + AB' + A'B'",
    correctAnswer: "1",
    hint: "Factor the shared variable out of each pair of terms. X + X' is always 1.",
  },
  {
    id: 44,
    title: "Simplify: Product of Sums Pair",
    difficulty: "Medium",
    tags: ["Distributive"],
    expression: "(A + B + C)(A + B' + C)",
    correctAnswer: "A + C",
    hint: "Treat A + C as a single term X. Then (X + B)(X + B') is the OR form of the distributive law: X + BB'.",
  },
  {
    id: 46,
    title: "Simplify: Double De Morgan",
    difficulty: "Medium",
    tags: ["De Morgan"],
    expression: "((AB)' + C)' + (A' + B')'C",
    correctAnswer: "AB",
    hint: "Apply De Morgan to each bracket separately and cancel the double complements. The two terms you get differ only in C.",
  },
  {
    id: 47,
    title: "Simplify: Textbook Reduction",
    difficulty: "Medium",
    tags: ["Distributive"],
    expression: "A'(A + B) + (B + AA)(A + B')",
    correctAnswer: "A + B",
    hint: "Replace AA with A and expand both products: A'A and BB' vanish. Finish with A + A'B = A + B.",
  },
  {
    id: 48,
    title: "Simplify: Consensus Term",
    difficulty: "Hard",
    tags: ["Consensus"],
    expression: "AB + A'C + BCD",
    correctAnswer: "AB + A'C",
    acceptedAnswers: ["(A + C)(A' + B)"],
    hint: "BCD looks independent, but multiply it by (A + A'): one half is absorbed by AB and the other by A'C.",
  },
  {
    id: 49,
    title: "Simplify: Four-Variable Grouping",
    difficulty: "Hard",
    tags: ["Distributive"],
    expression: "A'B'C'D' + A'B'CD' + AB'C'D' + AB'CD' + BD",
    correctAnswer: "BD + B'D'",
    acceptedAnswers: ["(B + D')(B' + D)"],
    hint: "The first four terms all contain B'D'. Factor it out — what remains covers every combination of A and C.",
  },
];

const buildTruthTable = (ast, variables) =>
  Array.from({ length: 2 ** variables.length }, (_, row) => {
    const assignment = {};
    variables.forEach((name, i) => {
      assignment[name] = (row >> (variables.length - 1 - i)) & 1;
    });
    return { ...assignment, F: evaluate(ast, assignment) };
  });

const toProblem = ({ tags, expression, ...rest }) => {
  const { ast, variables } = parseExpression(expression);
  return {
    ...rest,
    tags: ["Boolean Algebra", "Simplification", ...tags],
    description:
      `Reduce F = ${expression} to its simplest form, one step at a time. ` +
      "Every step you enter must keep the same truth table as F — a step that changes it is discarded.",
    truthTable: buildTruthTable(ast, variables),
    equations: [`F = ${expression}`],
    inputs: variables,
    outputs: ["F"],
    type: "simplify",
    expression,
  };
};

const simplifyProblemsData = definitions.map(toProblem);

export default simplifyProblemsData;
