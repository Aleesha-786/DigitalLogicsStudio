import React from "react";
import PremiumLearningShell from "../../shared/components/topics/PremiumLearningShell";
import "./SeqLayout.css";

const seqPages = [
  {
    path: "/sequential/intro",
    label: "Introduction",
    description: "Core sequential-circuit ideas, memory, and timing behavior.",
  },
  {
    path: "/sequential/latches",
    label: "Latches",
    description: "SR and gated latches as the first state-holding building blocks.",
  },
  {
    path: "/sequential/flip-flops",
    label: "Flip-Flops",
    description: "Edge-triggered memory elements and their timing semantics.",
  },
  {
    path: "/sequential/flip-flop-types",
    label: "Flip-Flop Types",
    description: "Compare SR, JK, D, and T flip-flops with design tradeoffs.",
  },
  {
    path: "/sequential/analysis",
    label: "Analysis",
    description: "Derive state behavior from equations, excitation, and transitions.",
  },
  {
    path: "/sequential/design-procedures",
    label: "Design Procedures",
    description: "Structured workflows for building sequential systems correctly.",
  },
  {
    path: "/sequential/state-diagram",
    label: "State Diagrams",
    description: "Translate between states, transitions, tables, and behavior.",
  },
  {
    path: "/sequential/state-reduction",
    label: "State Reduction",
    description: "Minimize states and compute efficient excitation requirements.",
  },
];

const PATH_TO_SUBTOPIC_ID = Object.fromEntries(
  seqPages.map((page) => [page.path, page.path.replace("/sequential/", "")]),
);

const SEQ_TOPIC = {
  id: "sequential-circuits",
  title: "SEQUENTIAL CIRCUITS",
  links: Object.values(PATH_TO_SUBTOPIC_ID).map((id) => ({ id })),
};

const SeqLayout = ({ children, title, subtitle }) => (
  <PremiumLearningShell
    title={title}
    subtitle={subtitle}
    pages={seqPages}
    topicLabel="Sequential Circuits"
    sidebarTitle="Sequential Circuits"
    sidebarCopy="Follow one state-logic chapter at a time with the same premium learning path used across the platform."
    heroKicker="Sequential Circuits"
    progressVerb="complete"
    rootClassName="seq-layout"
    tracking={{
      topic: SEQ_TOPIC,
      pathToSubtopicId: PATH_TO_SUBTOPIC_ID,
    }}
  >
    {children}
  </PremiumLearningShell>
);

export default SeqLayout;
