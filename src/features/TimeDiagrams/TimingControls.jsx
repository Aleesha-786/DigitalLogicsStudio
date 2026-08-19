import React from 'react';

const TimingControls = ({
  delay,
  setDelay,
  gateType,
  setGateType,
  gateTypes,
  signalA = [],
  signalB = [],
  onToggleBitA,
  onToggleBitB,
}) => {
  const requiresSecondInput = gateType === 'AND' || gateType === 'OR' || gateType === 'XOR';

  return (
    <div className="timing-controls-container">
      <div className="control-row">
        <div className="timing-control-group">
          <label className="control-label">Logic Gate Function</label>
          <select
            value={gateType}
            onChange={(e) => setGateType(e.target.value)}
            className="gate-select"
          >
            {Object.keys(gateTypes).map((key) => (
              <option key={key} value={key}>
                {gateTypes[key].name}
              </option>
            ))}
          </select>
        </div>

        <div className="timing-control-group">
          <label className="control-label">
            Propagation Delay (t<sub>pd</sub>)
          </label>
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="4"
              value={delay}
              onChange={(e) => setDelay(parseInt(e.target.value, 10))}
              className="delay-slider"
            />
            <span className="delay-badge">{delay} {delay === 1 ? 'tick' : 'ticks'}</span>
          </div>
        </div>
      </div>

      <div className="signal-editor">
        <span className="control-label">Toggle Input A Bits:</span>
        <div className="bit-buttons">
          {signalA.map((bit, idx) => (
            <button
              key={idx}
              className={`bit-toggle-btn ${bit ? 'bit-high' : 'bit-low'}`}
              onClick={() => onToggleBitA(idx)}
            >
              t{idx}: {bit}
            </button>
          ))}
        </div>
      </div>

      {requiresSecondInput && (
        <div className="signal-editor">
          <span className="control-label">Toggle Input B Bits:</span>
          <div className="bit-buttons">
            {signalB.map((bit, idx) => (
              <button
                key={idx}
                className={`bit-toggle-btn ${bit ? 'bit-high' : 'bit-low'}`}
                onClick={() => onToggleBitB(idx)}
              >
                t{idx}: {bit}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimingControls;
