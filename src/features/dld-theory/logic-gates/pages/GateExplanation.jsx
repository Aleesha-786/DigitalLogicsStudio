import React, { useState } from 'react';
import AdvancedLogicLayout from '../../../../shared/layouts/AdvancedLogicLayout';
import ExplanationBlock from '../../../../shared/components/ExplanationBlock';
import CircuitModal from '../../../../shared/components/CircuitModal';
import { gateSymbols } from '../../../../shared/data/gates';
import { gates, gateExplanationExample, gateExplanationVariables } from '../data/gateLibraryData';

const GateExplanation = () => {
  const [open, setOpen] = useState(false);

  return (
    <AdvancedLogicLayout
      title="Logic Gates"
      subtitle="Symbols, behavior, and intuition"
      intro="Review the core gate library inside the same premium learning shell used by the rest of the platform so even reference material feels integrated."
      highlights={[
        {
          title: 'Visual Library',
          text: 'Scan the fundamental gate set and keep symbols paired with behavior at a glance.',
        },
        {
          title: 'Behavior Intuition',
          text: 'Use concise descriptions to connect each symbol to its logical meaning.',
        },
        {
          title: 'Circuit Exploration',
          text: 'Jump from reference to live experimentation without leaving the lesson flow.',
        },
      ]}
    >
      <div className="kmap-card" style={{ marginBottom: '1rem' }}>
        <button
          className="kmap-btn kmap-btn-primary kmap-btn-full"
          onClick={() => setOpen(true)}
        >
          🔌 Experiment with Circuit
        </button>
      </div>

      <ExplanationBlock title="Gate Library">
        <div className="gate-grid">
          {gates.map((g) => (
            <div key={g.type} className="gate-card">
              <div className="gate-icon">{gateSymbols[g.type]}</div>
              <h4 className="gate-title">{g.title}</h4>
              <p className="gate-desc">{g.desc}</p>
            </div>
          ))}
        </div>
      </ExplanationBlock>

      <ExplanationBlock title="Truth Table Intuition">
        <p className="explanation-intro">
          Use XOR example {gateExplanationExample} to see differing inputs produce 1. Open the
          circuit editor to experiment.
        </p>
      </ExplanationBlock>

      <CircuitModal
        open={open}
        onClose={() => setOpen(false)}
        expression={gateExplanationExample}
        variables={gateExplanationVariables}
      />

      <style jsx>{`
        .gate-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }
        .gate-card {
          background: var(--card-bg-solid);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
        }
        .gate-icon {
          color: #93c5fd;
          margin-bottom: 8px;
          display: flex;
          justify-content: center;
        }
        .gate-title {
          margin: 4px 0;
        }
        .gate-desc {
          color: var(--secondary-text);
          margin: 0;
        }
      `}</style>
    </AdvancedLogicLayout>
  );
};

export default GateExplanation;
