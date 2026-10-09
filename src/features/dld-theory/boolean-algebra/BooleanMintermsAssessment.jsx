import React, { useEffect, useMemo, useState } from "react";
import BALayout from "./BALayout";
import Tex from "../../../shared/components/Tex";
import { toTex } from "../../../shared/utils/boolExpr";
import { useLessonCompletion } from "../../../shared/components/topics/lessonCompletion";
import {
  MINTERM_ROUNDS,
  formatIndexes,
  gradeSelection,
  gradeTable,
  productOfMaxtermsTex,
  sumOfMintermsTex,
} from "./components/mintermsAssessment";

// Toggle a row index in or out of a selection, keeping the list sorted.
const toggleIndex = (list, index) =>
  list.includes(index)
    ? list.filter((i) => i !== index)
    : [...list, index].sort((a, b) => a - b);

const TermPicker = ({ label, prefix, count, selected, onToggle, result, locked }) => (
  <div className="mm-picker">
    <h3 className="mm-picker-title">{label}</h3>
    <div className="mm-chip-row" role="group" aria-label={label}>
      {Array.from({ length: count }, (_, index) => {
        const isOn = selected.includes(index);
        const state =
          result && (result.missing.includes(index) || result.extra.includes(index))
            ? "bad"
            : result && result.correct && isOn
              ? "good"
              : "";
        return (
          <button
            key={index}
            type="button"
            className={`mm-chip ${isOn ? "is-on" : ""} ${state}`}
            aria-pressed={isOn}
            disabled={locked}
            onClick={() => onToggle(index)}
          >
            {prefix}
            <sub>{index}</sub>
          </button>
        );
      })}
    </div>
  </div>
);

const feedback = (name, result) => {
  if (!result) return null;
  if (result.correct) return `${name}: correct`;
  const parts = [];
  if (result.missing.length) parts.push(`${result.missing.length} missing`);
  if (result.extra.length) parts.push(`${result.extra.length} that don't belong`);
  return `${name}: ${parts.join(" and ")}`;
};

