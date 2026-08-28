import React from "react";
import { Bot, Lightbulb, Sparkles, X } from "lucide-react";
import { FloatingPanel } from "./FloatingPanel";

export const AIPanel = ({
  onClose,
  aiPrompt,
  setAiPrompt,
  handleRequestHint,
  hintLoading,
  handleGenerateCircuit,
  isGenLoading,
  hint,
  hintError,
  setHint,
  setHintError,
}) => (
  <FloatingPanel title="CircuitMind Assistant" icon={Bot} onClose={onClose} className="floating-panel--ai">
    <textarea
      className="ai-textarea"
      value={aiPrompt}
      onChange={(e) => setAiPrompt(e.target.value)}
      placeholder="Describe the circuit (e.g. 'half adder', 'A AND B OR C')…"
      rows={3}
    />
    <div className="controls">
      <button className="btn hint-btn" onClick={handleRequestHint} disabled={hintLoading} style={{ cursor: hintLoading ? "wait" : "pointer" }}>
        <Lightbulb size={14} strokeWidth={2} style={{ marginRight: 4, verticalAlign: -2 }} />
        {hintLoading ? "Thinking…" : "Get Hint"}
      </button>
      <button className="btn generate-btn" onClick={handleGenerateCircuit} disabled={isGenLoading} style={{ cursor: isGenLoading ? "wait" : "pointer" }}>
        <Sparkles size={14} strokeWidth={2} style={{ marginRight: 4, verticalAlign: -2 }} />
        {isGenLoading ? "Generating…" : "AI Generate"}
      </button>
    </div>
    {(hint || hintError) && (
      <div className={`ai-response ${hintError ? "error" : ""}`}>
        {hintError || hint}
        <button className="dismiss-hint" onClick={() => { setHint(null); setHintError(""); }}>
          <X size={13} strokeWidth={2.5} />
        </button>
      </div>
    )}
  </FloatingPanel>
);
