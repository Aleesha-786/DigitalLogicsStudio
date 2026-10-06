import React, { useState } from "react";
import BALayout from "./BALayout";
import { LAWS_ASSESSMENT_PROBLEMS } from "./components/lawsAssessment";
import SimplifyWorkspace from "../../../shared/components/SimplifyWorkspace";
import { useLessonCompletion } from "../../../shared/components/topics/lessonCompletion";

// Rendered inside BALayout so it can reach the shell's completion state.
const LawsAssessment = () => {
  const { isComplete, markComplete } = useLessonCompletion();
  const [problemIndex, setProblemIndex] = useState(0);
  const [solved, setSolved] = useState(false);

  const nextProblem = () => {
    setProblemIndex((problemIndex + 1) % LAWS_ASSESSMENT_PROBLEMS.length);
    setSolved(false);
  };

  const handleSolved = () => {
    setSolved(true);
    markComplete();
  };

  return (
    <>
      <section className="ba-section">
        <div className="ba-section-header">
          <h2 className="ba-section-title">How This Assessment Works</h2>
        </div>
        <div className="info-card">
          <ul>
            <li>
              You are given a Boolean expression. Reduce it to its{" "}
              <strong>simplest form</strong>, one step at a time.
            </li>
            <li>
              <strong>Valid step:</strong> any expression with the same truth
              table as the original is accepted and added to your derivation.
            </li>
            <li>
              <strong>Discarded step:</strong> an expression with a different
              truth table turns red and is thrown away.
            </li>
            <li>
              The assessment is complete as soon as you enter the simplest
              form.
            </li>
          </ul>
        </div>
        <p className="assess-syntax">
          Write NOT as <code>A'</code>, OR as <code>A + B</code>, and AND as{" "}
          <code>AB</code> or <code>A.B</code>. Parentheses, <code>0</code> and{" "}
          <code>1</code> work too.
        </p>
      </section>

      <section className="ba-section">
        <div className="ba-section-header">
          <h2 className="ba-section-title">Simplify the Expression</h2>
        </div>

        {isComplete && !solved && (
          <p className="assess-done-note">
            You have already completed this assessment. Keep practicing as much
            as you like — your completion is saved.
          </p>
        )}

        {/* Keyed so each expression starts with an empty derivation. */}
        <SimplifyWorkspace
          key={problemIndex}
          problem={LAWS_ASSESSMENT_PROBLEMS[problemIndex]}
          solvedTitle="Assessment complete"
          onSolved={handleSolved}
          badge={
            <span className="ba-badge">
              Expression {problemIndex + 1} of{" "}
              {LAWS_ASSESSMENT_PROBLEMS.length}
            </span>
          }
          actions={
            <button
              type="button"
              className="simplify-link-btn"
              onClick={nextProblem}
            >
              Try a different expression
            </button>
          }
          solvedActions={
            <button
              type="button"
              className="kmap-btn kmap-btn-secondary"
              onClick={nextProblem}
            >
              Practice another expression
            </button>
          }
        />
      </section>
    </>
  );
};

const BooleanLawsAssessment = () => (
  <BALayout
    title="Boolean Laws Assessment"
    subtitle="Put the laws to work on a real simplification"
    intro="Reading the laws is one thing; applying them is another. Take the expression below down to its simplest form — every step you type is checked against the original truth table."
  >
    <LawsAssessment />
  </BALayout>
);

export default BooleanLawsAssessment;
