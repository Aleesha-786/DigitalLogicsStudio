// src/features/problems/test/simplifyProblems.grading.test.js
//
// One test per step-by-step simplification problem (type: "simplify", from
// simplifyProblemsData.js). Like the COAL problems these store a real
// `correctAnswer`, so the grading is tested end-to-end: render the real
// SimplifyProblemModal, type that problem's own answer, and assert it is
// scored as solved — plus the data-shape checks the modal relies on.

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import SimplifyProblemModal from "../components/SimplifyProblemModal";
import problemsCatalog from "../data/problemCatalog";
import {
  compareExpressions,
  evaluate,
  parseExpression,
} from "../../../shared/utils/boolExpr";

const simplifyProblems = problemsCatalog.filter((p) => p.type === "simplify");

const literalCount = (node) => {
  if (node.type === "var") return 1;
  if (node.type === "const") return 0;
  if (node.type === "not") return literalCount(node.arg);
  return node.args.reduce((sum, arg) => sum + literalCount(arg), 0);
};

const renderModal = (problem) => {
  const onSolved = jest.fn();
  const view = render(
    <SimplifyProblemModal
      problem={problem}
      onClose={jest.fn()}
      onSolved={onSolved}
    />,
  );
  return { onSolved, ...view };
};

const enterStep = (text) => {
  fireEvent.change(screen.getByLabelText(/your next step/i), {
    target: { value: text },
  });
  fireEvent.click(screen.getByRole("button", { name: /check step/i }));
};

describe("Simplification problems — data shape + grading logic", () => {
  test("catalog has exactly 8 simplification problems, none premium-locked", () => {
    expect(simplifyProblems).toHaveLength(8);
    simplifyProblems.forEach((problem) => {
      expect(problem.premium).toBe(false);
      expect(problem.filterGroup).toBe("Boolean Algebra");
    });
  });

  test.each(simplifyProblems.map((problem) => [problem.title, problem]))(
    "%s — valid shape and grades its own answers as solved",
    (_title, problem) => {
      // ── Data shape ──────────────────────────────────────────────────
      const given = parseExpression(problem.expression);
      expect(given.ok).toBe(true);
      expect(problem.inputs).toEqual(given.variables);
      expect(problem.outputs).toEqual(["F"]);
      expect(problem.equations).toEqual([`F = ${problem.expression}`]);
      expect(problem.description).toContain(problem.expression);

      // The hint's truth table is the table of the given expression.
      expect(problem.truthTable).toHaveLength(2 ** given.variables.length);
      problem.truthTable.forEach((row) => {
        expect(row.F).toBe(evaluate(given.ast, row));
      });

      // Every accepted answer is equivalent to the expression and shorter.
      const answers = [problem.correctAnswer, ...(problem.acceptedAnswers || [])];
      answers.forEach((answer) => {
        const parsed = parseExpression(answer);
        expect(parsed.ok).toBe(true);
        expect(compareExpressions(given.ast, parsed.ast).equivalent).toBe(true);
        expect(literalCount(parsed.ast)).toBeLessThan(literalCount(given.ast));
      });

      // ── Grading, through the real modal ─────────────────────────────
      answers.forEach((answer) => {
        const { onSolved, unmount } = renderModal(problem);
        enterStep(answer);
        expect(screen.getByText("Problem solved")).toBeInTheDocument();
        expect(onSolved).toHaveBeenCalledTimes(1);
        unmount();
      });
    },
  );
});

describe("SimplifyProblemModal — step checking", () => {
  const problem = simplifyProblems.find((p) => p.expression === "A + AB + A'B");

  test("keeps an equivalent step without solving the problem", () => {
    const { onSolved } = renderModal(problem);

    enterStep("A + A'B");

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText(/valid step/i)).toBeInTheDocument();
    expect(onSolved).not.toHaveBeenCalled();
  });

  test("discards a step with a different truth table and says where it differs", () => {
    const { onSolved } = renderModal(problem);

    enterStep("AB");

    expect(screen.getByText("Discarded")).toBeInTheDocument();
    expect(screen.queryByText("Step 1")).not.toBeInTheDocument();
    expect(
      screen.getByText(
        /When A = 0, B = 1, the original expression is 1 but this one is 0\./,
      ),
    ).toBeInTheDocument();
    expect(onSolved).not.toHaveBeenCalled();
  });

  test("reports unreadable input without discarding it", () => {
    renderModal(problem);

    enterStep("A + (B");

    expect(
      screen.getByText("A closing parenthesis is missing."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Discarded")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/your next step/i)).toHaveValue("A + (B");
  });

  test("solves on the simplest form after a full derivation, in any operand order", () => {
    const { onSolved } = renderModal(problem);

    enterStep("A + A'B");
    enterStep("(A + A')(A + B)");
    enterStep("b + a");

    expect(screen.getByText("Problem solved")).toBeInTheDocument();
    expect(screen.getByText(/reached it in 3 steps/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/your next step/i)).not.toBeInTheDocument();
    expect(onSolved).toHaveBeenCalledWith(problem);
  });

  test("shows the hint and the expression's truth table on request", () => {
    renderModal(problem);
    expect(screen.queryByText(problem.hint)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /show hint/i }));

    expect(screen.getByText(problem.hint)).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(1 + problem.truthTable.length);
  });
});
