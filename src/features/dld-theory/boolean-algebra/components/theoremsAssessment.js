import {
  canonicalForm,
  compareExpressions,
  dualOf,
  parseExpression,
  toTex,
} from "../../../../shared/utils/boolExpr";
import {
  compileSimplification,
  gradeStep,
} from "../../../../shared/utils/simplification";

// A task whose answer is not equivalent to the given expression (its dual, its
// complement): typed steps are compared against `target` instead.
const compileTarget = (expression, toTarget) => {
  const parsed = parseExpression(expression);
  if (!parsed.ok) {
    throw new Error(
      `Invalid Boolean expression "${expression}": ${parsed.error}`,
    );
  }
  return {
    expression,
    given: parsed.ast,
    givenTex: toTex(parsed.ast),
    target: toTarget(parsed.ast),
  };
};

// Same outcome shape as gradeStep(): invalid, discarded, valid or solved.
const gradeAgainstTarget = (problem, input, isAnswer) => {
  const parsed = parseExpression(input);
  if (!parsed.ok) return { status: "invalid", message: parsed.error };

  const tex = toTex(parsed.ast);
  const { equivalent, counterexample } = compareExpressions(
    problem.target,
    parsed.ast,
  );
  if (!equivalent) return { status: "discarded", tex, counterexample };
  return { status: isAnswer(parsed.ast) ? "solved" : "valid", tex };
};

// ── Consensus ────────────────────────────────────────────────────────────
// Each expression has exactly one term the consensus theorem makes redundant;
// dropping it leaves the simplest form.
const consensusProblems = [
  { expression: "AB + A'C + BC", answers: ["AB + A'C"] },
  { expression: "A'B + AC + BC", answers: ["A'B + AC"] },
  { expression: "AB' + BC + AC", answers: ["AB' + BC"] },
  { expression: "A'C + BC' + A'B", answers: ["A'C + BC'"] },
  { expression: "AB + A'C + BCD", answers: ["AB + A'C"] },
].map(compileSimplification);

// ── Dual ─────────────────────────────────────────────────────────────────
// The dual has to be written as the dual (in any operand order): simplifying
// it changes the expression the question asks for.
const dualProblems = [
  "A + BC",
  "AB + A'C",
  "(A + 0)(B' + C)",
  "(A + B)' + C",
  "A'B + C(A + D')",
].map((expression) => {
  const problem = compileTarget(expression, dualOf);
  return {
    ...problem,
    answerTex: toTex(problem.target),
    answerForm: canonicalForm(problem.target),
  };
});

const gradeDual = (problem, input) =>
  gradeAgainstTarget(
    problem,
    input,
    (ast) => canonicalForm(ast) === problem.answerForm,
  );

// ── Complement ───────────────────────────────────────────────────────────
// Done once De Morgan's has been carried all the way through, so that every
// complement sits on a single variable.
const complementProblems = [
  "AB + C",
  "(A + B')C",
  "A'B + AB'",
  "A(B + C'D)",
  "(A + B)(C' + D)",
].map((expression) =>
  compileTarget(expression, (ast) => ({ type: "not", arg: ast })),
);

const complementsOnlyVariables = (node) => {
  if (node.type === "not") return node.arg.type === "var";
  return node.args ? node.args.every(complementsOnlyVariables) : true;
};

const gradeComplement = (problem, input) =>
  gradeAgainstTarget(problem, input, complementsOnlyVariables);

// `grade` and `copy` are passed straight to SimplifyWorkspace.
export const THEOREM_PARTS = [
  {
    id: "consensus",
    title: "Apply the Consensus Theorem",
    intro:
      "One term in this expression is the consensus of two others. Remove it and write what is left.",
    problems: consensusProblems,
    grade: gradeStep,
    copy: {
      label: "Remove the redundant term",
      answerNote: "Redundant term removed",
      valid:
        "Valid step — same truth table. Now drop the term the consensus theorem makes redundant.",
      solvedText: "is what the consensus theorem leaves",
    },
  },
  {
    id: "dual",
    title: "Find the Dual",
    intro:
      "Swap every AND with OR and every 0 with 1. Leave the variables and complements as they are, and do not simplify the result.",
    problems: dualProblems,
    grade: gradeDual,
    copy: {
      label: "Write the dual",
      stepLhs: "F^D",
      inputPrefix: "Dual =",
      fieldLabel: "Your answer",
      submitLabel: "Check answer",
      stepNote: "Same truth table as the dual",
      answerNote: "Dual",
      valid:
        "That has the same truth table as the dual, but it is not the dual as written. Swap the operators and constants only — do not simplify.",
      discarded: "Not the dual — that answer was discarded.",
      reference: "the dual",
      solvedText: "is the dual",
    },
  },
  {
    id: "complement",
    title: "Find the Complement",
    intro:
      "Complement the whole expression, then apply De Morgan's theorem until only single variables carry a complement.",
    problems: complementProblems,
    grade: gradeComplement,
    copy: {
      label: "Write the complement",
      stepLhs: "F'",
      inputPrefix: "F' =",
      stepNote: "Same truth table as F'",
      answerNote: "Complement",
      valid:
        "Valid step — it equals F'. Keep applying De Morgan's until only single variables are complemented.",
      discarded:
        "Not equal to F' — that step was discarded. Continue from your last valid step.",
      reference: "the complement",
      solvedText: "is the complement, with only single variables complemented",
    },
  },
];