// One round: fill in the truth table, then name the minterms and maxterms.
const Round = ({ round, number, passed, onPassed }) => {
  const [problemIndex, setProblemIndex] = useState(0);
  const problem = round.problems[problemIndex];

  const [answers, setAnswers] = useState({});
  const [tableChecked, setTableChecked] = useState(false);
  const [minterms, setMinterms] = useState([]);
  const [maxterms, setMaxterms] = useState([]);
  const [termsChecked, setTermsChecked] = useState(false);

  const table = useMemo(() => gradeTable(problem, answers), [problem, answers]);
  const tableDone = tableChecked && table.allCorrect;

  const minResult = termsChecked ? gradeSelection(problem.minterms, minterms) : null;
  const maxResult = termsChecked ? gradeSelection(problem.maxterms, maxterms) : null;
  const solved = Boolean(minResult?.correct && maxResult?.correct);

  // Passing is derived from what is on screen, so the "Round complete" card and
  // the recorded result can never disagree.
  useEffect(() => {
    if (solved) onPassed();
    // onPassed is recreated every render; it ignores repeats by round id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved]);

  const reset = (nextIndex) => {
    setProblemIndex(nextIndex);
    setAnswers({});
    setTableChecked(false);
    setMinterms([]);
    setMaxterms([]);
    setTermsChecked(false);
  };

  const answer = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
    setTableChecked(false);
  };

  const checkTable = () => setTableChecked(true);

  const checkTerms = () => setTermsChecked(true);

  const rowCount = problem.rows.length;

  return (
    <section className="ba-section">
      <div className="ba-section-header">
        <h2 className="ba-section-title">
          Round {number}: {round.title}
        </h2>
        <span className="ba-badge">
          {passed && "✓ Passed · "}
          Expression {problemIndex + 1} of {round.problems.length}
        </span>
      </div>

      <div className="info-card mm-given">
        <p className="mm-given-label">Given</p>
        <p className="mm-given-expression">
          <Tex>{`F = ${toTex(problem.ast)}`}</Tex>
        </p>
      </div>

      {/* ── Step 1: the truth table ─────────────────────────────────── */}
      <h3 className="mm-step-title">Step 1 · Fill in the truth table</h3>
      <p className="assess-part-intro">
        For each row, choose the value of F: 0 or 1.
      </p>
      <div className="binary-table-container">
        <table className="binary-table mm-table">
          <thead className="binary-table-header">
            <tr>
              <th>Row</th>
              {problem.variables.map((name) => (
                <th key={name}>{name}</th>
              ))}
              <th>F</th>
            </tr>
          </thead>
          <tbody>
            {problem.rows.map((row) => {
              const status = tableChecked ? table.rows[row.index] : "";
              const chosen = answers[row.index];
              return (
                <tr
                  key={row.index}
                  className={`binary-table-row mm-row ${status ? `is-${status}` : ""}`}
                >
                  <td className="binary-table-cell">{row.index}</td>
                  {row.bits.map((bit, b) => (
                    <td key={b} className="binary-table-cell">
                      {bit}
                    </td>
                  ))}
                  <td className="binary-table-cell">
                    <div
                      className="mm-toggle"
                      role="radiogroup"
                      aria-label={`F for row ${row.index}`}
                    >
                      {[0, 1].map((value) => (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={chosen === value}
                          disabled={tableDone}
                          className={`mm-toggle-btn ${chosen === value ? "is-on" : ""}`}
                          onClick={() => answer(row.index, value)}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mm-actions">
        {!tableDone && (
          <button
            type="button"
            className="kmap-btn kmap-btn-primary"
            onClick={checkTable}
          >
            Check truth table
          </button>
        )}
        <button
          type="button"
          className="kmap-btn kmap-btn-secondary"
          onClick={() => reset((problemIndex + 1) % round.problems.length)}
        >
          Try a different expression
        </button>
      </div>

      {tableChecked && (
        <p
          className={`mm-message ${table.allCorrect ? "is-good" : "is-bad"}`}
          role="status"
        >
          {table.allCorrect
            ? `✓ All ${rowCount} rows are correct.`
            : [
                table.wrong > 0 &&
                  `${table.wrong} row${table.wrong === 1 ? " is" : "s are"} wrong`,
                table.empty > 0 &&
                  `${table.empty} row${table.empty === 1 ? " is" : "s are"} not answered yet`,
              ]
                .filter(Boolean)
                .join(" and ") + ". Fix the highlighted rows and check again."}
        </p>
      )}

      {/* ── Step 2: minterms and maxterms ───────────────────────────── */}
      {tableDone && (
        <>
          <h3 className="mm-step-title">Step 2 · Minterms and maxterms</h3>
          <p className="assess-part-intro">
            Select every row that is a <strong>minterm</strong> (F = 1) and
            every row that is a <strong>maxterm</strong> (F = 0). Rows are
            numbered as in the table.
          </p>
          <div className="mm-pickers">
            <TermPicker
              label="Sum of minterms  Σm"
              prefix="m"
              count={rowCount}
              selected={minterms}
              onToggle={(i) => {
                setMinterms((prev) => toggleIndex(prev, i));
                setTermsChecked(false);
              }}
              result={minResult}
              locked={solved}
            />
            <TermPicker
              label="Product of maxterms  ΠM"
              prefix="M"
              count={rowCount}
              selected={maxterms}
              onToggle={(i) => {
                setMaxterms((prev) => toggleIndex(prev, i));
                setTermsChecked(false);
              }}
              result={maxResult}
              locked={solved}
            />
          </div>

          {!solved && (
            <div className="mm-actions">
              <button
                type="button"
                className="kmap-btn kmap-btn-primary"
                onClick={checkTerms}
              >
                Check answer
              </button>
            </div>
          )}

          {termsChecked && !solved && (
            <p className="mm-message is-bad" role="status">
              {[feedback("Minterms", minResult), feedback("Maxterms", maxResult)]
                .filter(Boolean)
                .join(" · ")}
              . The wrong chips are outlined in red.
            </p>
          )}

          {solved && (
            <div className="info-card mm-solution" role="status">
              <h3 className="mm-solved-title">✓ Round {number} complete</h3>
              <p>
                <Tex>{`F = \\Sigma m(${formatIndexes(problem.minterms)})`}</Tex>
              </p>
              <p>
                <Tex>
                  {`F = ${sumOfMintermsTex(problem, problem.minterms)}`}
                </Tex>
              </p>
              <p>
                <Tex>{`F = \\Pi M(${formatIndexes(problem.maxterms)})`}</Tex>
              </p>
              <p>
                <Tex>
                  {`F = ${productOfMaxtermsTex(problem, problem.maxterms)}`}
                </Tex>
              </p>
              <button
                type="button"
                className="kmap-btn kmap-btn-secondary"
                onClick={() => reset((problemIndex + 1) % round.problems.length)}
              >
                Practice another expression
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

// Rendered inside BALayout so it can reach the shell's completion state.
const MintermsAssessment = () => {
  const { isComplete, markComplete } = useLessonCompletion();
  // Ids of the rounds passed on this visit; all of them complete the page.
  const [passed, setPassed] = useState([]);

  const handlePassed = (id) => {
    if (passed.includes(id)) return;
    const next = [...passed, id];
    setPassed(next);
    if (next.length === MINTERM_ROUNDS.length) markComplete();
  };

  return (
    <>
      <section className="ba-section">
        <div className="ba-section-header">
          <h2 className="ba-section-title">How This Assessment Works</h2>
        </div>
        <div className="info-card">
          <ul>
            <li>
              Each round gives you a Boolean expression. First complete its{" "}
              <strong>truth table</strong> by choosing 0 or 1 for F in every row.
            </li>
            <li>
              Once the table is right, pick the rows that are{" "}
              <strong>minterms</strong> (F = 1) and the rows that are{" "}
              <strong>maxterms</strong> (F = 0).
            </li>
            <li>
              When both are correct, you see the function written as a{" "}
              <strong>sum of minterms</strong> and a{" "}
              <strong>product of maxterms</strong>.
            </li>
            <li>
              Pass all three rounds, in any order, to complete the assessment.
            </li>
          </ul>
        </div>
        <p className="assess-syntax" role="status">
          {isComplete && passed.length === 0
            ? "You have already completed this assessment. Keep practicing as much as you like — your completion is saved."
            : `${passed.length} of ${MINTERM_ROUNDS.length} rounds passed.`}
        </p>
      </section>

      {MINTERM_ROUNDS.map((round, index) => (
        <Round
          key={round.id}
          round={round}
          number={index + 1}
          passed={passed.includes(round.id)}
          onPassed={() => handlePassed(round.id)}
        />
      ))}
    </>
  );
};

const BooleanMintermsAssessment = () => (
  <BALayout
    title="Minterms & Maxterms Assessment"
    subtitle="From an expression to its truth table, minterms and maxterms"
    intro="Three rounds of practice: build the truth table of a Boolean expression, then read off its minterms and maxterms and see the function written as a sum of minterms and a product of maxterms."
  >
    <MintermsAssessment />
  </BALayout>
);

export default BooleanMintermsAssessment;
