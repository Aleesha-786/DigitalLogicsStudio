import {
  canonicalForm,
  compareExpressions,
  parseExpression,
  toTex,
} from "./boolExpr";

const parseOrThrow = (text) => {
  const parsed = parseExpression(text);
  if (!parsed.ok) {
    throw new Error(`Invalid Boolean expression "${text}": ${parsed.error}`);
  }
  return parsed;
};

/**
 * Prepare a "reduce this expression to its simplest form" exercise for
 * grading. `answers` lists every way of writing the simplest form that is not
 * just a reordering of another — reorderings already match.
 */
export const compileSimplification = ({ expression, answers }) => {
  const { ast: given, variables } = parseOrThrow(expression);
  const answerAsts = answers.map((answer) => parseOrThrow(answer).ast);
  return {
    expression,
    answers,
    given,
    variables,
    givenTex: toTex(given),
    answerTex: toTex(answerAsts[0]),
    answerForms: answerAsts.map(canonicalForm),
  };
};

/**
 * Judge one typed step against a compiled exercise:
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
