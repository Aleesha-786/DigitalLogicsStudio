import { useCallback, useEffect, useState } from "react";
import {
  fetchProblems,
  createProblem as apiCreateProblem,
  updateProblem as apiUpdateProblem,
  deleteProblem as apiDeleteProblem,
} from "../services/problemsApi";

// ─── Derived-field recomputation ───────────────────────────────────────────
// acceptanceRate, premium, slug, and numericId were never real content —
// they were computed client-side from `id`/`difficulty`/`title` by
// enrichProblem() in the old static catalogs. They aren't stored in the
// backend Problem model (and don't need to be — they're pure functions of
// fields the API already returns), so we recompute them here, identically,
// after fetching. This keeps the UI's acceptance %, lock icons, etc.
// pixel-identical to before the swap.

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const computeAcceptance = (problem) => {
  const baseByDifficulty = { Easy: 78, Medium: 58, Hard: 36 };
  const base = baseByDifficulty[problem.difficulty] || 62;
  const variation = ((problem.id * 17) % 19) - 6;
  return Number(Math.max(28, Math.min(94, base + variation)).toFixed(1));
};

function enrichFetchedProblem(problem) {
  return {
    ...problem,
    numericId: problem.id,
    slug: slugify(problem.title),
    acceptanceRate: computeAcceptance(problem),
    premium: problem.id % 5 === 0,
    // filterGroup/primaryTopicId aren't recomputed — the page's topic
    // filter already falls back to matching on `problem.topic` directly
    // (see ProblemsPage.jsx filteredProblems: `problem.filterGroup ===
    // activeGroup || problem.topic === activeGroup`), so leaving these
    // undefined is safe and doesn't break filtering.
  };
}

/**
 * Fetches the live problems catalog from the backend and keeps local state
 * in sync with create/update/delete actions — no full page reload needed.
 *
 * Returns the same overall shape ProblemsPage.jsx already expects from
 * `problemsCatalog` (an array), plus loading/error state and CRUD helpers.
 */
export default function useProblemsCatalog() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProblems();
      setProblems(data.map(enrichFetchedProblem));
    } catch (err) {
      setError(
        err?.response?.status === 401
          ? "Please log in to view problems."
          : "Couldn't load problems — is the backend running?",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addProblem = useCallback(async (payload) => {
    const created = await apiCreateProblem(payload);
    setProblems((prev) => [...prev, enrichFetchedProblem(created)].sort((a, b) => a.id - b.id));
    return created;
  }, []);

  const editProblem = useCallback(async (id, payload) => {
    const updated = await apiUpdateProblem(id, payload);
    setProblems((prev) =>
      prev.map((p) => (p.id === id ? enrichFetchedProblem(updated) : p)),
    );
    return updated;
  }, []);

  const removeProblem = useCallback(async (id) => {
    await apiDeleteProblem(id);
    setProblems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { problems, loading, error, refetch: load, addProblem, editProblem, removeProblem };
}

