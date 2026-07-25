import axios from "axios";
import { resolveCircuitMindBaseUrl } from "../config/apiConfig";

const circuitMindClient = axios.create({
  baseURL: resolveCircuitMindBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

circuitMindClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      error.message = "Too many hint requests — wait a moment and try again.";
    } else if (typeof error.response?.data?.detail === "string") {
      error.message = error.response.data.detail;
    } else if (!error.response) {
      error.message = "Couldn't reach the CircuitMind hint service.";
    }
    return Promise.reject(error);
  },
);

// Trims the gate/wire graph down to what the hint endpoint actually needs —
// Boolforge's internal fields (x, y, inputValues, hasOutput...) aren't relevant context.
function toHintGates(gates) {
  return (gates || []).map((g) => ({ id: g.id, type: g.type, label: g.label }));
}

function toHintWires(wires) {
  return (wires || []).map((w) => ({
    fromId: w.fromId,
    toId: w.toId,
    toIndex: w.toIndex,
  }));
}

function toLastResult(result) {
  if (!result) return null;
  const failingRows = (result.rows || [])
    .filter((row) => !row.pass)
    .slice(0, 5)
    .map((row) => ({ inputs: row.inputs, expected: row.expected, got: row.got }));

  return {
    passed: Boolean(result.pass),
    error: result.error || null,
    failing_rows: failingRows,
  };
}

export function getCircuitHint({ problem, gates, wires, result }) {
  return circuitMindClient
    .post("/hint", {
      problem_title: problem?.title || "",
      problem_description: problem?.description || "",
      inputs: problem?.inputs || [],
      outputs: problem?.outputs || [],
      truth_table: problem?.truthTable || [],
      gates: toHintGates(gates),
      wires: toHintWires(wires),
      last_result: toLastResult(result),
    })
    .then((response) => response.data);
}

export default circuitMindClient;
