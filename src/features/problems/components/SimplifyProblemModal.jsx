import React, { useMemo, useState } from "react";
import SimplifyWorkspace from "../../../shared/components/SimplifyWorkspace";
import { compileSimplification } from "../../../shared/utils/simplification";
import "../styles/Problems.css";

const difficultyColor = {
  Easy: "var(--accent-primary, #00ff88)",
  Medium: "var(--accent-secondary, #00d4ff)",
  Hard: "var(--accent-danger, #ff3366)",
};

// Modal for `type: "simplify"` problems (see data/simplifyProblemsData.js):
// the learner reduces problem.expression to its simplest form step by step.
const SimplifyProblemModal = ({ problem, onClose, onSolved, onAttempt }) => {
  const [showHint, setShowHint] = useState(false);

  const exercise = useMemo(
    () =>
      problem
        ? compileSimplification({
            expression: problem.expression,
            answers: [problem.correctAnswer, ...(problem.acceptedAnswers || [])],
          })
        : null,
    [problem],
  );

  if (!problem) return null;

  // A discarded step and the final answer each count as an attempt, the same
  // way every submitted answer does for the other answer-graded problems.
  const handleDiscarded = () => {
    if (onAttempt) onAttempt(problem);
  };

  const handleSolved = () => {
    if (onAttempt) onAttempt(problem);
    if (onSolved) onSolved(problem);
  };

  const columns = Object.keys(problem.truthTable[0]);

  return (
    <div className="prob-modal-overlay" onClick={onClose}>
      <div className="prob-modal" onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <div className="prob-modal-header">
          <div>
            <span className="prob-id">#{problem.id}</span>
            <h2 className="prob-modal-title">{problem.title}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span
              className="prob-difficulty"
              style={{
                color: difficultyColor[problem.difficulty],
                fontSize: "1rem",
              }}
            >
              {problem.difficulty}
            </span>
            <button className="prob-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="prob-modal-body">
          {/* ── Left: problem + derivation ── */}
          <div className="prob-modal-left">
            <section className="prob-section">
              <h4>Description</h4>
              <p>{problem.description}</p>
            </section>

            <section className="prob-section">
              <h4>Your Derivation</h4>
              {/* Keyed so each problem starts with an empty derivation. */}
              <SimplifyWorkspace
                key={problem.id}
                problem={exercise}
                solvedTitle="Problem solved"
                onSolved={handleSolved}
                onDiscarded={handleDiscarded}
                autoFocus
              />
            </section>

            {showHint && (
              <section className="prob-section prob-hint">
                <h4>💡 Hint</h4>
                <p>{problem.hint}</p>
                <div className="prob-table-wrap prob-simplify-table">
                  <table className="prob-truth-table">
                    <thead>
                      <tr>
                        {columns.map((col) => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {problem.truthTable.map((row, i) => (
                        <tr key={i}>
                          {columns.map((col) => (
                            <td
                              key={col}
                              className={row[col] === 1 ? "cell-one" : ""}
                            >
                              {row[col]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <button
              className="prob-hint-btn"
              onClick={() => setShowHint((v) => !v)}
            >
              {showHint ? "Hide Hint" : "Show Hint"}
            </button>
          </div>

          {/* ── Right: how it works ── */}
          <div className="prob-modal-right">
            <div className="prob-forge-panel">
              <div className="prob-forge-icon">✍️</div>
              <h4>Step-by-Step Simplification</h4>
              <p>
                Reduce the expression to its simplest form. Every step you
                enter is checked against the original truth table.
              </p>

              <div className="prob-simplify-rules">
                <div className="prob-simplify-rule">
                  <span className="prob-simplify-num">1</span>
                  <span>
                    Type your next step and press <strong>Check step</strong>.
                  </span>
                </div>
                <div className="prob-simplify-rule">
                  <span className="prob-simplify-num">2</span>
                  <span>
                    A step with the same truth table is kept. Any other step
                    turns red and is discarded.
                  </span>
                </div>
                <div className="prob-simplify-rule">
                  <span className="prob-simplify-num">3</span>
                  <span>
                    Enter the simplest form to solve the problem.
                  </span>
                </div>
              </div>

              <div className="prob-divider" />
              <p className="prob-simplify-syntax">
                Write NOT as <code>A'</code>, OR as <code>A + B</code>, and AND
                as <code>AB</code> or <code>A.B</code>. Parentheses,{" "}
                <code>0</code> and <code>1</code> work too.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifyProblemModal;
