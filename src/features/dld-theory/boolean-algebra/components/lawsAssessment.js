import {
  canonicalForm,
  compareExpressions,
  parseExpression,
  toTex,
} from "../../../../shared/utils/boolExpr";

// Each expression reduces, using only the laws taught up to the Boolean Laws
// page, to one clearly simplest form. `answers` lists every way of writing
// that form which is not just a reordering — reorderings already match.
const problems = [
  { expression: "AB + A(B + C) + B(B + C)", answers: ["B + AC"] },
  { expression: "(A' + B)' + AB", answers: ["A"] },
  { expression: "A'B'C + A'BC + AC", answers: ["C"] },
  { expression: "(A + B)(A + C)", answers: ["A + BC"] },
  { expression: "(AB)'(A' + B)", answers: ["A'"] },
];

const compile = ({ expression, answers }) => {
  const given = parseExpression(expression).ast;
  const answerAsts = answers.map((answer) => parseExpression(answer).ast);
  return {
    expression,
    answers,
    given,
    givenTex: toTex(given),
    answerTex: toTex(answerAsts[0]),
    answerForms: answerAsts.map(canonicalForm),
  };
};

export const LAWS_ASSESSMENT_PROBLEMS = problems.map(compile);

/**
 * Judge one typed step against a problem:
 *   invalid   – could not be read as an expression (`message` says why)
 *   discarded – a different truth table from the given expression
 *   valid     – same truth table, but not yet the simplest form
 *   solved    – same truth table and written as the expected simplest form
 */
export const gradeStep = (problem, input) => {
  const parsed = parseExpression(input);
  if (!parsed.ok) return { status: "invalid", message: parsed.error };

  const tex = toTex(parsed.ast);
  const { equivalent, counterexample } = compareExpressions(
    problem.given,
    parsed.ast,
  );
  if (!equivalent) return { status: "discarded", tex, counterexample };

  const solved = problem.answerForms.includes(canonicalForm(parsed.ast));
  return { status: solved ? "solved" : "valid", tex };
};
