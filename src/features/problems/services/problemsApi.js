// problemsApi.js
//
// FIX: apiClient's baseURL already includes "/api" (see
// src/services/apiClient.js: baseURL: ".../api"). Every other service in
// this codebase calls relative paths WITHOUT repeating "/api" — e.g.
// apiClient.get("/health"), not apiClient.get("/api/health"). The
// previous version of this file called "/api/problems", which resolved to
// ".../api/api/problems" (404) — that was the actual cause of "Couldn't
// load problems", not the backend or Mongo connection.
import apiClient from "../../../shared/services/apiClient";

export async function fetchProblems() {
  const { data } = await apiClient.get("/problems");
  return data.problems;
}

export async function fetchProblem(id) {
  const { data } = await apiClient.get(`/problems/${id}`);
  return data.problem;
}

// Only succeeds server-side for instructor/admin — the backend re-checks
// role regardless of what the UI allows, so a 403 here is expected and
// should surface a clear error rather than crash.
export async function createProblem(payload) {
  const { data } = await apiClient.post("/problems", payload);
  return data.problem;
}

export async function updateProblem(id, payload) {
  const { data } = await apiClient.put(`/problems/${id}`, payload);
  return data.problem;
}

export async function deleteProblem(id) {
  const { data } = await apiClient.delete(`/problems/${id}`);
  return data;
}

