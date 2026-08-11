import React, { useEffect, useState } from "react";
import "../styles/Problems.css";

const emptyForm = {
  id: "",
  course: "dld",
  title: "",
  difficulty: "Easy",
  tags: "",
  topic: "",
  description: "",
  inputs: "",
  outputs: "",
  equations: "",
  hint: "",
};

function csvToArray(str) {
  return String(str || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function generateTruthTableSkeleton(inputs, outputs) {
  const rowCount = 2 ** inputs.length;
  const rows = [];
  for (let i = 0; i < rowCount; i += 1) {
    const row = {};
    inputs.forEach((label, idx) => {
      const bit = (i >> (inputs.length - 1 - idx)) & 1;
      row[label] = bit;
    });
    outputs.forEach((label) => {
      row[label] = 0;
    });
    rows.push(row);
  }
  return rows;
}

/**
 * Create/edit form for a single problem.
 * mode: "create" | "edit"
 * existingProblem: required when mode === "edit"
 * onSave(payload): async fn from the parent (wraps addProblem/editProblem
 *   from useProblemsCatalog). Should throw on failure so the modal can
 *   show the error inline instead of silently closing.
 * onClose(): called on cancel, or after a successful save.
 */
export default function ProblemFormModal({ mode, existingProblem, onSave, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [truthTable, setTruthTable] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === "edit" && existingProblem) {
      setForm({
        id: existingProblem.id,
        course: existingProblem.course,
        title: existingProblem.title,
        difficulty: existingProblem.difficulty,
        tags: (existingProblem.tags || []).join(", "),
        topic: existingProblem.topic || "",
        description: existingProblem.description || "",
        inputs: (existingProblem.inputs || []).join(", "),
        outputs: (existingProblem.outputs || []).join(", "),
        equations: (existingProblem.equations || []).join("\n"),
        hint: existingProblem.hint || "",
      });
      setTruthTable(existingProblem.truthTable || []);
    }
  }, [mode, existingProblem]);

  const inputsArr = csvToArray(form.inputs);
  const outputsArr = csvToArray(form.outputs);

  const handleField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleGenerateTable = () => {
    if (inputsArr.length === 0 || outputsArr.length === 0) {
      setError("Fill in Inputs and Outputs before generating the truth table.");
      return;
    }
    setError(null);
    setTruthTable(generateTruthTableSkeleton(inputsArr, outputsArr));
  };

  const handleToggleOutputCell = (rowIdx, outLabel) => {
    setTruthTable((rows) =>
      rows.map((row, i) =>
        i === rowIdx ? { ...row, [outLabel]: row[outLabel] === 1 ? 0 : 1 } : row,
      ),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (truthTable.length > 0 && truthTable.length !== 2 ** inputsArr.length) {
      setError(
        "Truth table row count doesn't match the current inputs — regenerate it, or clear it for a non-circuit (MCQ/conceptual) problem.",
      );
      return;
    }

    const payload = {
      ...(mode === "create" ? { id: Number(form.id) } : {}),
      course: form.course,
      title: form.title,
      difficulty: form.difficulty,
      tags: csvToArray(form.tags),
      topic: form.topic,
      description: form.description,
      inputs: inputsArr,
      outputs: outputsArr,
      equations: form.equations.split("\n").map((s) => s.trim()).filter(Boolean),
      hint: form.hint,
      truthTable,
    };

    setSaving(true);
    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      // 403 = role gate rejected server-side even though the UI hid the
      // button for non-instructors — e.g. a stale session after a role
      // change. 409 = id collision on create. Surface both plainly.
      setError(err?.response?.data?.message || "Failed to save problem.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="prob-modal-overlay" onClick={() => onClose()}>
      <div className="prob-modal" onClick={(e) => e.stopPropagation()}>
        <div className="prob-modal-header">
          <h2 className="prob-modal-title">
            {mode === "create" ? "Add New Problem" : `Edit — ${existingProblem?.title}`}
          </h2>
          <button className="prob-close-btn" onClick={() => onClose()}>
            ✕
          </button>
        </div>

        <form
          className="prob-modal-body"
          onSubmit={handleSubmit}
          style={{ flexDirection: "column", gap: "1rem" }}
        >
          {error && <div className="prob-form-error">{error}</div>}

          <div className="prob-form-grid">
            {mode === "create" && (
              <label>
                Numeric ID
                <input
                  type="number"
                  required
                  value={form.id}
                  onChange={handleField("id")}
                  placeholder="e.g. 41 (must be outside existing ranges)"
                />
              </label>
            )}
            <label>
              Course
              <select value={form.course} onChange={handleField("course")}>
                <option value="dld">DLD</option>
                <option value="coal">COAL</option>
              </select>
            </label>
            <label>
              Difficulty
              <select value={form.difficulty} onChange={handleField("difficulty")}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </label>
          </div>

          <label>
            Title
            <input type="text" required value={form.title} onChange={handleField("title")} />
          </label>

          <label>
            Description
            <textarea rows={3} required value={form.description} onChange={handleField("description")} />
          </label>

          <div className="prob-form-grid">
            <label>
              Inputs (comma-separated, e.g. A, B, Cin)
              <input type="text" required value={form.inputs} onChange={handleField("inputs")} />
            </label>
            <label>
              Outputs (comma-separated, e.g. S, Cout)
              <input type="text" required value={form.outputs} onChange={handleField("outputs")} />
            </label>
          </div>

          <div className="prob-form-grid">
            <label>
              Tags (comma-separated)
              <input type="text" value={form.tags} onChange={handleField("tags")} />
            </label>
            <label>
              Topic
              <input type="text" value={form.topic} onChange={handleField("topic")} />
            </label>
          </div>

          <label>
            Equations (one per line)
            <textarea rows={2} value={form.equations} onChange={handleField("equations")} />
          </label>

          <label>
            Hint
            <input type="text" value={form.hint} onChange={handleField("hint")} />
          </label>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button type="button" onClick={handleGenerateTable}>
              Generate truth table ({inputsArr.length ? 2 ** inputsArr.length : 0} rows)
            </button>
            {truthTable.length > 0 && (
              <button type="button" onClick={() => setTruthTable([])}>
                Clear table (MCQ / conceptual problem)
              </button>
            )}
          </div>

          {truthTable.length > 0 && (
            <div className="problems-table-wrap">
              <table className="problems-table">
                <thead>
                  <tr>
                    {inputsArr.map((l) => (
                      <th key={l}>{l}</th>
                    ))}
                    {outputsArr.map((l) => (
                      <th key={l}>{l}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {truthTable.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {inputsArr.map((l) => (
                        <td key={l}>{row[l]}</td>
                      ))}
                      {outputsArr.map((l) => (
                        <td key={l}>
                          <button type="button" onClick={() => handleToggleOutputCell(rowIdx, l)}>
                            {row[l]}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => onClose()} disabled={saving}>
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving ? "Saving…" : mode === "create" ? "Create Problem" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

