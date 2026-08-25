import React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useTheme } from "../../../shared/context/ThemeContext";
import Navbar from "../../../shared/components/navbar";
import { useProblemsCatalog } from "../hooks";
import Toast from "../../../shared/components/Toast";
import "../styles/ProblemsPage.css";
import "../styles/ProblemEditorPage.css";

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
 * Full-page problem editor. Route-gated to instructor/admin (see
 * RoleProtectedRoute in src/auth). Covers all three write operations —
 * create, update, delete — for a single problem:
 *   /problems/editor/new       -> create mode
 *   /problems/editor/:problemId -> edit/delete mode for that problem
 *
 * This replaces the old modal-based ProblemFormModal: the operations
 * column on the problems table now only offers "Open in Editor", which
 * routes here instead of opening a dialog in place.
 */
export default function ProblemEditorPage() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();
  const isCreate = !problemId || problemId === "new";

  const {
    problems: problemsCatalog,
    loading: catalogLoading,
    addProblem,
    editProblem,
    removeProblem,
  } = useProblemsCatalog();

  const existingProblem = React.useMemo(() => {
    if (isCreate) return null;
    return problemsCatalog.find((p) => String(p.id) === String(problemId)) || null;
  }, [isCreate, problemsCatalog, problemId]);

  const [form, setForm] = React.useState(emptyForm);
  const [truthTable, setTruthTable] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [hydrated, setHydrated] = React.useState(isCreate);

  React.useEffect(() => {
    if (!isCreate && existingProblem && !hydrated) {
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
      setHydrated(true);
    }
  }, [isCreate, existingProblem, hydrated]);

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
      ...(isCreate ? { id: Number(form.id) } : {}),
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
      if (isCreate) {
        await addProblem(payload);
      } else {
        await editProblem(existingProblem.id, payload);
      }
      setToast({
        tone: "success",
        message: isCreate ? "Problem created." : "Problem updated.",
      });
      setTimeout(() => navigate("/problems"), 600);
    } catch (err) {
      // 403 = role gate rejected server-side even though the route was
      // hidden client-side (e.g. a stale session after a role change).
      // 409 = id collision on create. Surface both plainly.
      setError(err?.response?.data?.message || "Failed to save problem.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingProblem) return;
    if (
      !window.confirm(
        `Delete "${existingProblem.title}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await removeProblem(existingProblem.id);
      setToast({ tone: "success", message: "Problem deleted." });
      setTimeout(() => navigate("/problems"), 500);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete problem.");
    } finally {
      setDeleting(false);
    }
  };

  if (!isCreate && catalogLoading) {
    return (
      <div className={`problems-page theme-${theme}`}>
        <Navbar toggleTheme={toggleTheme} theme={theme} />
        <div className="problems-page-status">Loading problem…</div>
      </div>
    );
  }

  if (!isCreate && !catalogLoading && !existingProblem) {
    return (
      <div className={`problems-page theme-${theme}`}>
        <Navbar toggleTheme={toggleTheme} theme={theme} />
        <div className="problems-page-status">
          Problem not found.{" "}
          <Link to="/problems" className="prob-editor-link">
            Back to Problems
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`problems-page theme-${theme}`}>
      <Navbar toggleTheme={toggleTheme} theme={theme} />

      <main className="prob-editor-shell">
        <div className="prob-editor-topbar">
          <Link to="/problems" className="prob-editor-back">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Problems
          </Link>
          {!isCreate && (
            <button
              type="button"
              className="prob-editor-delete-btn"
              onClick={handleDelete}
              disabled={deleting || saving}
            >
              <Trash2 size={15} aria-hidden="true" />
              {deleting ? "Deleting…" : "Delete Problem"}
            </button>
          )}
        </div>

        <div className="prob-editor-card">
          <h1 className="prob-editor-title">
            {isCreate ? "Create Problem" : `Edit — ${existingProblem?.title}`}
          </h1>

          <form className="prob-editor-form" onSubmit={handleSubmit}>
            {error && <div className="prob-form-error">{error}</div>}

            <div className="prob-form-grid">
              {isCreate && (
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
              <textarea rows={4} required value={form.description} onChange={handleField("description")} />
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

            <div className="prob-editor-table-actions">
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

            <div className="prob-editor-submit-row">
              <Link to="/problems" className="prob-editor-cancel-btn">
                Cancel
              </Link>
              <button type="submit" disabled={saving}>
                {saving ? "Saving…" : isCreate ? "Create Problem" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Toast
        message={toast?.message}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
      />
    </div>
  );
}
