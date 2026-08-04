import React, { useState } from "react";
import NSLayout from "./components/NSLayout";
import ControlPanel from "../../shared/components/ControlPanel";
import ControlGroup from "../../shared/components/ControlGroup";
import ResultCard from "features/number-systems/components/ResultCard";
import ExplanationBlock from "../../shared/components/ExplanationBlock";

const toBcdDigits = (value) => {
  if (!/^[0-9]+$/.test(value)) return null;
  return value.split("").map((d) => ({
    digit: d,
    bcd: parseInt(d, 10).toString(2).padStart(4, "0"),
  }));
};

export default function BCDNotation() {
  const [input, setInput] = useState("");
  const digits = input ? toBcdDigits(input) : null;

  return (
    <NSLayout
      title="BCD Notation"
      subtitle="Binary Coded Decimal representation of decimal digits"
      intro="In BCD each decimal digit is stored independently as a 4-bit binary group, preserving digit boundaries that pure binary would lose."
    >
      <ControlPanel>
        <ControlGroup label="Decimal number">
          <input
            type="text"
            className="control-input"
            value={input}
            onChange={(e) => {
              const val = e.target.value.trim();
              if (val === "" || /^[0-9]+$/.test(val)) setInput(val);
            }}
            placeholder="Enter a non‑negative integer, e.g. 4095"
          />
        </ControlGroup>
      </ControlPanel>

      {input && (
        <ResultCard title="BCD Conversion">
          <ExplanationBlock title="Per‑digit encoding">
            {digits ? (
              <>
                <p className="explanation-intro">
                  In BCD, each decimal digit is stored separately using{" "}
                  <span className="highlight">4 binary bits</span>.
                </p>
                <table className="binary-table">
                  <thead className="binary-table-header">
                    <tr>
                      <th>Decimal digit</th>
                      <th className="binary-table-cell-right">BCD (4‑bit)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {digits.map(({ digit, bcd }, idx) => (
                      <tr key={`${digit}-${idx}`} className="binary-table-row">
                        <td className="binary-table-cell">{digit}</td>
                        <td className="binary-table-cell binary-table-cell-right binary-table-cell-mono">
                          {bcd}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p className="explanation-intro">
                <span className="highlight">
                  BCD accepts only decimal digits 0–9.
                </span>{" "}
                Remove any sign, spaces, or non‑digit characters.
              </p>
            )}
          </ExplanationBlock>

          {digits && (
            <ExplanationBlock title="Combined BCD word">
              <p className="explanation-intro">
                Joining all digit blocks left‑to‑right gives the full BCD
                representation.
              </p>
              <p className="final-result">
                <strong>{input}</strong> → {digits.map((d) => d.bcd).join(" ")}
              </p>
              <p>
                Notice that BCD is different from the pure binary value of the
                number — it preserves the{" "}
                <span className="highlight">decimal digit boundaries</span>,
                making conversion back to decimal trivial.
              </p>
            </ExplanationBlock>
          )}
        </ResultCard>
      )}
    </NSLayout>
  );
}
