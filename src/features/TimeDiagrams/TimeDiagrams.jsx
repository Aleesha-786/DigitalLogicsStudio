import React, { useState, useEffect } from 'react';
import ToolLayout from '../../shared/components/ToolLayout';
import ExplanationBlock from '../../shared/components/ExplanationBlock';
import CircuitModal from '../../shared/components/CircuitModal';
import Navbar from '../../shared/components/navbar';
import Footer from '../../shared/components/Footer';
import { useTheme } from '../../shared/context/ThemeContext';

import TimingControls from './TimingControls';
import TimingCanvas from './TimingCanvas';
import './TimeDiagrams.css';

const TimeDiagrams = () => {
  const { theme, toggle: toggleTheme } = useTheme();
  const [delay, setDelay] = useState(2);
  const [signal, setSignal] = useState([0, 1, 1, 0, 1, 0, 0, 1]);
  const [output, setOutput] = useState([]);
  const [open, setOpen] = useState(false);

  // Recompute output waveform when signal or propagation delay changes
  useEffect(() => {
    const out = signal.map((_, i) => signal[Math.max(0, i - delay)] ?? 0);
    setOutput(out);
  }, [signal, delay]);

  const handleToggleBit = (index) => {
    setSignal((prev) => {
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
          <div className="kmap-card" style={{ marginBottom: '1rem' }}>
            <button
              className="kmap-btn kmap-btn-primary kmap-btn-full"
              onClick={() => setOpen(true)}
            >
              🔌 Experiment with Circuit
            </button>
          </div>

          <ExplanationBlock title="Propagation Delay">
            <p className="explanation-intro">
              Real logic gates take physical time to switch states. The output waveform shifts in time relative to the input by the total propagation delay.
            </p>

            <TimingControls
              delay={delay}
              setDelay={setDelay}
              signal={signal}
              onToggleBit={handleToggleBit}
            />

            <TimingCanvas signal={signal} output={output} />
          </ExplanationBlock>

          <CircuitModal
            open={open}
            onClose={() => setOpen(false)}
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
