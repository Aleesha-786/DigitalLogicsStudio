import React from 'react';
import { Cpu, Binary, BookOpen, Lightbulb, CheckCircle } from 'lucide-react';
import { logic_and_computer_design_fundamental } from 'dld-books';

import BookPageLayout from './BookPageLayout';
import SolverHeader from './components/SolverHeader';
import StatsBar from './components/StatsBar';
import ProblemList from './components/ProblemList';

import ch1DetailedContent from './data/ch1DetailedContent';
import { getCh1Explanation, getCh1KeyTakeaway } from './data/ch1TextContent';

const STATS = [
  { icon: BookOpen, label: '30 Problems' },
  { icon: Lightbulb, label: 'Detailed Explanations' },
  { icon: CheckCircle, label: 'Solution Manual Verified' },
];

const ProblemSolver = () => {
  const problems = logic_and_computer_design_fundamental.Ch1;

  return (
    <BookPageLayout>
      <div className="solver-container">
        <SolverHeader
          icon={Cpu}
          decorationIcon={Binary}
          title="Computer Systems Problem Solver"
          subtitle="Chapter 1: Number Systems & Digital Encoding • All 30 Problems"
        />

        <StatsBar stats={STATS} />

        <ProblemList
          problems={problems}
          detailedContentMap={ch1DetailedContent}
          getExplanation={getCh1Explanation}
          getKeyTakeaway={getCh1KeyTakeaway}
        />
      </div>
    </BookPageLayout>
  );
};

export default ProblemSolver;
