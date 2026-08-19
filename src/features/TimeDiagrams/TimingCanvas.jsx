import React from 'react';

const WaveformRow = ({ label, bits }) => {
  const stepWidth = 50;
  const height = 40;
  const highY = 8;
  const lowY = 32;

  // Build SVG Path for digital square wave
  let pathD = '';
  bits.forEach((bit, i) => {
    const xStart = i * stepWidth;
    const xEnd = (i + 1) * stepWidth;
    const yVal = bit === 1 ? highY : lowY;

    if (i === 0) {
      pathD += `M ${xStart} ${yVal} L ${xEnd} ${yVal}`;
    } else {
      const prevY = bits[i - 1] === 1 ? highY : lowY;
      if (prevY !== yVal) {
        pathD += ` L ${xStart} ${yVal}`; // Vertical edge
      }
      pathD += ` L ${xEnd} ${yVal}`; // Horizontal line
    }
  });

  return (
    <div className="wave-row">
      <span className="wave-label">{label}</span>
      <div className="svg-container">
        <svg
          viewBox={`0 0 ${bits.length * stepWidth} ${height}`}
          className="waveform-svg"
          preserveAspectRatio="none"
        >
          {/* Tick Grid Lines */}
          {bits.map((_, i) => (
            <line
              key={i}
              x1={i * stepWidth}
              y1="0"
              x2={i * stepWidth}
              y2={height}
              className="grid-tick-line"
            />
          ))}
          {/* Signal Waveform Line */}
          <path d={pathD} className="waveform-path" />
        </svg>
      </div>
    </div>
  );
};

const TimingCanvas = ({ signal, output }) => {
  return (
    <div className="timing-diagram-card">
      <WaveformRow label="Input (X)" bits={signal} />
      <WaveformRow label="Output (Y)" bits={output} />
      
      <div className="time-ticks-axis">
        <span className="wave-label">Ticks</span>
        <div className="ticks-labels">
          {signal.map((_, i) => (
            <span key={i} className="tick-marker">t{i}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimingCanvas;
