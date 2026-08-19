import React from 'react';

const TimingControls = ({ delay, setDelay, signal, onToggleBit }) => {
  return (
    <div className="timing-controls-container">
      <div className="timing-control-group">
        <label className="control-label">Propagation Delay (ticks)</label>
        <div className="slider-wrapper">
          <input
            type="range"
            min="0"
            max="5"
            value={delay}
            onChange={(e) => setDelay(parseInt(e.target.value, 10))}
            className="delay-slider"
          />
          <span className="delay-badge">{delay} {delay === 1 ? 'tick' : 'ticks'}</span>
        </div>
      </div>

      <div className="signal-editor">
        <span className="control-label">Click to Toggle Input Signal Bits:</span>
        <div className="bit-buttons">
          {signal.map((bit, idx) => (
            <button
              key={idx}
              className={`bit-toggle-btn ${bit ? 'bit-high' : 'bit-low'}`}
              onClick={() => onToggleBit(idx)}
            >
              T{idx}: {bit}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimingControls;
