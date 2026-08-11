import React from "react";
import { Link } from "react-router-dom";
import { Lock, SquarePen } from "lucide-react";
import { difficultyTone } from "../utils/problemsUtils";

/* Single problems-table row, memoized so unrelated page state changes
   (search typing, sidebar toggles, navbar, banner autoscroll, etc.) don't
   force every visible row to re-render — only rows whose own problem,
   progress, or selection actually changed will re-render.

   The only prop that can break this if it's ever made unstable is
   `onOpen` — it MUST stay a useCallback'd reference in the parent.
   There's no onEdit/onDelete callback anymore: "Open in Editor" is a
   plain <Link>, so it never needs a fresh function identity. */
const ProblemTableRow = React.memo(function ProblemTableRow({
  problem,
  progress,
  isSelected,
  onOpen,
  canManageProblems,
}) {
  const solved = progress.status === "solved";
  const attempted = progress.status === "attempted";
  const isLocked = Boolean(problem.premium);

  return (
    <tr
      className={`${isSelected ? "is-selected" : ""} ${isLocked ? "is-locked" : ""}`}
      onClick={() => onOpen(problem, solved, attempted, isLocked)}
    >
      <td>{problem.listId}</td>
      <td>
        <div className="problem-title-cell">
          <span className="problem-title-text">{problem.title}</span>
          <span className="problem-topic-text">{problem.topic}</span>
        </div>
      </td>
      <td>{problem.acceptanceRate}%</td>
      <td>
        <span
          className={`difficulty-pill ${difficultyTone[problem.difficulty]}`}
        >
          {problem.difficulty}
        </span>
      </td>
      <td>
        <span className={`access-pill ${isLocked ? "is-locked" : "is-open"}`}>
          {isLocked ? (
            <>
              <Lock size={14} aria-hidden="true" />
              Locked
            </>
          ) : (
            "Open"
          )}
        </span>
      </td>
      <td>
        <span
          className={`status-chip ${solved ? "is-solved" : attempted ? "is-attempted" : ""}`}
        >
          {solved ? "Solved" : attempted ? "Attempted" : "Not started"}
        </span>
      </td>
      <td>
        <div className="problem-tag-list">
          {problem.tags.slice(0, 3).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </td>
      {canManageProblems && (
        <td>
          <Link
            to={`/problems/editor/${problem.id}`}
            className="prob-editor-link"
            onClick={(e) => e.stopPropagation()}
          >
            <SquarePen size={14} aria-hidden="true" />
            Open in Editor
          </Link>
        </td>
      )}
    </tr>
  );
});

export default ProblemTableRow;
