import React, { useState } from "react";
import BALayout from "./BALayout";
import { THEOREM_PARTS } from "./components/theoremsAssessment";
import SimplifyWorkspace from "../../../shared/components/SimplifyWorkspace";
import { useLessonCompletion } from "../../../shared/components/topics/lessonCompletion";

// One of the three tasks. Each keeps its own expression, so trying a different
// one in a part leaves the other parts as they are.
const AssessmentPart = ({ part, number, passed, onPassed }) => {
  const [problemIndex, setProblemIndex] = useState(0);

  const nextProblem = () => {
    setProblemIndex((problemIndex + 1) % part.problems.length);
  };

  return (
    <section className="ba-section">
      <div className="ba-section-header">
        <h2 className="ba-section-title">
          Part {number}: {part.title}
        </h2>
      </div>
      <p className="assess-part-intro">{part.intro}</p>

      {/* Keyed so each expression starts with an empty derivation. */}
      <SimplifyWorkspace
        key={problemIndex}
        problem={part.problems[problemIndex]}
        grade={part.grade}
        copy={part.copy}
        solvedTitle={`Part ${number} complete`}
        onSolved={onPassed}
        badge={
          <span className="ba-badge">
            {passed && "✓ Passed · "}
            Expression {problemIndex + 1} of {part.problems.length}
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
  );
};

// Rendered inside BALayout so it can reach the shell's completion state.
const TheoremsAssessment = () => {
  const { isComplete, markComplete } = useLessonCompletion();
  // Ids of the parts passed on this visit; all of them complete the page.
  const [passed, setPassed] = useState([]);

  const handlePassed = (id) => {
    if (passed.includes(id)) return;
    const next = [...passed, id];
    setPassed(next);
    if (next.length === THEOREM_PARTS.length) markComplete();
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
              There are three parts: apply the{" "}
              <strong>consensus theorem</strong>, find a <strong>dual</strong>,
              and find a <strong>complement</strong>.
            </li>
            <li>
              <strong>Valid step:</strong> an expression with the right truth
              table is accepted and added to your working.
            </li>
            <li>
              <strong>Discarded step:</strong> an expression with a different
              truth table turns red and is thrown away.
            </li>
            <li>
              The assessment is complete once you have passed all three parts,
              in any order.
            </li>
          </ul>
        </div>
        <p className="assess-syntax">
          Write NOT as <code>A'</code>, OR as <code>A + B</code>, and AND as{" "}
          <code>AB</code> or <code>A.B</code>. Parentheses, <code>0</code> and{" "}
          <code>1</code> work too.
        </p>
        <p className="assess-syntax" role="status">
          {isComplete && passed.length === 0
            ? "You have already completed this assessment. Keep practicing as much as you like — your completion is saved."
            : `${passed.length} of ${THEOREM_PARTS.length} parts passed.`}
        </p>
      </section>

      {THEOREM_PARTS.map((part, index) => (
        <AssessmentPart
          key={part.id}
          part={part}
          number={index + 1}
          passed={passed.includes(part.id)}
          onPassed={() => handlePassed(part.id)}
        />
      ))}
    </>
  );
};

const BooleanTheoremsAssessment = () => (
  <BALayout
    title="Theorems Assessment"
    subtitle="Consensus, duals and complements in practice"
    intro="Three short tasks on the last three lessons: remove a redundant term with the consensus theorem, write the dual of an expression, and write its complement. Every answer you type is checked against the truth table."
  >
    <TheoremsAssessment />
  </BALayout>
);

export default BooleanTheoremsAssessment;
