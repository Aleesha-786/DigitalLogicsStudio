import React, { useState, useMemo } from "react";
import BALayout from "./BALayout";
import ControlPanel from "../../../shared/components/ControlPanel";
import ControlGroup from "../../../shared/components/ControlGroup";
import CircuitModal from "../../../shared/components/CircuitModal";
import { evaluate, parseExpression } from "../../../shared/utils/boolExpr";

const DEFAULT_VARIABLES = ["X", "Y", "Z"];

// A product term as { A: true, C: false } (variable → appears uncomplemented),
// or null when the node is anything other than a plain product of literals.
const toProduct = (node) => {
  const product = {};
  for (const literal of node.type === "and" ? node.args : [node]) {
    const variable = literal.type === "not" ? literal.arg : literal;
    const positive = literal.type !== "not";
    if (variable.type !== "var") return null;
    if (variable.name in product && product[variable.name] !== positive) {
      return null;
    }
    product[variable.name] = positive;
  }
  return product;
};

const formatProduct = (product) =>
  Object.keys(product)
    .map((name) => (product[name] ? name : `${name}'`))
    .join("") || "1";

const formatSop = (terms) => terms.map(formatProduct).join(" + ");

const countLiterals = (terms) =>
  terms.reduce((total, term) => total + Object.keys(term).length, 0);

// Looks for two terms that disagree on exactly one variable, plus a third term
// their consensus makes redundant (it holds every literal of the consensus).
const findConsensus = (terms) => {
  for (let i = 0; i < terms.length; i += 1) {
    for (let j = i + 1; j < terms.length; j += 1) {
      const opposing = Object.keys(terms[i]).filter(
        (name) => name in terms[j] && terms[j][name] !== terms[i][name],
      );
      if (opposing.length !== 1) continue;

      const merged = { ...terms[i], ...terms[j] };
      delete merged[opposing[0]];
      const consensus = Object.fromEntries(
        Object.keys(merged)
          .sort()
          .map((name) => [name, merged[name]]),
      );
      const redundant = terms.findIndex(
        (term, k) =>
          k !== i &&
          k !== j &&
          Object.keys(consensus).every(
            (name) => term[name] === consensus[name],
          ),
      );
      if (redundant !== -1) {
        return {
          pair: [terms[i], terms[j]],
          variable: opposing[0],
          consensus,
          redundant,
        };
      }
    }
  }
  return null;
};

const buildTruthTable = (variables, ast) => {
  const rows = [];
  for (let i = 0; i < 2 ** variables.length; i += 1) {
    const assignment = {};
    variables.forEach((name, bit) => {
      assignment[name] = (i >> (variables.length - 1 - bit)) & 1;
    });
    rows.push([
      ...variables.map((name) => assignment[name]),
      evaluate(ast, assignment),
    ]);
  }
  return { headers: [...variables, "F"], rows };
};

const analyse = (expr) => {
  const parsed = parseExpression(expr);
  if (!parsed.ok) return { error: parsed.error };

  const { ast, variables } = parsed;
  const products = (ast.type === "or" ? ast.args : [ast]).map(toProduct);
  const terms = products.every(Boolean) ? products : null;
  return {
    variables,
    terms,
    match: terms ? findConsensus(terms) : null,
    tt: buildTruthTable(variables, ast),
  };
};

