import React, { useState } from "react";
import BALayout from "./BALayout";
import CircuitModal from "../../../shared/components/CircuitModal";

const laws = [
  {
    name: "Commutative",
    example: "A + B = B + A; AB = BA",
    explanation: "Order of operands doesn't affect result",
    application: "Useful for rearranging terms to match patterns",
  },
  {
    name: "Associative",
    example: "A + (B + C) = (A + B) + C",
    explanation: "Grouping of operands doesn't affect result",
    application: "Allows flexible grouping in complex expressions",
  },
  {
    name: "Distributive",
    example: "A(B + C) = AB + AC",
    explanation: "AND distributes over OR",
    application: "Key for converting between SOP and POS forms",
  },
  {
    name: "Identity",
    example: "A + 0 = A; A1 = A",
    explanation: "0 is identity for OR, 1 for AND",
    application: "Used for circuit initialization and reset",
  },
  {
    name: "Complement",
    example: "A + A' = 1; AA' = 0",
    explanation: "Variable and its complement cover all cases",
    application: "Fundamental for logic simplification",
  },
  {
    name: "Absorption",
    example: "A + AB = A; A(A + B) = A",
    explanation: "A absorbs redundant combinations",
    application: "Powerful for reducing term count",
    proof: [
      {
        title: "A + AB = A",
        steps: [
          { expr: "A + AB", reason: "Start" },
          { expr: "= A·1 + AB", reason: "Identity: A = A·1" },
          { expr: "= A(1 + B)", reason: "Distributive: factor out A" },
          { expr: "= A·1", reason: "Domination: 1 + B = 1" },
          { expr: "= A", reason: "Identity: A·1 = A" },
        ],
      },
      {
        title: "A(A + B) = A",
        steps: [
          { expr: "A(A + B)", reason: "Start" },
          { expr: "= AA + AB", reason: "Distributive: multiply out" },
          { expr: "= A + AB", reason: "Idempotent: AA = A" },
          { expr: "= A", reason: "First form: A + AB = A" },
        ],
      },
    ],
  },
  {
    name: "De Morgan",
    example: "(AB)' = A' + B'; (A + B)' = A'B'",
    explanation: "Complement of product equals sum of complements",
    application: "Essential for NAND/NOR gate implementations",
    proof: [
      {
        title: "(AB)' = A' + B'",
        idea: "X' is the only value with X + X' = 1 and X·X' = 0, so show A' + B' does both for AB.",
        steps: [
          { expr: "AB + (A' + B')", reason: "OR them: must equal 1" },
          {
            expr: "= (A + A' + B')(B + A' + B')",
            reason: "Distributive: X + YZ = (X + Y)(X + Z)",
          },
          { expr: "= (1 + B')(1 + A')", reason: "Complement: A + A' = 1" },
          { expr: "= 1·1 = 1", reason: "Domination: 1 + X = 1" },
          { expr: "AB·(A' + B')", reason: "AND them: must equal 0" },
          { expr: "= ABA' + ABB'", reason: "Distributive: multiply out" },
          { expr: "= 0·B + A·0", reason: "Complement: AA' = 0" },
          { expr: "= 0", reason: "Domination: 0·X = 0" },
        ],
        conclusion: "Both checks pass, so A' + B' is the complement of AB.",
      },
      {
        title: "(A + B)' = A'B'",
        idea: "Same method: show A'B' is the complement of A + B.",
        steps: [
          { expr: "(A + B) + A'B'", reason: "OR them: must equal 1" },
          {
            expr: "= (A + B + A')(A + B + B')",
            reason: "Distributive: X + YZ = (X + Y)(X + Z)",
          },
          { expr: "= (1 + B)(A + 1)", reason: "Complement: A + A' = 1" },
          { expr: "= 1·1 = 1", reason: "Domination: 1 + X = 1" },
          { expr: "(A + B)·A'B'", reason: "AND them: must equal 0" },
          { expr: "= AA'B' + BA'B'", reason: "Distributive: multiply out" },
          { expr: "= 0·B' + 0·A'", reason: "Complement: AA' = 0" },
          { expr: "= 0", reason: "Domination: 0·X = 0" },
        ],
        conclusion: "Both checks pass, so A'B' is the complement of A + B.",
      },
    ],
  },
];

const LawProof = ({ proof }) => (
  <div className="law-proof" onClick={(e) => e.stopPropagation()}>
    {proof.map((part) => (
      <div key={part.title} className="law-proof-part">
        <h5 className="law-proof-title">Proof: {part.title}</h5>
        {part.idea && <p className="law-proof-note">{part.idea}</p>}
        <ol className="law-proof-steps">
          {part.steps.map((step, i) => (
            <li key={i} className="law-proof-step">
              <span className="law-proof-expr">{step.expr}</span>
              <span className="law-proof-reason">{step.reason}</span>
            </li>
          ))}
        </ol>
        {part.conclusion && (
          <p className="law-proof-note">
            <strong>{part.conclusion}</strong>
          </p>
        )}
      </div>
    ))}
  </div>
);

