// src/features/problems/data/__tests__/dldProblems.data.test.js
//
// One test per DLD problem. Each test checks two things together, per the
// team's ask ("data shape + grading logic per problem"):
//
//   1. DATA SHAPE — every field the UI/components read (ProblemsPage,
//      ProblemModal, ProblemTableRow, CalendarWidget tooltip, etc.) is
//      present and well-formed.
//
//   2. GRADING READINESS — DLD problems aren't graded against a stored
//      `correctAnswer` string. They're graded live in ProblemModal.jsx's
//      `handleSubmitCircuit`, which walks `problem.truthTable` and, for
//      every row, reads `row[outputLabel]` and (for INPUT gates)
//      `row[inputLabel]`. If a row is missing one of those keys, or the
//      value isn't a clean 0/1, the real grading algorithm will either
//      silently treat it as falsy or mis-score a correct circuit — so we
//      replicate that exact contract here and fail loudly if any problem's
//      truth table can't actually be graded.
//
// NOTE: this does not build/simulate a circuit for each problem (there's
// no stored "correct circuit" to build one from — only human-entered
// gates in the real UI). It verifies every problem's truth table is in
// the shape the grading algorithm requires to work correctly at all.

import problemsCatalog from "../data/problemCatalog";

const VALID_DIFFICULTIES = ["Easy", "Medium", "Hard"];
const VALID_TYPES = ["fill_in", "mcq"];

// Mirrors ProblemModal.jsx's own reading of a truth-table cell:
//   const val = row[g.label];
//   return { ...g, inputValues: [val === 1 || val === true] };
// and:
//   const expected = row[outLabel] !== undefined ? row[outLabel] : 0;
// A gradable cell must be strictly 0, 1, true, or false — anything else
// (undefined, a string, NaN) means the row can't be scored correctly.
const isGradableBit = (value) =>
  value === 0 || value === 1 || value === true || value === false;

describe("DLD problems — data shape + grading readiness", () => {
  test("catalog has exactly 46 problems", () => {
    expect(problemsCatalog).toHaveLength(46);
  });

  test("no duplicate problem ids in the DLD catalog", () => {
    const ids = problemsCatalog.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test.each(problemsCatalog.map((problem) => [problem.title, problem]))(
    "Problem #%s: %s — valid shape and gradable truth table",
    (_title, problem) => {
      // ── Data shape ──────────────────────────────────────────────────
      expect(typeof problem.id).toBe("number");
      expect(problem.title).toEqual(expect.any(String));
      expect(problem.title.length).toBeGreaterThan(0);
      expect(VALID_DIFFICULTIES).toContain(problem.difficulty);
      expect(problem.description).toEqual(expect.any(String));
      expect(problem.description.length).toBeGreaterThan(0);
      expect(problem.hint).toEqual(expect.any(String));
      expect(problem.hint.length).toBeGreaterThan(0);

      expect(Array.isArray(problem.inputs)).toBe(true);
      expect(problem.inputs.length).toBeGreaterThan(0);
      expect(Array.isArray(problem.outputs)).toBe(true);
      expect(problem.outputs.length).toBeGreaterThan(0);

      expect(Array.isArray(problem.equations)).toBe(true);
      expect(problem.equations.length).toBeGreaterThan(0);

      expect(Array.isArray(problem.truthTable)).toBe(true);
      expect(problem.truthTable.length).toBeGreaterThan(0);

      // Enrichment fields added by problemCatalog.js's enrichProblem()
      expect(problem.slug).toEqual(expect.any(String));
      expect(problem.slug.length).toBeGreaterThan(0);
      expect(problem.numericId).toBe(problem.id);
      expect(problem.listId).toEqual(expect.any(String));
      expect(typeof problem.acceptanceRate).toBe("number");
      expect(problem.acceptanceRate).toBeGreaterThanOrEqual(28);
      expect(problem.acceptanceRate).toBeLessThanOrEqual(94);
      expect(problem.topic).toEqual(expect.any(String));
      expect(problem.filterGroup).toEqual(expect.any(String));

      if (problem.type) {
        // ── Answer-graded problem (fill_in / mcq) ─────────────────────
        // Graded via CoalProblemModal-style logic against `correctAnswer`,
        // not the circuit builder — `truthTable` here is reference/display
        // content only, so it's intentionally NOT checked against
        // outputs/inputs the way circuit problems are below.
        expect(VALID_TYPES).toContain(problem.type);
        expect(problem.correctAnswer).toEqual(expect.any(String));
        expect(problem.correctAnswer.length).toBeGreaterThan(0);

        if (problem.type === "mcq") {
          expect(Array.isArray(problem.options)).toBe(true);
          expect(problem.options.length).toBeGreaterThanOrEqual(2);
          expect(problem.options).toContain(problem.correctAnswer);
        }
        return;
      }

      // ── Grading readiness (mirrors ProblemModal.handleSubmitCircuit) ──
      // Only check inputs that appear as an exact truth-table column —
      // some problems document grouped/range inputs (e.g. "A3..A0") that
      // aren't literal row keys; those aren't read by evaluateGate and
      // are outside the grading contract.
      const literalInputs = problem.inputs.filter((label) =>
        problem.truthTable.every((row) =>
          Object.prototype.hasOwnProperty.call(row, label),
        ),
      );

      problem.truthTable.forEach((row) => {
        // Every declared output must be present and gradable on every row.
        problem.outputs.forEach((outputLabel) => {
          expect(row).toHaveProperty(outputLabel);
          expect(isGradableBit(row[outputLabel])).toBe(true);
        });
        // Every literal input column must be gradable on every row.
        literalInputs.forEach((inputLabel) => {
          expect(isGradableBit(row[inputLabel])).toBe(true);
        });
      });
    },
  );
});
