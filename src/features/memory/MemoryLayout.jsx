import React from "react";
import PremiumLearningShell from "../../shared/components/topics/PremiumLearningShell";
import "./MemorySystem.css";
import { memoryPages } from "./memoryConfig";

const PATH_TO_SUBTOPIC_ID = Object.fromEntries(
  memoryPages.map((page) => [page.path, page.path.replace("/memory/", "")]),
);

const MEMORY_TOPIC = {
  id: "memory-systems",
  title: "MEMORY SYSTEMS",
  links: Object.values(PATH_TO_SUBTOPIC_ID).map((id) => ({ id })),
};

const MemoryLayout = ({ title, kicker, description, children }) => (
  <PremiumLearningShell
    title={title}
    subtitle={description}
    pages={memoryPages}
    topicLabel="Memory Systems"
    sidebarTitle="Memory Systems"
    sidebarCopy="Progress through storage architectures, RAM families, and memory construction inside one unified premium workspace."
    heroKicker={kicker || "Memory Systems"}
    progressVerb="complete"
    rootClassName="mem-layout"
    tracking={{
      topic: MEMORY_TOPIC,
      pathToSubtopicId: PATH_TO_SUBTOPIC_ID,
    }}
  >
    {children}
  </PremiumLearningShell>
);

export default MemoryLayout;