const LawCard = ({ law }) => {
  const [showProof, setShowProof] = useState(false);

  if (!law.proof) {
    return (
      <div className="law-card">
        <h4 className="law-name">{law.name}</h4>
        <p className="law-example">
          <strong>Example:</strong> {law.example}
        </p>
        <p className="law-explanation">{law.explanation}</p>
        <p className="law-application">
          <strong>Application:</strong> {law.application}
        </p>
      </div>
    );
  }

  const toggle = () => setShowProof((v) => !v);

  return (
    <div
      className={`law-card law-card-clickable ${showProof ? "is-open" : ""}`}
      role="button"
      tabIndex={0}
      aria-expanded={showProof}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
    >
      <h4 className="law-name">{law.name}</h4>
      <p className="law-example">
        <strong>Example:</strong> {law.example}
      </p>
      <p className="law-explanation">{law.explanation}</p>
      <p className="law-application">
        <strong>Application:</strong> {law.application}
      </p>
      <p className="law-proof-hint">
        {showProof ? "Click to hide proof" : "Click to see the proof"}
      </p>
      {showProof && <LawProof proof={law.proof} />}
    </div>
  );
};

const BooleanLaws = () => {
  const [open, setOpen] = useState(false);

  return (
    <BALayout
      title="Boolean Algebraic Laws"
      subtitle="Core properties with examples and applications"
      intro="Boolean algebraic laws are fundamental rules that govern how Boolean expressions can be manipulated. They are the foundation for digital circuit design, optimization, and implementation."
    >
      <section className="ba-section">
        <div className="ba-section-header">
          <h2 className="ba-section-title">Understanding Boolean Laws</h2>
        </div>
        <div className="info-card">
          <h4>Why These Laws Matter:</h4>
          <ul>
            <li>
              <strong>Circuit Minimization:</strong> Reduce gate count and
              complexity
            </li>
            <li>
              <strong>Power Optimization:</strong> Lower power consumption in
              digital systems
            </li>
            <li>
              <strong>Speed Enhancement:</strong> Reduce propagation delays
            </li>
            <li>
              <strong>Cost Reduction:</strong> Minimize silicon area and
              manufacturing costs
            </li>
            <li>
              <strong>Design Verification:</strong> Prove circuit equivalence
            </li>
          </ul>
        </div>
      </section>

      <section className="ba-section">
        <div className="ba-section-header">
          <h2 className="ba-section-title">Fundamental Laws</h2>
        </div>
        <div className="laws-grid">
          {laws.map((l) => (
            <LawCard key={l.name} law={l} />
          ))}
        </div>
      </section>

      <section className="ba-section">
        <div className="ba-section-header">
          <h2 className="ba-section-title">
            Practical Example: Circuit Optimization
          </h2>
        </div>
        <div className="example-box">
          <h4>Problem: Simplify F = AB + AB' + A'B</h4>
          <p>
            <strong>Step 1:</strong> Apply distributive law to first two terms:
            A(B + B') = A(1) = A
          </p>
          <p>
            <strong>Step 2:</strong> Expression becomes: F = A + A'B
          </p>
          <p>
            <strong>Step 3:</strong> Apply absorption: A + A'B = A + B
          </p>
          <p>
            <strong>Result:</strong> Reduced from 3 terms with 6 literals to 2
            terms with 2 literals!
          </p>
          <p>
            <strong>Impact:</strong> 67% reduction in gate count and complexity.
          </p>
        </div>

        <div className="interactive-example">
          <h4>Try It Yourself:</h4>
          <p>Can you simplify: F = A + AB + A'B'?</p>
          <details>
            <summary>Show Solution</summary>
            <p>
              <strong>Solution:</strong> F = A + B'
            </p>
            <p>
              <strong>Steps:</strong> A + AB = A (absorption), so F = A + A'B' =
              A + B' (by consensus theorem)
            </p>
          </details>
        </div>

        <div className="kmap-card">
          <button
            className="kmap-btn kmap-btn-primary kmap-btn-full"
            onClick={() => setOpen(true)}
          >
            🔌 Visualize Circuit Example
          </button>
        </div>
      </section>

      <CircuitModal
        open={open}
        onClose={() => setOpen(false)}
        expression={"F = AB + AC"}
        variables={["A", "B", "C"]}
      />
    </BALayout>
  );
};

export default BooleanLaws;
