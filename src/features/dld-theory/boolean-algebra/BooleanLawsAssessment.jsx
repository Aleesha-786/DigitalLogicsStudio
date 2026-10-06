import React, { useRef, useState } from "react";
import BALayout from "./BALayout";
import Tex from "./components/Tex";
import {
  LAWS_ASSESSMENT_PROBLEMS,
  gradeStep,
} from "./components/lawsAssessment";
import { useLessonCompletion } from "../../../shared/components/topics/lessonCompletion";

const FEEDBACK = {
  valid: "Valid step — same truth table. Keep simplifying.",
  discarded:
    "Not equivalent — that step was discarded. Continue from your last valid step.",
};

const describeCounterexample = ({ assignment, expected, actual }) => {
  const row = Object.entries(assignment)
    .map(([name, value]) => `${name} = ${value}`)
    .join(", ");
  return `When ${row}, the original expression is ${expected} but this one is ${actual}.`;
};

// Rendered inside BALayout so it can reach the shell's completion state.
const LawsAssessment = () => {
  const { isComplete, markComplete } = useLessonCompletion();
  const [problemIndex, setProblemIndex] = useState(0);
  const [steps, setSteps] = useState([]);
  const [discardedCount, setDiscardedCount] = useState(0);
  // Outcome of the most recent check, plus the text that was checked.
  const [result, setResult] = useState(null);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  const problem = LAWS_ASSESSMENT_PROBLEMS[problemIndex];
  const solved = result?.status === "solved";
  const invalid = result?.status === "invalid";

  const startProblem = (index) => {
    setProblemIndex(index);
    setSteps([]);
    setDiscardedCount(0);
    setResult(null);
    setInput("");
  };

  const nextProblem = () =>
    startProblem((problemIndex + 1) % LAWS_ASSESSMENT_PROBLEMS.length);

  const handleChange = (event) => {
    setInput(event.target.value);
    if (invalid) setResult(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const outcome = gradeStep(problem, input);
    setResult({ ...outcome, input });
    inputRef.current?.focus();
    if (outcome.status === "invalid") return;

    setInput("");
    if (outcome.status === "discarded") {
      setDiscardedCount((count) => count + 1);
      return;
    }
    setSteps((prev) => [...prev, outcome.tex]);
    if (outcome.status === "solved") markComplete();
  };

  const retryDiscarded = () => {
    setInput(result.input);
    inputRef.current?.focus();
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

        <div className="assess-card">
          <div className="assess-card-head">
            <span className="assess-card-label">
              Reduce to the simplest form
            </span>
            <span className="ba-badge">
              Expression {problemIndex + 1} of{" "}
              {LAWS_ASSESSMENT_PROBLEMS.length}
            </span>
          </div>

          <ol className="assess-steps" aria-label="Your derivation">
            <li className="assess-step is-given">
              <span className="assess-step-tag">Given</span>
              <span className="assess-step-expr">
                <Tex>{`F = ${problem.givenTex}`}</Tex>
              </span>
            </li>
            {steps.map((tex, i) => {
              const isAnswer = solved && i === steps.length - 1;
              return (
                <li
                  key={i}
                  className={`assess-step is-valid${isAnswer ? " is-answer" : ""}`}
                >
                  <span className="assess-step-tag">Step {i + 1}</span>
                  <span className="assess-step-expr">
                    <Tex>{`= ${tex}`}</Tex>
                  </span>
                  <span className="assess-step-note">
                    ✓ {isAnswer ? "Simplest form" : "Same truth table"}
                  </span>
                </li>
              );
            })}
            {result?.status === "discarded" && (
              <li className="assess-step is-discarded">
                <span className="assess-step-tag">Discarded</span>
                <span className="assess-step-expr">
                  <Tex>{`= ${result.tex}`}</Tex>
                </span>
                <button
                  type="button"
                  className="assess-retry"
                  onClick={retryDiscarded}
                >
                  Edit and retry
                </button>
                <span className="assess-step-reason">
                  ✗ {describeCounterexample(result.counterexample)}
                </span>
              </li>
            )}
          </ol>

          {solved ? (
            <div className="assess-result" role="status">
              <h4>Assessment complete</h4>
              <p>
                <Tex>{`F = ${problem.answerTex}`}</Tex> is the simplest form.
                You reached it in {steps.length}{" "}
                {steps.length === 1 ? "step" : "steps"}
                {discardedCount > 0 && ` with ${discardedCount} discarded`}.
              </p>
              <button
                type="button"
                className="kmap-btn kmap-btn-secondary"
                onClick={nextProblem}
              >
                Practice another expression
              </button>
            </div>
          ) : (
            <form className="assess-form" onSubmit={handleSubmit} noValidate>
              <label className="control-label" htmlFor="assess-step-input">
                Your next step
              </label>
              <div className="assess-input-row">
                <span className="assess-input-prefix" aria-hidden="true">
                  F =
                </span>
                <input
                  id="assess-step-input"
                  ref={inputRef}
                  type="text"
                  className={`assess-input${invalid ? " is-invalid" : ""}`}
                  value={input}
                  onChange={handleChange}
                  placeholder="e.g. A'B + C(A + B)"
                  maxLength={120}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  aria-invalid={invalid}
                  aria-describedby="assess-feedback"
                />
                <button
                  type="submit"
                  className="kmap-btn kmap-btn-primary"
                  disabled={!input.trim()}
                >
                  Check step
                </button>
              </div>
              <p
                id="assess-feedback"
                className={`assess-feedback${result ? ` is-${result.status}` : ""}`}
                role="status"
              >
                {invalid ? result.message : FEEDBACK[result?.status] || ""}
              </p>
              <div className="assess-actions">
                <button
                  type="button"
                  className="assess-link-btn"
                  onClick={() => startProblem(problemIndex)}
                  disabled={!result && !input}
                >
                  Start over
                </button>
                <button
                  type="button"
                  className="assess-link-btn"
                  onClick={nextProblem}
                >
                  Try a different expression
                </button>
              </div>
            </form>
          )}
        </div>
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
