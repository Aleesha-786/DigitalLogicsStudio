import React, { useState } from "react";
import BALayout from "./BALayout";
import ControlPanel from "../../../shared/components/ControlPanel";
import ControlGroup from "../../../shared/components/ControlGroup";
import CircuitModal from "../../../shared/components/CircuitModal";
import { parseExpression } from "../../../shared/utils/boolExpr";

// The swap is done on the parsed tree, not on the text, so the original
// grouping survives: the dual of A + B•C is A • (B + C), not A • B + C.
const dualOf = (node) => {
  switch (node.type) {
    case "var":
      return node;
    case "const":
      return { type: "const", value: node.value ? 0 : 1 };
    case "not":
      return { type: "not", arg: dualOf(node.arg) };
    default:
      return {
        type: node.type === "and" ? "or" : "and",
        args: node.args.map(dualOf),
      };
  }
};

const formatExpression = (node) => {
  switch (node.type) {
    case "var":
      return node.name;
    case "const":
      return String(node.value);
    case "not": {
      const inner = formatExpression(node.arg);
      return node.arg.args ? `(${inner})'` : `${inner}'`;
    }
    case "and":
      return node.args
        .map((arg) =>
          arg.type === "or"
            ? `(${formatExpression(arg)})`
            : formatExpression(arg),
        )
        .join(" • ");
    default:
      return node.args.map(formatExpression).join(" + ");
  }
};

const DualityPrinciple = () => {
  const [expr, setExpr] = useState("F = A + B");
  const [open, setOpen] = useState(false);
  const parsed = parseExpression(expr);
  const dual = parsed.ok ? formatExpression(dualOf(parsed.ast)) : "—";

  return (
    <BALayout
      title="Duality Principle"
      subtitle="Swap operators and identity values"
      intro="The Duality Principle states that every Boolean expression has a dual, obtained by interchanging OR and AND operations, and interchanging 0s and 1s. If an identity is true, its dual is also true."
    >
      <section className="ba-section">
        <div className="ba-section-header">
          <h2 className="ba-section-title">
            Understanding the Duality Principle
          </h2>
        </div>
        <div className="info-card">
          <h4>Duality Rules:</h4>
          <ul>
            <li>Replace OR (+) with AND (•)</li>
            <li>Replace AND (•) with OR (+)</li>
            <li>Replace 1 with 0</li>
            <li>Replace 0 with 1</li>
            <li>Keep variables and complements unchanged</li>
          </ul>
        </div>
        <div className="example-box">
          <h4>Classic Examples:</h4>
          <ul>
            <li>
              <strong>Original:</strong> A + 1 = 1 → <strong>Dual:</strong> A •
              0 = 0
            </li>
            <li>
              <strong>Original:</strong> A + A' = 1 → <strong>Dual:</strong> A •
              A' = 0
            </li>
            <li>
              <strong>Original:</strong> A + (B • C) = (A + B) • (A + C) →{" "}
              <strong>Dual:</strong> A • (B + C) = (A • B) + (A • C)
            </li>
          </ul>
        </div>
        <div className="key-insight">
          <h4>Why Duality Matters:</h4>
          <p>
            Duality doubles the power of Boolean algebra. Once you prove an
            identity, you automatically know its dual is also true. This
            symmetry reduces the number of theorems you need to learn and prove.
          </p>
        </div>
      </section>

      <section className="ba-section">
        <div className="ba-section-header">
          <h2 className="ba-section-title">Interactive Dual Calculator</h2>
        </div>
        <ControlPanel>
          <ControlGroup label="Expression">
            <input
              type="text"
              className="control-input"
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
            />
          </ControlGroup>
        </ControlPanel>

        <div style={{ marginTop: "1rem" }}>
          <p className="explanation-intro">
            Original:{" "}
            <span className="highlight">
              {expr.replace(/^F\s*=\s*/, "").trim()}
            </span>
          </p>
          <p className="explanation-intro">
            Dual: <span className="highlight">{dual}</span>
          </p>
          {!parsed.ok && <p className="explanation-intro">{parsed.error}</p>}
          <div className="example-box">
            <h4>Verification:</h4>
            <p>
              Both expressions will have the same truth table structure, just
              with 0s and 1s swapped in the final output column.
            </p>
          </div>
        </div>

        <div className="interactive-example" style={{ marginTop: "1rem" }}>
          <h4>Try These Examples:</h4>
          <div className="example-buttons">
            <button
              className="kmap-btn kmap-btn-secondary"
              onClick={() => setExpr("F = A + 1")}
            >
              A + 1
            </button>
            <button
              className="kmap-btn kmap-btn-secondary"
              onClick={() => setExpr("F = A • B + C")}
            >
              A • B + C
            </button>
            <button
              className="kmap-btn kmap-btn-secondary"
              onClick={() => setExpr("F = (A + B) • (A' + C)")}
            >
              (A + B) • (A' + C)
            </button>
          </div>
        </div>

        <div className="kmap-card" style={{ marginTop: "1rem" }}>
          <button
            className="kmap-btn kmap-btn-primary kmap-btn-full"
            onClick={() => setOpen(true)}
          >
            🔌 Experiment with Circuit
          </button>
        </div>
      </section>

      <CircuitModal
        open={open}
        onClose={() => setOpen(false)}
        expression={expr}
        variables={parsed.ok ? parsed.variables : ["A", "B"]}
      />
    </BALayout>
  );
};

export default DualityPrinciple;
