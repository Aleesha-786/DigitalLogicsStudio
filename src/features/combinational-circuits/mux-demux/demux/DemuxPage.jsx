/**
 * DemuxPage.jsx — Main Demultiplexer page (thin orchestrator).
 *
 * Owns top-level state:
 *   selectedType, dVal, selVals
 *
 * Arranges sections using <Section>.
 * Contains no rendering logic itself.
 */
import React, { useState } from "react";
import CombinationalLayout from "../../CombinationalLayout";
import { COLORS } from "../shared/theme.js";
import Section from "../shared/components/Section.jsx";
import Quiz from "../shared/components/Quiz.jsx";
import TipsPanel from "../shared/components/TipsPanel.jsx";

import { DEMUX_TYPES, DEMUX_QUIZ, DEMUX_QUIZ_FEEDBACK, DEMUX_TIPS } from "./demuxData.js";
import DemuxTypeSelector from "./components/DemuxTypeSelector.jsx";
import DemuxSimulator from "./components/DemuxSimulator.jsx";
import DecoderVsDemux from "./components/DecoderVsDemux.jsx";

const DemuxPage = () => {
  const [selectedType, setSelectedType] = useState("1to4");
  const [dVal, setDVal]     = useState(1);
  const [selVals, setSelVals] = useState(Array(3).fill(0));

  const config = DEMUX_TYPES[selectedType];

  return (
    <CombinationalLayout
      title="Demultiplexer"
      subtitle="One-to-many distribution, select control, and decoder equivalence"
      intro="Learn how a single input signal can be directed across multiple destinations with select-line control and how that behavior mirrors decoder hardware."
      highlights={[
        {
          title: "One-to-Many Routing",
          text: "Track how one source reaches exactly one selected destination output.",
        },
        {
          title: "Decoder Relationship",
          text: "Compare DEMUX behavior directly with decoder enable-driven architectures.",
        },
        {
          title: "Interactive Selection",
          text: "Toggle data and select inputs to build intuition for distribution logic.",
        },
      ]}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto", fontFamily: "inherit" }}>

      {/* Type selector */}
      <DemuxTypeSelector
        selectedType={selectedType}
        types={DEMUX_TYPES}
        onChange={(k) => { setSelectedType(k); setDVal(1); setSelVals(Array(3).fill(0)); }}
      />

      {/* Concept & analogy */}
      <Section title={`${config.label} — Concept`} icon="💡" accentColor={COLORS.indigo}>
        <p style={{ color: COLORS.textSecondary, fontSize: "0.9rem", lineHeight: "1.65", marginBottom: "10px" }}>
          {config.description}
        </p>
        <div style={{ padding: "12px 16px", background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: "10px" }}>
          <span style={{ color: COLORS.warn, fontWeight: "700", fontSize: "0.8rem" }}>🌍 REAL-WORLD ANALOGY: </span>
          <span style={{ color: COLORS.textSecondary, fontSize: "0.85rem" }}>{config.analogy}</span>
        </div>
      </Section>

      {/* Interactive simulator */}
      <Section title="Interactive Simulator" icon="🎮" accentColor={COLORS.high}>
        <DemuxSimulator
          config={config}
          dVal={dVal}
          setDVal={setDVal}
          selVals={selVals}
          setSelVals={setSelVals}
        />
      </Section>

      {/* Decoder vs DEMUX */}
      <Section title="Decoder vs DEMUX" icon="🔍" accentColor={COLORS.blue}>
        <p style={{ color: COLORS.textSecondary, fontSize: "0.88rem", lineHeight: "1.65", marginBottom: "18px" }}>
          A decoder with its Enable used as the data input is functionally equivalent to a
          DEMUX. When D=1 they are identical; when D=0 the DEMUX routes a LOW signal while
          a disabled decoder simply deactivates all outputs.
        </p>
        <DecoderVsDemux />
      </Section>

      {/* Quiz */}
      <Section title="Knowledge Check" icon="🧠" accentColor={COLORS.blue}>
        <Quiz questions={DEMUX_QUIZ} feedbackText={DEMUX_QUIZ_FEEDBACK} />
      </Section>

      <TipsPanel tips={DEMUX_TIPS} />
    </div>
    </CombinationalLayout>
  );
};

export default DemuxPage;
