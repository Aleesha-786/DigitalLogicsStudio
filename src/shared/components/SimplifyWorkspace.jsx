import React, { useId, useRef, useState } from "react";
import Tex from "./Tex";
import { gradeStep } from "../utils/simplification";
import "./SimplifyWorkspace.css";

// Wording for the default task, reducing an expression. A host with a
// different task (see BooleanTheoremsAssessment) overrides what it needs.
const DEFAULT_COPY = {
  label: "Reduce to the simplest form",
  // What each step is an expression for, as TeX. Empty continues the given
  // "F = …" chain; a task that derives something else names it, e.g. "F'".
  stepLhs: "",
  inputPrefix: "F =",
  fieldLabel: "Your next step",
  submitLabel: "Check step",
  stepNote: "Same truth table",
  answerNote: "Simplest form",
  valid: "Valid step — same truth table. Keep simplifying.",
  discarded:
    "Not equivalent — that step was discarded. Continue from your last valid step.",
  // What a discarded step is compared against, in the counterexample.
  reference: "the original expression",
  solvedText: "is the simplest form",
};

const describeCounterexample = ({ assignment, expected, actual }, reference) => {
  const row = Object.entries(assignment)
    .map(([name, value]) => `${name} = ${value}`)
    .join(", ");
  return `When ${row}, ${reference} is ${expected} but this one is ${actual}.`;
};

/**
 * A derivation the learner builds one checked step at a time. A step with the
 * same truth table as the given expression is kept; any other is shown struck
 * through in red and never joins the derivation; the expected simplest form
 * ends it.
 *
 * `problem` comes from compileSimplification(). The workspace keeps its own
 * progress, so give it a new `key` to start a different problem.
 *
 * `grade` and `copy` adapt it to another task: `grade(problem, input)` returns
 * the same outcome shape as gradeStep(), and `copy` replaces any of the
 * DEFAULT_COPY wording. A problem without `answerTex` shows the learner's own
 * final step as the answer.
 */
const SimplifyWorkspace = ({
  problem,
  badge = null,
  solvedTitle = "Solved",
  onSolved,
  actions = null,
  solvedActions = null,
  autoFocus = false,
  grade = gradeStep,
  copy = null,
}) => {
  const text = { ...DEFAULT_COPY, ...copy };
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
    const outcome = grade(problem, input);
    setResult({ ...outcome, input });
    inputRef.current?.focus();
    if (outcome.status === "invalid") return;

    setInput("");
    if (outcome.status === "discarded") {
      setDiscardedCount(discardedCount + 1);
      return;
    }
    setSteps([...steps, outcome.tex]);
    if (outcome.status === "solved" && onSolved) onSolved();
  };

  const retryDiscarded = () => {
    setInput(result.input);
    inputRef.current?.focus();
  };

  const feedback = invalid
    ? result.message
    : { valid: text.valid, discarded: text.discarded }[result?.status] || "";

  return (
    <div className="simplify-workspace">
      <div className="simplify-head">
        <span className="simplify-label">{text.label}</span>
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
                <Tex>{`${text.stepLhs} = ${tex}`}</Tex>
              </span>
              <span className="simplify-step-note">
                ✓ {isAnswer ? text.answerNote : text.stepNote}
              </span>
            </li>
          );
        })}
        {result?.status === "discarded" && (
          <li className="simplify-step is-discarded">
            <span className="simplify-step-tag">Discarded</span>
            <span className="simplify-step-expr">
              <span className="simplify-struck">
                <Tex>{`${text.stepLhs} = ${result.tex}`}</Tex>
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
              ✗ {describeCounterexample(result.counterexample, text.reference)}
            </span>
          </li>
        )}
      </ol>

      {solved ? (
        <div className="simplify-result" role="status">
          {/* Plain divs: hosts style their own headings and paragraphs. */}
          <div className="simplify-result-title">{solvedTitle}</div>
          <div className="simplify-result-text">
            <Tex>{`${text.stepLhs || "F"} = ${
              problem.answerTex ?? steps[steps.length - 1]
            }`}</Tex>{" "}
            {text.solvedText}. You reached it in {steps.length}{" "}
            {steps.length === 1 ? "step" : "steps"}
            {discardedCount > 0 && ` with ${discardedCount} discarded`}.
          </div>
          {solvedActions}
        </div>
      ) : (
        <form className="simplify-form" onSubmit={handleSubmit} noValidate>
          <label className="simplify-field-label" htmlFor={inputId}>
            {text.fieldLabel}
          </label>
          <div className="simplify-input-row">
            <span className="simplify-input-prefix" aria-hidden="true">
              {text.inputPrefix}
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
              {text.submitLabel}
            </button>
          </div>
          <div
            id={feedbackId}
            className={`simplify-feedback${result ? ` is-${result.status}` : ""}`}
            role="status"
          >
            {feedback}
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
