import React from "react";
import PremiumLearningShell from "../../shared/components/topics/PremiumLearningShell";
import "./RegStyles.css";

const regPages = [
  {
    path: "/registers/intro",
    label: "Registers",
    description: "Register fundamentals, data storage roles, and system context.",
  },
  {
    path: "/registers/counters",
    label: "Counters",
    description: "Counting circuits, sequences, and binary progression behavior.",
  },
  {
    path: "/registers/sync-async",
    label: "Synchronous / Asynchronous",
    description: "Clocked coordination and the tradeoffs of async transitions.",
  },
  {
    path: "/registers/shift-registers",
    label: "Shift Registers",
    description: "Move data bit by bit through serial and parallel structures.",
  },
  {
    path: "/registers/serial-shift",
    label: "Serial Shift Registers",
    description: "Serial loading, shifting patterns, and timing of bit movement.",
  },
  {
    path: "/registers/loading",
    label: "Loading Registers",
    description: "Control how data enters registers cleanly and predictably.",
  },
  {
    path: "/registers/parallel",
    label: "Parallel Registers",
    description: "Parallel transfer techniques for wider, faster data movement.",
  },
  {
    path: "/registers/ripple-counters",
    label: "Ripple Counters",
    description: "Asynchronous counter propagation and cumulative delay effects.",
  },
  {
    path: "/registers/sync-binary-counters",
    label: "Synchronous Binary Counters",
    description: "Tighter clocked counter design with coordinated state changes.",
  },
];

const PATH_TO_SUBTOPIC_ID = {
  "/registers/intro": "registers",
  "/registers/counters": "counters",
  "/registers/sync-async": "sync-async",
  "/registers/shift-registers": "shift-registers",
  "/registers/serial-shift": "serial-shift",
  "/registers/loading": "loading",
  "/registers/parallel": "parallel",
  "/registers/ripple-counters": "ripple-counters",
  "/registers/sync-binary-counters": "sync-binary-counters",
};

const REG_TOPIC = {
  id: "registers-and-register-transfers",
  title: "REGISTERS & REGISTER TRANSFERS",
  links: Object.values(PATH_TO_SUBTOPIC_ID).map((id) => ({ id })),
};

const RegLayout = ({ children, title, subtitle }) => (
  <PremiumLearningShell
    title={title}
    subtitle={subtitle}
    pages={regPages}
    topicLabel="Registers & Transfers"
    sidebarTitle="Registers & Transfers"
    sidebarCopy="Explore storage, shifting, loading, and counting patterns through one polished navigation system."
    heroKicker="Registers and Register Transfers"
    progressVerb="complete"
    rootClassName="reg-layout"
    tracking={{
      topic: REG_TOPIC,
      pathToSubtopicId: PATH_TO_SUBTOPIC_ID,
    }}
  >
    {children}
  </PremiumLearningShell>
);

export default RegLayout;
