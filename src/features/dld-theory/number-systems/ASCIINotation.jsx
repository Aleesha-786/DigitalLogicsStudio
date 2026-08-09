import React, { useState } from "react";
import NSLayout from "./components/NSLayout";
import ControlPanel from "../../../shared/components/ControlPanel";
import ControlGroup from "../../../shared/components/ControlGroup";
import ResultCard from "./components/ResultCard";
import ExplanationBlock from "../../../shared/components/ExplanationBlock";

const toAsciiRows = (text) => {
  const rows = [];
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const code = ch.charCodeAt(0);
    if (code < 0 || code > 127) {
      rows.push({
        char: ch,
        code,
        hex: "N/A",
        binary: "N/A",
        note: "Non‑ASCII character",
      });
    } else {
      rows.push({
        char: ch === " " ? "␣" : ch,
        code,
        hex: code.toString(16).toUpperCase().padStart(2, "0"),
        binary: code.toString(2).padStart(8, "0"),
        note: "",
      });
    }
  }
  return rows;
};

const ASCII_CONTROL_NAMES = [
  ["NUL", "Null"],
  ["SOH", "Start of heading"],
  ["STX", "Start of text"],
  ["ETX", "End of text"],
  ["EOT", "End of transmission"],
  ["ENQ", "Enquiry"],
  ["ACK", "Acknowledge"],
  ["BEL", "Bell"],
  ["BS", "Backspace"],
  ["HT", "Horizontal tab"],
  ["LF", "Line feed"],
  ["VT", "Vertical tab"],
  ["FF", "Form feed"],
  ["CR", "Carriage return"],
  ["SO", "Shift out"],
  ["SI", "Shift in"],
  ["DLE", "Data link escape"],
  ["DC1", "Device control 1"],
  ["DC2", "Device control 2"],
  ["DC3", "Device control 3"],
  ["DC4", "Device control 4"],
  ["NAK", "Negative acknowledge"],
  ["SYN", "Synchronous idle"],
  ["ETB", "End transmission block"],
  ["CAN", "Cancel"],
  ["EM", "End of medium"],
  ["SUB", "Substitute"],
  ["ESC", "Escape"],
  ["FS", "File separator"],
  ["GS", "Group separator"],
  ["RS", "Record separator"],
  ["US", "Unit separator"],
];

const getAsciiGroup = (code) => {
  if (code <= 31 || code === 127) return "Control codes";
  if (code >= 48 && code <= 57) return "Digits";
  if (code >= 65 && code <= 90) return "Uppercase letters";
  if (code >= 97 && code <= 122) return "Lowercase letters";
  return "Punctuation and symbols";
};

const getAsciiLabel = (code) => {
  if (code <= 31) return ASCII_CONTROL_NAMES[code][0];
  if (code === 32) return "Space";
  if (code === 127) return "DEL";
  return String.fromCharCode(code);
};

const getAsciiDescription = (code) => {
  if (code <= 31) return ASCII_CONTROL_NAMES[code][1];
  if (code === 32) return "Blank space";
  if (code === 127) return "Delete";
  if (code >= 48 && code <= 57) return "Decimal digit";
  if (code >= 65 && code <= 90) return "Capital letter";
  if (code >= 97 && code <= 122) return "Small letter";
  return "Printable symbol";
};

const STANDARD_ASCII_ROWS = Array.from({ length: 128 }, (_, code) => ({
  code,
  group: getAsciiGroup(code),
  char: getAsciiLabel(code),
  hex: code.toString(16).toUpperCase().padStart(2, "0"),
  binary: code.toString(2).padStart(7, "0"),
  description: getAsciiDescription(code),
}));

const ASCII_GROUP_ORDER = [
  "Control codes",
  "Punctuation and symbols",
  "Digits",
  "Uppercase letters",
  "Lowercase letters",
];

