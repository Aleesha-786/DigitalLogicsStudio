import React, { useState } from 'react';
import ProblemCard from './ProblemCard';

const ProblemList = ({ problems, detailedContentMap, getExplanation, getKeyTakeaway }) => {
  const [expandedProblems, setExpandedProblems] = useState(new Set());
  const [showDetailedExplanation, setShowDetailedExplanation] = useState({});

  const toggleProblem = (id) => {
    setExpandedProblems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleDetailedExplanation = (id) => {
    setShowDetailedExplanation((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="problems-container">
      {problems.map((problem) => (
        <ProblemCard
          key={problem.id}
          problem={problem}
          isExpanded={expandedProblems.has(problem.id)}
          onToggle={toggleProblem}
          showDetailed={!!showDetailedExplanation[problem.id]}
          onToggleDetailed={toggleDetailedExplanation}
          detailedContentMap={detailedContentMap}
          getExplanation={getExplanation}
          getKeyTakeaway={getKeyTakeaway}
        />
      ))}
    </div>
  );
};

export default ProblemList;