const ConsensusTheorem = () => {
  const [expr, setExpr] = useState("F = XY + X'Z + YZ");
  const [open, setOpen] = useState(false);
  const [showSimplified, setShowSimplified] = useState(false);
  const { error, variables, terms, match, tt } = useMemo(
    () => analyse(expr),
    [expr],
  );
  const simplified = match
    ? terms.filter((_, index) => index !== match.redundant)
    : null;

  return (
    <BALayout
      title="Consensus Theorem"
      subtitle="XY + X'Z + YZ = XY + X'Z"
      intro="The Consensus Theorem is a powerful Boolean algebra identity that allows elimination of redundant terms. In an expression of the form XY + X'Z + YZ, the consensus term YZ is redundant and can be removed without changing the function's behavior."
    >
      <section className="ba-section">
        <div className="ba-section-header">
          <h2 className="ba-section-title">
            Understanding the Consensus Theorem
          </h2>
        </div>
        <div className="info-card">
          <h4>The Theorem:</h4>
          <p>
            <strong>XY + X'Z + YZ = XY + X'Z</strong>
          </p>
          <p>Where YZ is the "consensus term" that can be eliminated.</p>
        </div>
        <div className="example-box">
          <h4>Why It Works:</h4>
          <p>The consensus term YZ is covered by the other two terms:</p>
          <ul>
            <li>When X=1: XY covers all cases where Y=1 (including YZ)</li>
            <li>When X=0: X'Z covers all cases where Z=1 (including YZ)</li>
            <li>Therefore, YZ is always covered by either XY or X'Z</li>
          </ul>
        </div>
        <div className="key-insight">
          <h4>Practical Impact:</h4>
          <p>
            This theorem is extremely valuable for circuit optimization.
            Removing the consensus term reduces gate count, power consumption,
            and propagation delay while maintaining identical functionality.
          </p>
        </div>
      </section>

      <section className="ba-section">
        <div className="ba-section-header">
          <h2 className="ba-section-title">Interactive Consensus Checker</h2>
        </div>
        <ControlPanel>
          <ControlGroup label="Expression (SOP)">
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
            Applies:{" "}
            <span className="highlight">
              {error ? "—" : match ? "Yes" : "No"}
            </span>
          </p>
          {error && <p className="explanation-intro">{error}</p>}
          <div className="info-card">
            <h4>Pattern Recognition:</h4>
            <p>The consensus theorem applies when you have:</p>
            <ul>
              <li>
                Two terms where a variable appears in true form in one term and
                complemented in another
              </li>
              <li>
                A third term that contains all the literals from both terms
                except the complementary variable
              </li>
            </ul>
            <p>
              <strong>Example Pattern:</strong> XY + X'Z + YZ
            </p>
          </div>
        </div>

        {!error && (
          <div className="example-box" style={{ marginTop: "1rem" }}>
            {match ? (
              <>
                <h4>Your expression: F = {formatSop(terms)}</h4>
                <p>
                  <strong>Step 1:</strong> Identify:{" "}
                  {formatProduct(match.pair[0])} and{" "}
                  {formatProduct(match.pair[1])} disagree only on{" "}
                  {match.variable}, so their consensus term is{" "}
                  {formatProduct(match.consensus)}
                </p>
                <p>
                  <strong>Step 2:</strong> Apply: F = {formatSop(simplified)} (
                  {formatProduct(terms[match.redundant])} term eliminated)
                </p>
                <p>
                  <strong>Result:</strong> {terms.length} → {simplified.length}{" "}
                  terms and {countLiterals(terms)} → {countLiterals(simplified)}{" "}
                  literals
                </p>
              </>
            ) : terms ? (
              <>
                <h4>Your expression: F = {formatSop(terms)}</h4>
                <p>
                  No two terms have a consensus term that also appears in the
                  expression, so nothing can be eliminated.
                </p>
              </>
            ) : (
              <p>
                Write the expression as a sum of products, such as XY + X'Z +
                YZ.
              </p>
            )}
          </div>
        )}

        <div className="interactive-example" style={{ marginTop: "1rem" }}>
          <h4>Try These Examples:</h4>
          <div className="example-buttons">
            <button
              className="kmap-btn kmap-btn-secondary"
              onClick={() => setExpr("F = AB + A'C + BC")}
            >
              AB + A'C + BC
            </button>
            <button
              className="kmap-btn kmap-btn-secondary"
              onClick={() => setExpr("F = XY + X'Z + YZ")}
            >
              XY + X'Z + YZ
            </button>
            <button
              className="kmap-btn kmap-btn-secondary"
              onClick={() => setExpr("F = A'B + AC + BC")}
            >
              A'B + AC + BC
            </button>
          </div>
        </div>
      </section>

      <section className="ba-section">
        <div className="ba-section-header">
          <h2 className="ba-section-title">Truth Table</h2>
        </div>
        {tt ? (
          <div className="binary-table-container">
            <table className="binary-table">
              <thead className="binary-table-header">
                <tr>
                  {tt.headers.map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tt.rows.map((row, i) => (
                  <tr key={i} className="binary-table-row">
                    {row.map((c, j) => (
                      <td key={j} className="binary-table-cell">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="explanation-intro">
            Enter a valid expression above to see its truth table.
          </p>
        )}
      </section>

      <section className="ba-section">
        <div className="ba-section-header">
          <h2 className="ba-section-title">Advanced Applications</h2>
        </div>
        <div className="info-card">
          <h4>Multiple Consensus Terms:</h4>
          <p>
            Complex expressions may have multiple consensus terms that can be
            eliminated sequentially.
          </p>
          <p>
            <strong>Example:</strong> F = AB + A'C + BC + B'D + AD
          </p>
          <ul>
            <li>First consensus: AB + A'C + BC → AB + A'C</li>
            <li>Second consensus: B'D + AD + AB → B'D + AD</li>
            <li>Final: F = AB + A'C + B'D + AD</li>
          </ul>
        </div>
        <div className="key-insight">
          <h4>Integration with Karnaugh Maps:</h4>
          <p>
            The consensus theorem corresponds to eliminating redundant groups in
            Karnaugh maps. When a group of 1's is completely covered by other
            groups, it can be removed without affecting the function.
          </p>
        </div>
        <div className="kmap-card" style={{ marginTop: "1rem" }}>
          <div className="ba-actions">
            <button
              className="kmap-btn kmap-btn-primary"
              onClick={() => {
                setShowSimplified(false);
                setOpen(true);
              }}
            >
              🔌 Original circuit
            </button>
            <button
              className="kmap-btn kmap-btn-primary"
              disabled={!simplified}
              title={
                simplified
                  ? undefined
                  : "No consensus term found in this expression"
              }
              onClick={() => {
                setShowSimplified(true);
                setOpen(true);
              }}
            >
              🔌 Simplified circuit
            </button>
          </div>
        </div>
      </section>

      <CircuitModal
        open={open}
        onClose={() => setOpen(false)}
        expression={
          showSimplified && simplified ? formatSop(simplified) : expr
        }
        variables={variables || DEFAULT_VARIABLES}
      />
    </BALayout>
  );
};

export default ConsensusTheorem;
