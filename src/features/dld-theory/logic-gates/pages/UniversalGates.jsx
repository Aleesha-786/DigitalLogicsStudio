import React, { useState } from 'react';
import AdvancedLogicLayout from '../../../../shared/layouts/AdvancedLogicLayout';
import ExplanationBlock from '../../../../shared/components/ExplanationBlock';
import InteractiveDemo from '../components/InteractiveDemo';
import CircuitModal from '../../../../shared/components/CircuitModal';
import { gateSymbols } from '../../../../shared/data/gates';
import { useUniversalGate } from '../hooks/useUniversalGate';
import {
  universalGateDemoInputs,
  complexExpressions,
  implementationDescriptions,
} from '../data/universalGatesData';

const UniversalGates = () => {
  const [open, setOpen] = useState(false);
  const { selectedGate, setSelectedGate, currentGate } = useUniversalGate('NAND');

  const handleInputChange = (inputs) => {
    // This will be called when demo inputs change
    console.log('Inputs changed:', inputs);
  };

  return (
    <AdvancedLogicLayout
      title="Universal Gates"
      subtitle="Deep dive into NAND and NOR gates - the building blocks of all digital logic"
      intro="Follow a unified advanced-logic lesson path while exploring how NAND and NOR gates can synthesize every other logic function."
      highlights={[
        {
          title: 'Single-Gate Universality',
          text: 'See why NAND and NOR can build complete digital systems on their own.',
        },
        {
          title: 'Interactive Verification',
          text: 'Toggle truth tables and compare reusable gate constructions side by side.',
        },
        {
          title: 'Design Motivation',
          text: 'Connect universal gates to manufacturing efficiency and logic-family choices.',
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

      <ExplanationBlock
        title="What are Universal Gates?"
        intro="Universal gates are special logic gates that can be used to implement any Boolean function without using any other gate types."
      >
        <div className="universal-intro">
          <div className="gate-selector">
            <h3>Select Universal Gate:</h3>
            <div className="gate-buttons">
              <button
                className={`gate-btn ${selectedGate === 'NAND' ? 'active' : ''}`}
                onClick={() => setSelectedGate('NAND')}
              >
                {gateSymbols.NAND} NAND
              </button>
              <button
                className={`gate-btn ${selectedGate === 'NOR' ? 'active' : ''}`}
                onClick={() => setSelectedGate('NOR')}
              >
                {gateSymbols.NOR} NOR
              </button>
            </div>
          </div>

          <div className="gate-info">
            <h4>{currentGate.title}</h4>
            <p>{currentGate.description}</p>
            <div className="gate-symbol">
              <span className="symbol-display">{gateSymbols[selectedGate]}</span>
            </div>
          </div>
        </div>
      </ExplanationBlock>

      <InteractiveDemo
        title={`${currentGate.title} Truth Table`}
        description="Interactive truth table for the selected universal gate"
        inputs={universalGateDemoInputs}
        outputs={[{ name: 'Q', label: 'Output', value: null }]}
        onInputChange={handleInputChange}
        showTruthTable={true}
        truthTableData={currentGate.truthTable}
      />

      <ExplanationBlock
        title="Universal Property Demonstrations"
        intro="See how universal gates can implement all other basic logic gates:"
      >
        <div className="implementations">
          {Object.entries(currentGate.implementations).map(([gateType, expression]) => (
            <div key={gateType} className="implementation-card">
              <h4>{gateType} Gate Implementation</h4>
              <div className="expression-display">
                <code>{expression}</code>
              </div>
              <div className="implementation-desc">{implementationDescriptions[gateType]}</div>
            </div>
          ))}
        </div>
      </ExplanationBlock>

      <ExplanationBlock
        title="Why Universal Gates Matter"
        intro="Universal gates are fundamental to digital circuit design for several important reasons:"
      >
        <div className="importance-grid">
          <div className="importance-item">
            <h4>🏭 Manufacturing Efficiency</h4>
            <p>
              Manufacturing plants can focus on producing only one type of gate,
              reducing complexity and cost while maintaining the ability to create any logic circuit.
            </p>
          </div>

          <div className="importance-item">
            <h4>🔧 Design Simplicity</h4>
            <p>
              Circuit designers can standardize on a single gate type, making
              design rules, testing, and optimization more straightforward.
            </p>
          </div>

          <div className="importance-item">
            <h4>⚡ Performance Optimization</h4>
            <p>
              Different logic families have different characteristics. TTL logic
              favors NAND gates, while CMOS logic works well with both NAND and NOR.
            </p>
          </div>

          <div className="importance-item">
            <h4>📚 Educational Value</h4>
            <p>
              Understanding universal gates helps students grasp the fundamental
              nature of Boolean logic and how complex functions are built from simple operations.
            </p>
          </div>
        </div>
      </ExplanationBlock>

      <ExplanationBlock
        title="Interactive Activities"
        intro="Try these hands-on exercises to master universal gates:"
      >
        <div className="activities">
          <div className="activity-card">
            <h4>🎯 Activity 1: Build Basic Gates</h4>
            <p>
              Using only NAND gates, try to build AND, OR, and NOT gates.
              Then verify your implementations using the truth tables.
            </p>
            <div className="activity-steps">
              <ol>
                <li>Start with NOT: Connect both NAND inputs together</li>
                <li>Build AND: Double-negate a NAND output</li>
                <li>Create OR: Use De Morgan's law with NAND gates</li>
              </ol>
            </div>
          </div>

          <div className="activity-card">
            <h4>🧮 Activity 2: Implement Complex Functions</h4>
            <p>Implement the following Boolean expressions using only universal gates:</p>
            <div className="expressions">
              {complexExpressions.map((expression, index) => (
                <div key={index} className="expression-item">
                  <code>{expression.expression}</code>
                  <span className="hint">{expression.hint}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="activity-card">
            <h4>🔍 Activity 3: Gate Count Comparison</h4>
            <p>Compare the number of universal gates needed vs. standard gates for various functions:</p>
            <div className="comparison-table">
              <table>
                <thead>
                  <tr>
                    <th>Function</th>
                    <th>Standard Gates</th>
                    <th>NAND Only</th>
                    <th>NOR Only</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>XOR</td>
                    <td>1 XOR gate</td>
                    <td>4 NAND gates</td>
                    <td>5 NOR gates</td>
                  </tr>
                  <tr>
                    <td>AND-OR</td>
                    <td>1 AND + 1 OR</td>
                    <td>3 NAND gates</td>
                    <td>4 NOR gates</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ExplanationBlock>

      <CircuitModal
        open={open}
        onClose={() => setOpen(false)}
        expression={selectedGate === 'NAND' ? "(A·B)'" : "(A+B)'"}
        variables={['A', 'B']}
      />

      <style jsx>{`
        .universal-intro {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-top: 20px;
        }

        .gate-selector h3 {
          color: #93c5fd;
          margin-bottom: 16px;
        }

        .gate-buttons {
          display: flex;
          gap: 12px;
        }

        .gate-btn {
          padding: 12px 24px;
          background: var(--card-bg-solid);
          border: 2px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-color);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1rem;
        }

        .gate-btn:hover {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.1);
        }

        .gate-btn.active {
          background: rgba(99, 102, 241, 0.2);
          border-color: #6366f1;
          color: #93c5fd;
        }

        .gate-info {
          background: var(--card-bg-solid);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          overflow: hidden;
        }

        .gate-info h4 {
          color: #93c5fd;
          margin-bottom: 12px;
        }

        .gate-info p {
          color: var(--secondary-text);
          margin-bottom: 16px;
        }

        .symbol-display {
          font-size: 3rem;
          color: #6366f1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }

        .symbol-display :global(svg) {
          width: 48px;
          height: 48px;
          max-width: 100%;
          max-height: 100%;
        }

        .implementations {
          display: grid;
          gap: 16px;
          margin-top: 20px;
        }

        .implementation-card {
          background: var(--card-bg-solid);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
        }

        .implementation-card h4 {
          color: #93c5fd;
          margin-bottom: 12px;
        }

        .expression-display {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
        }

        .expression-display code {
          color: var(--text-color);
          font-family: 'Courier New', monospace;
          font-size: 0.95rem;
        }

        .implementation-desc {
          color: var(--secondary-text);
          font-size: 0.9rem;
        }

        .importance-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .importance-item {
          background: var(--accent-green-bg);
          border: 1px solid var(--accent-green-border);
          border-radius: 12px;
          padding: 20px;
        }

        .importance-item h4 {
          color: var(--accent-green-text);
          margin-bottom: 12px;
        }

        .importance-item p {
          color: var(--secondary-text);
          margin: 0;
          line-height: 1.6;
        }

        .activities {
          display: grid;
          gap: 20px;
          margin-top: 20px;
        }

        .activity-card {
          background: var(--accent-orange-bg);
          border: 1px solid var(--accent-orange-border);
          border-radius: 12px;
          padding: 20px;
        }

        .activity-card h4 {
          color: var(--accent-orange-text);
          margin-bottom: 12px;
        }

        .activity-card p {
          color: var(--secondary-text);
          margin-bottom: 16px;
          line-height: 1.6;
        }

        .activity-steps {
          background: var(--card-bg-solid);
          border-radius: 8px;
          padding: 16px;
        }

        .activity-steps ol {
          margin: 0;
          padding-left: 20px;
          color: var(--text-color);
        }

        .activity-steps li {
          margin-bottom: 8px;
        }

        .expressions {
          display: grid;
          gap: 12px;
          margin-top: 16px;
        }

        .expression-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--card-bg-solid);
          padding: 12px;
          border-radius: 8px;
        }

        .expression-item code {
          color: #93c5fd;
          font-family: 'Courier New', monospace;
        }

        .hint {
          color: var(--secondary-text);
          font-size: 0.9rem;
          font-style: italic;
        }

        .comparison-table {
          overflow-x: auto;
          margin-top: 16px;
        }

        .comparison-table table {
          width: 100%;
          border-collapse: collapse;
          background: var(--card-bg-solid);
          border-radius: 8px;
          overflow: hidden;
        }

        .comparison-table th,
        .comparison-table td {
          padding: 12px;
          text-align: center;
          border: 1px solid var(--border-color);
          color: var(--text-color);
        }

        .comparison-table th {
          background: var(--accent-purple-bg);
          color: var(--accent-purple-text);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .universal-intro {
            grid-template-columns: 1fr;
          }

          .importance-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AdvancedLogicLayout>
  );
};

export default UniversalGates;
