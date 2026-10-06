// src/features/problems/components/__tests__/coalProblems.grading.test.js
//
// One test per COAL problem (15 total, from coalProblemsData.js).
// Unlike DLD problems, COAL problems store a real `correctAnswer` and are
// graded by CoalProblemModal's own submit handler (cleanString compare for
// "fill_in", exact option match for "mcq"). So here we can test the actual
// grading logic end-to-end: render the real modal, submit that problem's
// own correct answer through it, and assert it's scored correct — plus
// the data-shape checks needed for the modal to render at all.

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import CoalProblemModal from "../components/CoalProblemModal";
import coalProblemsCatalog from "../data/coalProblemsCatalog";

const VALID_DIFFICULTIES = ["Easy", "Medium", "Hard"];
const VALID_TYPES = ["mcq", "fill_in"];

const submitAnswer = (problem) => {
  if (problem.type === "mcq") {
    // Option text renders inside the button (with a letter badge span
    // alongside it) — clicking the text bubbles up to the button's
    // onClick, same as a real user click.
    fireEvent.click(screen.getByText(problem.correctAnswer));
  } else {
    fireEvent.change(screen.getByPlaceholderText(/type your answer/i), {
      target: { value: problem.correctAnswer },
    });
  }
  fireEvent.click(screen.getByRole("button", { name: /submit answer/i }));
};

describe("COAL problems — data shape + grading logic", () => {
  test("catalog has exactly 15 problems", () => {
    expect(coalProblemsCatalog).toHaveLength(15);
  });

  test("no duplicate problem ids in the COAL catalog", () => {
    const ids = coalProblemsCatalog.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test.each(coalProblemsCatalog.map((problem) => [problem.title, problem]))(
    "Problem #%s: %s — valid shape and grades its own correct answer as correct",
    (_title, problem) => {
      // ── Data shape ──────────────────────────────────────────────────
      expect(typeof problem.id).toBe("number");
      expect(problem.title).toEqual(expect.any(String));
      expect(VALID_DIFFICULTIES).toContain(problem.difficulty);
      expect(problem.description.length).toBeGreaterThan(0);
      expect(problem.hint.length).toBeGreaterThan(0);
      expect(Array.isArray(problem.inputs)).toBe(true);
      expect(Array.isArray(problem.outputs)).toBe(true);

      expect(VALID_TYPES).toContain(problem.type);
      expect(problem.correctAnswer).toEqual(expect.any(String));
      expect(problem.correctAnswer.length).toBeGreaterThan(0);

      if (problem.type === "mcq") {
        expect(Array.isArray(problem.options)).toBe(true);
        expect(problem.options.length).toBeGreaterThanOrEqual(2);
        // The stored correct answer must actually be one of the choices,
        // or the real UI could never be graded correct for this problem.
        expect(problem.options).toContain(problem.correctAnswer);
      }

      // Enrichment fields added by coalProblemsCatalog.js's enrichProblem()
      expect(problem.numericId).toBe(problem.id);
      expect(problem.listId).toBe(`COAL-${problem.id}`);
      expect(typeof problem.acceptanceRate).toBe("number");
      expect(problem.topic).toEqual(expect.any(String));
      expect(problem.filterGroup).toEqual(expect.any(String));

      // ── Grading logic (real component, real submit handler) ──────────
      const onSolved = jest.fn();
      const onAttempt = jest.fn();
      render(
        <CoalProblemModal
          problem={problem}
          onClose={jest.fn()}
          onSolved={onSolved}
          onAttempt={onAttempt}
        />,
      );

      submitAnswer(problem);

      expect(screen.getByText(/correct! outstanding job/i)).toBeInTheDocument();
      expect(onAttempt).toHaveBeenCalledWith(problem);
      expect(onSolved).toHaveBeenCalledWith(problem);
    },
  );
});