export default function ASCIINotation() {
  const [input, setInput] = useState("");
  const [activeGroup, setActiveGroup] = useState("All");
  const rows = input ? toAsciiRows(input) : [];
  const visibleAsciiRows =
    activeGroup === "All"
      ? STANDARD_ASCII_ROWS
      : STANDARD_ASCII_ROWS.filter((row) => row.group === activeGroup);

  return (
    <NSLayout
      title="ASCII Notation"
      subtitle="See decimal, hex, and binary codes for characters"
      intro="ASCII assigns each printable and control character a unique 7-bit integer code. Type anything below to see its full breakdown."
    >
      <ControlPanel>
        <ControlGroup label="Text">
          <textarea
            className="control-input"
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a word or phrase, e.g. Bool"
          />
        </ControlGroup>
      </ControlPanel>

      {input && (
        <ResultCard title="Character Codes">
          <ExplanationBlock title="Per‑character breakdown">
            <ExplanationBlock>
              <p className="explanation-intro">
                ASCII assigns each character a unique{" "}
                <span className="highlight">7‑bit integer code</span>, usually
                shown in decimal, hexadecimal, or binary.
              </p>
              <table className="binary-table">
                <thead className="binary-table-header">
                  <tr>
                    <th>Char</th>
                    <th>Decimal</th>
                    <th>Hex</th>
                    <th className="binary-table-cell-right">Binary (8‑bit)</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={`${row.char}-${idx}`} className="binary-table-row">
                      <td className="binary-table-cell">{row.char}</td>
                      <td className="binary-table-cell">{row.code}</td>
                      <td className="binary-table-cell">0x{row.hex}</td>
                      <td className="binary-table-cell binary-table-cell-right binary-table-cell-mono">
                        {row.binary}
                      </td>
                      <td className="binary-table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ExplanationBlock>
          </ExplanationBlock>

          <ExplanationBlock title="Why 7 bits?">
            <p>
              Classic ASCII uses values from 0–127 (2⁷ − 1), fitting neatly into
              7 bits. In practice it is stored in 8‑bit bytes, leaving one bit
              unused or used for extended character sets.
            </p>
          </ExplanationBlock>
        </ResultCard>
      )}

      <section className="binary-card ascii-reference-card">
        <h2 className="binary-section-title binary-title-secondary">
          <span className="binary-dot binary-dot-secondary"></span>
          Standard ASCII Table
        </h2>

        <div className="binary-info-box binary-info-secondary">
          <h3 className="binary-info-heading">7-bit ASCII reference</h3>
          <p className="binary-text">
            Standard ASCII covers decimal codes 0 through 127. The first 32
            entries and code 127 are control codes; codes 32 through 126 are
            printable characters.
          </p>

          <div className="ascii-filter-row" aria-label="ASCII table filters">
            {["All", ...ASCII_GROUP_ORDER].map((group) => (
              <button
                key={group}
                type="button"
                className={`ascii-filter-btn${activeGroup === group ? " is-active" : ""}`}
                onClick={() => setActiveGroup(group)}
              >
                {group}
              </button>
            ))}
          </div>

          <div className="ascii-table-wrap">
            <table className="binary-table ascii-standard-table">
              <thead className="binary-table-header">
                <tr>
                  <th>Dec</th>
                  <th>Hex</th>
                  <th className="binary-table-cell-mono">Binary</th>
                  <th>Char</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {visibleAsciiRows.map((row, index) => {
                  const showGroup =
                    activeGroup === "All" &&
                    (index === 0 || visibleAsciiRows[index - 1].group !== row.group);

                  return (
                    <React.Fragment key={row.code}>
                      {showGroup && (
                        <tr>
                          <td colSpan="5" className="binary-table-category">
                            {row.group}
                          </td>
                        </tr>
                      )}
                      <tr className="binary-table-row">
                        <td className="binary-table-cell binary-table-cell-mono binary-table-cell-primary">
                          {row.code}
                        </td>
                        <td className="binary-table-cell binary-table-cell-mono">
                          0x{row.hex}
                        </td>
                        <td className="binary-table-cell binary-table-cell-mono">
                          {row.binary}
                        </td>
                        <td className="binary-table-cell">
                          <span className={`ascii-char-pill${row.group === "Control codes" ? " is-control" : ""}`}>
                            {row.char}
                          </span>
                        </td>
                        <td className="binary-table-cell">{row.description}</td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </NSLayout>
  );
}
