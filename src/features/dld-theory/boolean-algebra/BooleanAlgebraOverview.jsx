import React from "react";
import BALayout from "./BALayout";

const InfoCards = () => (
  <div className="comparison-grid">
    <div className="info-card">
      <h4>Variables & Combinations</h4>
      <ul>
        <li>
          <strong>Literal:</strong> A variable (A) or its complement (A')
        </li>
        <li>
          <strong>Minterm:</strong> A product term (AND) containing all
          variables
        </li>
        <li>
          <strong>Maxterm:</strong> A sum term (OR) containing all variables
        </li>
      </ul>
    </div>
    <div className="key-insight">
      <h4>Standard Operators</h4>
      <ul>
        <li>
          <strong>AND (&, •):</strong> 1 only if all inputs are 1
        </li>
        <li>
          <strong>OR (|, +):</strong> 1 if at least one input is 1
        </li>
        <li>
          <strong>NOT (!, '):</strong> Inverts the input (0→1, 1→0)
        </li>
        <li>
          <strong>XOR (^):</strong> 1 if inputs are different
        </li>
      </ul>
    </div>
  </div>
);

const TRUTH_TABLES = [
  {
    id: "and",
    label: "AND",
    headers: ["A", "B", "A • B"],
    rows: [
      [0, 0, 0],
      [0, 1, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
    note: "Output is 1 only when every input is 1.",
  },
  {
    id: "or",
    label: "OR",
    headers: ["A", "B", "A + B"],
    rows: [
      [0, 0, 0],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    note: "Output is 1 when at least one input is 1.",
  },
  {
    id: "not",
    label: "NOT",
    headers: ["A", "A'"],
    rows: [
      [0, 1],
      [1, 0],
    ],
    note: "Output is the inverse of the input.",
  },
  {
    id: "xor",
    label: "XOR",
    headers: ["A", "B", "A ⊕ B"],
    rows: [
      [0, 0, 0],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 0],
    ],
    note: "Output is 1 only when the inputs are different.",
  },
];

const TruthTables = () => {
  const [selectedId, setSelectedId] = React.useState(null);
  const selected = TRUTH_TABLES.find((table) => table.id === selectedId);

  return (
    <div className="interactive-example">
      <h4>Pick an operator to see its truth table:</h4>
      <div className="example-buttons">
        {TRUTH_TABLES.map((table) => (
          <button
            key={table.id}
            type="button"
            className={`kmap-btn kmap-btn-secondary ba-truth-option ${table.id === selectedId ? "is-active" : ""}`}
            aria-pressed={table.id === selectedId}
            onClick={() =>
              setSelectedId((current) =>
                current === table.id ? null : table.id,
              )
            }
          >
            {table.label}
          </button>
        ))}
      </div>

      {selected && (
        <div className="ba-truth-table">
          <div className="binary-table-container">
            <table className="binary-table">
              <thead className="binary-table-header">
                <tr>
                  {selected.headers.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selected.rows.map((row, i) => (
                  <tr key={i} className="binary-table-row">
                    {row.map((c, j) => (
                      <td
                        key={j}
                        className={`binary-table-cell ${j === row.length - 1 && c === 1 ? "is-high" : ""}`}
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="explanation-intro">{selected.note}</p>
        </div>
      )}
    </div>
  );
};

const BooleanAlgebraOverview = () => (
  <BALayout
    title="Boolean Algebra"
    subtitle="Interactive Logic Explorer"
    intro="Boolean Algebra is a mathematical system developed by George Boole in 1854 that forms the foundation of digital logic and computer science. It deals with binary variables (0 and 1) and logical operations that model how digital circuits process information."
    highlights={[
      {
        title: "Binary Variables",
        text: "Every value is either 0 or 1 — false or true, off or on.",
      },
      {
        title: "Three Operations",
        text: "AND, OR, and NOT combine to express any logic function.",
      },
      {
        title: "Circuit Foundation",
        text: "Every gate, flip-flop, and processor is built from these rules.",
      },
    ]}
  >
    <section className="ba-section">
      <div className="ba-section-header">
        <h2 className="ba-section-title">What is Boolean Algebra?</h2>
      </div>
      <InfoCards />
    </section>

    <section className="ba-section">
      <div className="ba-section-header">
        <h2 className="ba-section-title">Truth Tables</h2>
      </div>
      <TruthTables />
    </section>

    <section className="ba-section">
      <div className="ba-section-header">
        <h2 className="ba-section-title">Why It Matters</h2>
      </div>
      <div className="comparison-grid">
        <div className="info-card">
          <h4>Digital Design</h4>
          <p className="explanation-intro">
            Every AND gate, OR gate, and flip-flop in your CPU implements a
            Boolean operation. Mastering these rules is mastering hardware
            design.
          </p>
        </div>
        <div className="info-card">
          <h4>Circuit Optimization</h4>
          <p className="explanation-intro">
            Boolean identities let designers reduce gate count, cut power
            consumption, and shorten propagation delays — saving millions of
            transistors at scale.
          </p>
        </div>
        <div className="info-card">
          <h4>Universal Language</h4>
          <p className="explanation-intro">
            From VHDL and Verilog to logic synthesis tools, Boolean algebra is
            the common language spoken by every layer of the digital stack.
          </p>
        </div>
      </div>
    </section>
  </BALayout>
);

export default BooleanAlgebraOverview;
