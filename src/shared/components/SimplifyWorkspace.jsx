import React, { useId, useRef, useState } from "react";
import Tex from "./Tex";
import { gradeStep } from "../utils/simplification";
import "./SimplifyWorkspace.css";

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

/**
 * A derivation the learner builds one checked step at a time. A step with the
 * same truth table as the given expression is kept; any other is shown struck
 * through in red and never joins the derivation; the expected simplest form
 * ends it.
 *
 * `problem` comes from compileSimplification(). The workspace keeps its own
 * progress, so give it a new `key` to start a different problem.
 */
const SimplifyWorkspace = ({
  problem,
  badge = null,
  solvedTitle = "Solved",
  onSolved,
  actions = null,
  solvedActions = null,
  autoFocus = false,
}) => {
  const [steps, setSteps] = useState([]);
  const [discardedCount, setDiscardedCount] = useState(0);
  // Outcome of the most recent check, plus the text that was checked.
  const [result, setResult] = useState(null);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const id = useId();
  const inputId = `${id}-step`;
  const feedbackId = `${id}-feedback`;

  const solved = result?.status === "solved";
  const invalid = result?.status === "invalid";

  const startOver = () => {
    setSteps([]);
    setDiscardedCount(0);
    setResult(null);
    setInput("");
  };

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
      setDiscardedCount(discardedCount + 1);
      return;
    }
    const nextSteps = [...steps, outcome.tex];
    setSteps(nextSteps);
    if (outcome.status === "solved" && onSolved) {
      onSolved({ steps: nextSteps.length, discarded: discardedCount });
    }
  };

  const retryDiscarded = () => {
    setInput(result.input);
    inputRef.current?.focus();
  };

  return (
    <div className="simplify-workspace">
      <div className="simplify-head">
        <span className="simplify-label">Reduce to the simplest form</span>
        {badge}
      </div>

      <ol className="simplify-steps" aria-label="Your derivation">
        <li className="simplify-step is-given">
          <span className="simplify-step-tag">Given</span>
          <span className="simplify-step-expr">
            <Tex>{`F = ${problem.givenTex}`}</Tex>
          </span>
        </li>
        {steps.map((tex, i) => {
          const isAnswer = solved && i === steps.length - 1;
          return (
            <li
              key={i}
              className={`simplify-step is-valid${isAnswer ? " is-answer" : ""}`}
            >
              <span className="simplify-step-tag">Step {i + 1}</span>
              <span className="simplify-step-expr">
                <Tex>{`= ${tex}`}</Tex>
              </span>
              <span className="simplify-step-note">
                ✓ {isAnswer ? "Simplest form" : "Same truth table"}
              </span>
            </li>
          );
        })}
        {result?.status === "discarded" && (
          <li className="simplify-step is-discarded">
            <span className="simplify-step-tag">Discarded</span>
            <span className="simplify-step-expr">
              <span className="simplify-struck">
                <Tex>{`= ${result.tex}`}</Tex>
              </span>
            </span>
            <button
              type="button"
              className="simplify-link-btn simplify-retry"
              onClick={retryDiscarded}
            >
              Edit and retry
            </button>
            <span className="simplify-step-reason">
              ✗ {describeCounterexample(result.counterexample)}
            </span>
          </li>
        )}
      </ol>

      {solved ? (
        <div className="simplify-result" role="status">
          {/* Plain divs: hosts style their own headings and paragraphs. */}
          <div className="simplify-result-title">{solvedTitle}</div>
          <div className="simplify-result-text">
            <Tex>{`F = ${problem.answerTex}`}</Tex> is the simplest form. You
            reached it in {steps.length} {steps.length === 1 ? "step" : "steps"}
            {discardedCount > 0 && ` with ${discardedCount} discarded`}.
          </div>
          {solvedActions}
        </div>
      ) : (
        <form className="simplify-form" onSubmit={handleSubmit} noValidate>
          <label className="simplify-field-label" htmlFor={inputId}>
            Your next step
          </label>
          <div className="simplify-input-row">
            <span className="simplify-input-prefix" aria-hidden="true">
              F =
            </span>
            <input
              id={inputId}
              ref={inputRef}
              type="text"
              className={`simplify-input${invalid ? " is-invalid" : ""}`}
              value={input}
              onChange={handleChange}
              placeholder="e.g. A'B + C(A + B)"
              maxLength={120}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              autoFocus={autoFocus}
              aria-invalid={invalid}
              aria-describedby={feedbackId}
            />
            <button
              type="submit"
              className="simplify-check-btn"
              disabled={!input.trim()}
            >
              Check step
            </button>
          </div>
          <div
            id={feedbackId}
            className={`simplify-feedback${result ? ` is-${result.status}` : ""}`}
            role="status"
          >
            {invalid ? result.message : FEEDBACK[result?.status] || ""}
          </div>
          <div className="simplify-actions">
            <button
              type="button"
              className="simplify-link-btn"
              onClick={startOver}
              disabled={!result && !input}
            >
              Start over
            </button>
            {actions}
          </div>
        </form>
      )}
    </div>
  );
};

export default SimplifyWorkspace;
