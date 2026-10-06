import React from 'react';
import { ChevronDown, BookOpen, Calculator, Lightbulb } from 'lucide-react';
import ShortAnswerBox from './ShortAnswerBox';
import DefaultExplanation from './DefaultExplanation';

/**
 * detailedContentMap: { [problemId]: React.ComponentType<{ problem }> }
 * getExplanation / getKeyTakeaway: (id) => string, used by DefaultExplanation
 * when a problem has no hand-written entry in detailedContentMap.
 */
const ProblemCard = ({
  problem,
  isExpanded,
  onToggle,
  showDetailed,
  onToggleDetailed,
  detailedContentMap = {},
  getExplanation,
  getKeyTakeaway,
}) => {
  const CustomDetailedExplanation = detailedContentMap[problem.id];

  return (
    <div className={`problem-card ${isExpanded ? 'expanded' : ''}`}>
      <button className="problem-header" onClick={() => onToggle(problem.id)}>
        <div className="problem-title-row">
          <div className="problem-id">PROBLEM {problem.id}</div>
          <div className="category-tag">{problem.category}</div>
        </div>
        <h3 className="problem-title">{problem.title}</h3>
        <ChevronDown className={`chevron ${isExpanded ? 'rotated' : ''}`} size={24} />
      </button>

      {isExpanded && (
        <div className="problem-content">
          <div className="question-section">
            <div className="section-header">
              <BookOpen size={20} />
              <h4>Question</h4>
            </div>
            <p className="question-text">{problem.question}</p>
          </div>

          <div className="solution-section">
            <div className="section-header">
              <Calculator size={20} />
              <h4>Solution</h4>
            </div>

            <ShortAnswerBox answer={problem.shortAnswer} />

            <button className="explanation-toggle" onClick={() => onToggleDetailed(problem.id)}>
              <Lightbulb size={18} />
              {showDetailed ? 'Hide Detailed Explanation' : 'Show Detailed Explanation'}
            </button>

            {showDetailed && (
              <div className="deep-explanation">
                <div className="deep-content">
                  <h5>
                    <Lightbulb size={20} />
                    Detailed Step-by-Step Explanation
                  </h5>

                  {CustomDetailedExplanation ? (
                    <CustomDetailedExplanation problem={problem} />
                  ) : (
                    <DefaultExplanation
                      problem={problem}
                      getExplanation={getExplanation}
                      getKeyTakeaway={getKeyTakeaway}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemCard;
