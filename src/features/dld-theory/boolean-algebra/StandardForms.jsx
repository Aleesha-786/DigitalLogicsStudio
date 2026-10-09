import React, { useState, useMemo } from 'react';
import BALayout from './BALayout';
import ControlPanel from '../../../shared/components/ControlPanel';
import ControlGroup from '../../../shared/components/ControlGroup';
import CircuitModal from '../../../shared/components/CircuitModal';
import { parseSOP, generateTruthTable, extractVariables, stripLabel } from '../../../shared/utils/boolMath';

const Block = ({ title, children }) => (
  <section className="ba-section">
    <div className="ba-section-header">
      <h2 className="ba-section-title">{title}</h2>
    </div>
    {children}
  </section>
);

const toPOS = (variables, expression) => {
  const tt = generateTruthTable(variables, expression);
  const rows = tt.rows;
  const maxterms = [];
  rows.forEach((row, idx) => {
    if (row[row.length - 1] === 0) {
      const parts = variables.map((v, j) => row[j] === 1 ? `${v}'` : v);
      maxterms.push(`(${parts.join('+')})`);
    }
  });
  return maxterms.length ? maxterms.join('.') : '1';
};

const StandardForms = () => {
  const [input, setInput] = useState("F = AB' + C");
  const [open, setOpen] = useState(false);
  const expr = useMemo(() => stripLabel(input), [input]);
  // Inputs come from the expression itself (max 6 to keep the table small)
  const variables = useMemo(() => {
    const found = extractVariables(expr);
    return found.length ? found.slice(0, 6) : ['A', 'B', 'C'];
  }, [expr]);
  const tt = useMemo(() => generateTruthTable(variables, expr), [variables, expr]);
  const sopTerms = useMemo(() => parseSOP(expr), [expr]);
  const pos = useMemo(() => toPOS(variables, expr), [variables, expr]);

  return (
    <BALayout
      title="Standard Forms (SOP & POS)"
      subtitle="Convert expressions and verify with truth tables"
      intro="Sum of Products and Product of Sums are the two canonical ways to write a logic function. Enter an expression to see both forms and check them against its truth table."
    >
      <Block title="Understanding Standard Forms">
        <p className="explanation-intro">
          Standard forms in Boolean algebra provide systematic ways to represent logic functions. Sum of Products (SOP) and Product of Sums (POS) are the two canonical forms that are essential for circuit design, simplification, and implementation.
        </p>
        <div className="comparison-grid">
          <div className="info-card">
            <h5>Sum of Products (SOP)</h5>
            <ul>
              <li>OR of AND terms</li>
              <li>Each term is a product of literals</li>
              <li>Also called "disjunctive normal form"</li>
              <li>Natural for implementation with AND-OR gates</li>
              <li>Example: F = AB + A'C + BC</li>
            </ul>
          </div>
          <div className="info-card">
            <h5>Product of Sums (POS)</h5>
            <ul>
              <li>AND of OR terms</li>
              <li>Each term is a sum of literals</li>
              <li>Also called "conjunctive normal form"</li>
              <li>Natural for implementation with OR-AND gates</li>
              <li>Example: F = (A + B)(A' + C)(B + C)</li>
            </ul>
          </div>
        </div>
        <div className="key-insight">
          <h4>Why Standard Forms Matter:</h4>
          <p>Standard forms provide a systematic approach to logic design, enable automated optimization algorithms, and serve as the foundation for techniques like Karnaugh maps and Quine-McCluskey method.</p>
        </div>
      </Block>
      <ControlPanel>
        <ControlGroup label="Expression (SOP)">
          <input
            type="text"
            className="control-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </ControlGroup>
      </ControlPanel>

      <Block title="SOP Analysis">
        <p className="explanation-intro">Current SOP terms: {sopTerms.map(t => t.map(l => l.v + (l.n ? "'" : '')).join('')).join(' + ') || '—'}</p>
        <div className="info-card">
          <h4>SOP Properties:</h4>
          <ul>
            <li><strong>Canonical SOP:</strong> Contains all minterms where function = 1</li>
            <li><strong>Reduced SOP:</strong> Simplified form with fewer terms</li>
            <li><strong>Implementation:</strong> AND gates for each term, OR gate to combine outputs</li>
          </ul>
        </div>
        <div className="example-box">
          <h4>SOP to Circuit Mapping:</h4>
          <p>Each product term becomes an AND gate:</p>
          <ul>
            <li>AB → 2-input AND gate</li>
            <li>A'C → 2-input AND gate (with NOT for A')</li>
            <li>C → Direct connection (no gate needed)</li>
          </ul>
          <p>All AND outputs feed into a final OR gate.</p>
        </div>
      </Block>

      <Block title="POS Analysis">
        <p className="explanation-intro">Equivalent POS: <span className="highlight">{pos}</span></p>
        <div className="info-card">
          <h4>POS Properties:</h4>
          <ul>
            <li><strong>Canonical POS:</strong> Contains all maxterms where function = 0</li>
            <li><strong>Reduced POS:</strong> Simplified form with fewer terms</li>
            <li><strong>Implementation:</strong> OR gates for each term, AND gate to combine outputs</li>
          </ul>
        </div>
        <div className="example-box">
          <h4>POS Conversion Process:</h4>
          <p>From truth table to POS:</p>
          <ol>
            <li>Identify rows where output = 0 (maxterms)</li>
            <li>For each row, create sum term with complemented variables for 1s and true variables for 0s</li>
            <li>Multiply all sum terms together</li>
          </ol>
        </div>
      </Block>

      <Block title="Interactive Examples">
        <div className="interactive-example">
          <h4>Try These Expressions:</h4>
          <div className="example-buttons">
            <button className="kmap-btn kmap-btn-secondary" onClick={() => setInput("F = A + B")}>
              A + B
            </button>
            <button className="kmap-btn kmap-btn-secondary" onClick={() => setInput("F = AB + C")}>
              AB + C
            </button>
            <button className="kmap-btn kmap-btn-secondary" onClick={() => setInput("F = A'BC + AB'")}>
              A'BC + AB'
            </button>
            <button className="kmap-btn kmap-btn-secondary" onClick={() => setInput("F = A + B'C")}>
              A + B'C
            </button>
          </div>
        </div>
        <div className="example-box">
          <h4>Conversion Challenge:</h4>
          <p>Can you convert F = A + B'C to POS form?</p>
          <details>
            <summary>Show Solution</summary>
            <p><strong>Truth Table Analysis:</strong></p>
            <p>Rows where F=0: (A=0, B=0, C=0), (A=0, B=1, C=0) and (A=0, B=1, C=1)</p>
            <p><strong>Maxterms:</strong> M(0, 2, 3)</p>
            <p><strong>POS:</strong> (A + B + C)(A + B' + C)(A + B' + C') = (A + B')(A + C)</p>
          </details>
        </div>
      </Block>

      <Block title="Truth Table">
      <div className="binary-table-container">
        <table className="binary-table">
          <thead className="binary-table-header">
            <tr>{tt.headers.map((h, i) => <th key={`${h}-${i}`}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {tt.rows.map((row, i) => (
              <tr key={i} className="binary-table-row">
                {row.map((c, j) => <td key={j} className="binary-table-cell">{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </Block>

      <Block title="Form Selection Guidelines">
        <div className="comparison-grid">
          <div className="info-card">
            <h5>When to Use SOP</h5>
            <ul>
              <li>Fewer 0s than 1s in truth table</li>
              <li>NAND-only implementation desired</li>
              <li>AND-OR gate cascade preferred</li>
              <li>PLA/PAL programming</li>
            </ul>
          </div>
          <div className="info-card">
            <h5>When to Use POS</h5>
            <ul>
              <li>Fewer 1s than 0s in truth table</li>
              <li>NOR-only implementation desired</li>
              <li>OR-AND gate cascade preferred</li>
              <li>Some optimization algorithms</li>
            </ul>
          </div>
        </div>
      </Block>

      <div className="kmap-card">
        <button className="kmap-btn kmap-btn-primary kmap-btn-full" onClick={() => setOpen(true)}>
          🔌 Visualize Circuit
        </button>
      </div>

      <CircuitModal open={open} onClose={() => setOpen(false)} expression={expr} variables={variables} />
    </BALayout>
  );
};

export default StandardForms;
