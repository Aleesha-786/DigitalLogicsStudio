import React from 'react';
import { Lightbulb } from 'lucide-react';

/** A titled block of prose inside a detailed explanation. */
export const ConceptSection = ({ title, children }) => (
  <div className="concept-section">
    {title && <h6>{title}</h6>}
    {children}
  </div>
);

/** A single paragraph of plain-language explanation. */
export const SimpleExplanation = ({ children, className = '' }) => (
  <p className={`simple-explanation ${className}`.trim()}>{children}</p>
);

/** A boxed "scenario" — e.g. one case of a multi-part problem. */
export const ScenarioBox = ({ title, children }) => (
  <div className="scenario-box">
    {title && <h6 className="scenario-title">{title}</h6>}
    {children}
  </div>
);

/** An ASCII waveform / K-map / diagram block. */
export const WaveformBlock = ({ label, children }) => (
  <div className="waveform-display">
    {label && <div className="waveform-label">{label}</div>}
    <pre className="waveform-visual">{children}</pre>
  </div>
);

/** A numbered list of steps, e.g. "what the computer needs to do". */
export const ApplicationSteps = ({ steps = [] }) => (
  <>
    {steps.map((step, i) => (
      <div className="application-item" key={i}>
        <span className="app-bullet">{i + 1}</span>
        <div>{step}</div>
      </div>
    ))}
  </>
);

/** "All switches ON" style binary visual. */
export const BinaryVisual = ({ label, value }) => (
  <div className="binary-visual">
    <strong>{label}</strong>
    <div className="binary-display">{value}</div>
  </div>
);

/** A block of algebraic / arithmetic steps. */
export const CalculationSteps = ({ title, steps = [] }) => (
  <div className="calculation-steps">
    {title && <strong>{title}</strong>}
    {steps.map((step, i) => (
      <div className="calc-step" key={i}>
        {step}
      </div>
    ))}
  </div>
);

/** A single boxed "here's the final answer" callout. */
export const AnswerHighlight = ({ label = 'Answer', children }) => (
  <div className="answer-highlight">
    <strong>{label}:</strong> {children}
  </div>
);

/** A formula callout, e.g. "2^n - 1". */
export const FormulaBox = ({ children }) => (
  <div className="formula-display">
    <strong>{children}</strong>
  </div>
);

/** A small reference/lookup table. rows: string[][] */
export const ReferenceTable = ({ headers = [], rows = [] }) => (
  <div className="reference-table">
    <table>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** The dashed "remember this" box shown at the end of some explanations. */
export const KeyTakeawayBox = ({ title = '💡 Remember This!', children }) => (
  <div className="key-takeaway">
    <h6>{title}</h6>
    {children}
  </div>
);

/** The inline "key point" callout with a lightbulb icon. */
export const KeyInsightBox = ({ children }) => (
  <div className="key-insight">
    <Lightbulb size={16} />
    <span>{children}</span>
  </div>
);
