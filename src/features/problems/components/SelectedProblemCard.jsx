import React from "react";
import { Link } from "react-router-dom";
import { difficultyTone } from "../utils/problemsUtils";

const SelectedProblemCard = React.memo(function SelectedProblemCard({
  problem,
  status,
  onAttempt,
  onToggleSolved,
}) {
  if (!problem) {
    return null;
  }

  return (
    <section className="problems-widget selected-problem-widget">
      <div className="problems-widget-head">
        <div>
          <span className="problems-widget-label">Selected Problem</span>
          <h3>{problem.title}</h3>
        </div>
        <span
          className={`difficulty-pill ${difficultyTone[problem.difficulty]}`}
        >
          {problem.difficulty}
        </span>
      </div>

      <p className="selected-problem-description">{problem.description}</p>

      <div className="selected-problem-tags">
        {problem.tags.slice(0, 5).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <div className="selected-problem-meta">
        <span>Acceptance {problem.acceptanceRate}%</span>
        <span>{status?.attempts || 0} attempts</span>
        <span>{status?.status === "solved" ? "Solved" : "In progress"}</span>
      </div>

      {problem.hint ? (
        <p className="selected-problem-hint">Hint: {problem.hint}</p>
      ) : null}

      <div className="selected-problem-actions">
        <button type="button" onClick={() => onAttempt(problem)}>
          Record attempt
        </button>
        <button
          type="button"
          className={status?.status === "solved" ? "is-solved" : ""}
          onClick={() => onToggleSolved(problem, status?.status !== "solved")}
        >
          {status?.status === "solved" ? "Mark unsolved" : "Mark solved"}
        </button>
        <Link to="/boolforge" className="selected-problem-link">
          Open Circuit Forge
        </Link>
      </div>
    </section>
  );
});

export default SelectedProblemCard;
