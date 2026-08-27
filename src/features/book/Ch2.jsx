import React from 'react';
import { Cpu, Binary, BookOpen, Lightbulb, CheckCircle } from 'lucide-react';
import { logic_and_computer_design_fundamental } from 'dld-books';

import BookPageLayout from './BookPageLayout';
import SolverHeader from './components/SolverHeader';
import StatsBar from './components/StatsBar';
import ProblemList from './components/ProblemList';

import ch2DetailedContent from './data/ch2DetailedContent';
import { getCh2Explanation, getCh2KeyTakeaway } from './data/ch2TextContent';

const STATS = [
  { icon: BookOpen, label: '41 Problems' },
  { icon: Lightbulb, label: 'K-Maps, VHDL & Verilog' },
  { icon: CheckCircle, label: 'Solution Manual Verified' },
];

const Ch2ProblemSolver = () => {
  const problems = logic_and_computer_design_fundamental.Ch2;

  return (
    <BookPageLayout>
      <div className="solver-container">
        <SolverHeader
          icon={Cpu}
          decorationIcon={Binary}
          title="Combinational Logic Problem Solver"
          subtitle="Chapter 2: Boolean Algebra & Logic Gates • All 25 Problems"
        />

        <StatsBar stats={STATS} />

        <ProblemList
          problems={problems}
          detailedContentMap={ch2DetailedContent}
          getExplanation={getCh2Explanation}
          getKeyTakeaway={getCh2KeyTakeaway}
        />
      </div>
    </BookPageLayout>
  );
};

export default Ch2ProblemSolver;
