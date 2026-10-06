import React, { useState, useMemo } from 'react';
import ToolLayout from '../../shared/components/ToolLayout';
import ExplanationBlock from '../../shared/components/ExplanationBlock';
import CircuitModal from '../../shared/components/CircuitModal';
import Navbar from '../../shared/components/navbar';
import Footer from '../../shared/components/Footer';
import { useTheme } from '../../shared/context/ThemeContext';

import TimingControls from './TimingControls';
import TimingCanvas from './TimingCanvas';
import './TimeDiagrams.css';

const GATE_TYPES = {
  BUFFER: { name: 'Buffer (Pass-through)', fn: (a) => a },
  NOT: { name: 'NOT Gate', fn: (a) => (a === 1 ? 0 : 1) },
  AND: { name: 'AND Gate (Input A & B)', fn: (a, b) => a & b },
  OR: { name: 'OR Gate (Input A | B)', fn: (a, b) => a | b },
  XOR: { name: 'XOR Gate (Input A ^ B)', fn: (a, b) => a ^ b },
};

const TimeDiagrams = () => {
  const { theme, toggle: toggleTheme } = useTheme();
  const [delay, setDelay] = useState(2);
  const [gateType, setGateType] = useState('NOT');
  const [signalA, setSignalA] = useState([0, 1, 1, 0, 1, 0, 0, 1]);
  const [signalB, setSignalB] = useState([0, 0, 1, 1, 0, 1, 0, 0]);
  const [openModal, setOpenModal] = useState(false);

  // Compute output with propagation delay and logic gate evaluation
  const output = useMemo(() => {
    const gateFn = GATE_TYPES[gateType].fn;
    return signalA.map((_, i) => {
      const srcIdx = Math.max(0, i - delay);
      const aVal = signalA[srcIdx] ?? 0;
      const bVal = signalB[srcIdx] ?? 0;
      return gateFn(aVal, bVal);
    });
  }, [signalA, signalB, delay, gateType]);

  const handleToggleBitA = (index) => {
    setSignalA((prev) => {
      const next = [...prev];
      next[index] = next[index] === 1 ? 0 : 1;
      return next;
    });
  };

  const handleToggleBitB = (index) => {
    setSignalB((prev) => {
      const next = [...prev];
      next[index] = next[index] === 1 ? 0 : 1;
      return next;
    });
  };

  return (
    <div className={`boolforge-page theme-${theme}`}>
      <div className="grid-background" />
      <Navbar toggleTheme={toggleTheme} theme={theme} />

      <main className="boolforge-main">
        <ToolLayout title="Timing Diagrams & Gate Delay" subtitle="Visualizing propagation effects">
          <ExplanationBlock title="Propagation Delay & Circuit Timing">
            <div className="card-header-action">
              <p className="explanation-intro">
                Real logic gates require physical time to transition logic states. Adjust delay, toggle input bits, or choose logic functions to analyze timing shifts and hazards.
              </p>
              
              <button
                className="experiment-circuit-btn"
                onClick={() => setOpenModal(true)}
              >
                <span className="btn-icon">🔌</span>
                <span className="btn-text">Experiment in Circuit Builder</span>
              </button>
            </div>

            <TimingControls
              delay={delay}
              setDelay={setDelay}
              gateType={gateType}
              setGateType={setGateType}
              gateTypes={GATE_TYPES}
              signalA={signalA}
              signalB={signalB}
              onToggleBitA={handleToggleBitA}
              onToggleBitB={handleToggleBitB}
            />

            <TimingCanvas
              signalA={signalA}
              signalB={signalB}
              output={output}
              gateType={gateType}
            />
          </ExplanationBlock>

          <CircuitModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            expression={"F = A.B' + C"}
            variables={['A', 'B', 'C']}
          />
        </ToolLayout>
      </main>

      <Footer />
    </div>
  );
};

export default TimeDiagrams;
