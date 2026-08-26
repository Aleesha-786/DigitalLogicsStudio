import { useState, useCallback } from "react";
import { getCircuitHint } from "../../../shared/services/circuitMindService";
import { generateAiCircuit } from "../../../shared/services/aiService";
import { useToast } from "../../../shared/context/ToastContext";
import { layoutGeneratedCircuit } from "../utils/layoutGeneratedCircuit";

// Self-contained AI integration: prompt state, hint requests, and circuit
// generation (with the messy "figure out which raw nodes are inputs /
// outputs / logic" normalisation logic).
export function useAI({
  gates,
  wires,
  inputGates,
  outputGates,
  setGates,
  setWires,
  setGateIdCounter,
  setWireIdCounter,
  setInputCounter,
  setOutputCounter,
  saveToHistory,
}) {
  const toast = useToast();
  const [aiPrompt, setAiPrompt] = useState("");
  const [hint, setHint] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState("");
  const [isGenLoading, setIsGenLoading] = useState(false);

  const isCircuitComplete = gates.length > 0 && wires.length > 0 && inputGates.length > 0 && outputGates.length > 0;

  const applyGeneratedCircuit = useCallback(
    (data) => {
      if (!data || !Array.isArray(data.gates) || data.gates.length === 0) {
        toast.warning("AI generated no gates. Try describing the circuit differently.");
        return false;
      }
      const rawGates = data.gates;
      const rawWires = data.wires || [];
      const genInputNodes = rawGates.filter((g) => (g.type || "").toUpperCase() === "INPUT" || (g.label && g.label.toLowerCase().includes("input")));
      const genOutputNodes = rawGates.filter((g) => (g.type || "").toUpperCase() === "OUTPUT" || (g.label && (g.label.toLowerCase().includes("output") || g.label.toLowerCase().includes("sum") || g.label.toLowerCase().includes("carry"))));
      const genLogicNodes = rawGates.filter((g) => !genInputNodes.includes(g) && !genOutputNodes.includes(g));

      const finalInputs = genInputNodes.map((g, i) => ({
        id: g.id ?? i, type: "INPUT", x: g.x ?? 80, y: g.y ?? 80 + i * 100,
        label: g.label || `A${i + 1}`, inputs: 0, hasOutput: true, inputValues: [false],
      }));
      const finalOutputs = genOutputNodes.map((g, i) => ({
        id: g.id ?? 100 + i, type: "OUTPUT", x: g.x ?? 750, y: g.y ?? 80 + i * 100,
        label: g.label || `Y${i + 1}`, inputs: 1, hasOutput: false, inputValues: [],
      }));
      const formattedLogic = genLogicNodes.map((g, idx) => {
        const typeUpper = (g.type || "AND").toUpperCase();
        let numInputs = g.inputs;
        if (numInputs === undefined || numInputs === null || (numInputs === 1 && !["NOT", "BUFFER"].includes(typeUpper))) {
          numInputs = ["NOT", "BUFFER"].includes(typeUpper) ? 1 : 2;
        }
        return {
          id: g.id ?? 200 + idx, type: typeUpper, x: g.x ?? 300 + idx * 160, y: g.y ?? 100 + (idx % 2) * 80,
          label: g.label || typeUpper, inputs: numInputs, hasOutput: true, inputValues: [],
        };
      });

      const finalGates = layoutGeneratedCircuit(
        [...finalInputs, ...formattedLogic, ...finalOutputs],
        rawWires,
      );
      const maxGateId = Math.max(...finalGates.map((g) => Number(g.id) || 0), 0) + 1;
      const maxWireId = Math.max(...rawWires.map((w) => Number(w.id) || 0), 0) + 1;

      setGates(finalGates);
      setWires(rawWires);
      setGateIdCounter(maxGateId);
      setWireIdCounter(maxWireId);
      setInputCounter(finalInputs.length);
      setOutputCounter(finalOutputs.length);
      setTimeout(() => saveToHistory(), 0);
      return true;
    },
    [setGates, setWires, setGateIdCounter, setWireIdCounter, setInputCounter, setOutputCounter, saveToHistory, toast]
  );

  const runAiGenerate = useCallback(
    async (description, sendCurrentCircuit) => {
      if (isGenLoading) return;
      setIsGenLoading(true);
      try {
        const res = await generateAiCircuit({
          problem_title: description || "Custom circuit",
          problem_description: description || "",
          prompt: description ? `make a ${description} circuit` : "make a logic circuit",
          inputs: inputGates.map((g) => g.label),
          outputs: outputGates.map((g) => g.label),
          truthTable: [],
          ...(sendCurrentCircuit ? { circuit: { gates, wires } } : {}),
        });
        const data = res?.data || res;
        applyGeneratedCircuit(data);
      } catch (error) {
        toast.error(error.message || "Could not generate circuit. Make sure backend is running.");
      } finally {
        setIsGenLoading(false);
      }
    },
    [isGenLoading, inputGates, outputGates, gates, wires, applyGeneratedCircuit, toast]
  );

  const handleGenerateCircuit = useCallback(() => {
    if (isGenLoading) return;
    if (isCircuitComplete) runAiGenerate(aiPrompt, true);
    else if (aiPrompt.trim()) runAiGenerate(aiPrompt, false);
  }, [isGenLoading, isCircuitComplete, aiPrompt, runAiGenerate]);

  const handleRequestHint = useCallback(async () => {
    if (hintLoading) return;
    setHintLoading(true);
    setHintError("");
    try {
      const problemContext = {
        title: aiPrompt || "Custom circuit", description: aiPrompt || "",
        inputs: inputGates.map((g) => g.label), outputs: outputGates.map((g) => g.label), truthTable: [],
      };
      const data = await getCircuitHint({ problem: problemContext, gates, wires, result: null });
      setHint(data.hint);
    } catch (error) {
      setHint(null);
      setHintError(error.message || "Couldn't get a hint right now.");
    } finally {
      setHintLoading(false);
    }
  }, [hintLoading, aiPrompt, inputGates, outputGates, gates, wires]);

  return {
    aiPrompt, setAiPrompt,
    hint, setHint,
    hintLoading, hintError, setHintError,
    isGenLoading,
    isCircuitComplete,
    applyGeneratedCircuit,
    runAiGenerate,
    handleGenerateCircuit,
    handleRequestHint,
  };
}
