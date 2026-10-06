import React from "react";
import TopicLayout from "../../../shared/components/topics/TopicLayout";
import "./MemorySystem.css";
import {
  memoryPages,
  MEMORY_PATH_TO_SUBTOPIC_ID,
  MEMORY_TOPIC,
} from "./memoryConfig";
import { dldCourseParts } from "../../../shared/data/dldCourseOutline";

const currentPartIndex = dldCourseParts.findIndex((p) => p.id === "memory-systems");
const prevPart =
  currentPartIndex > 0 ? dldCourseParts[currentPartIndex - 1] : null;
const prevPartPath = prevPart?.modules?.[0]?.path || null;
const prevPartLabel = prevPart?.title || null;

const MemoryLayout = ({ title, kicker, description, children }) => (
  <TopicLayout
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
      pathToSubtopicId: MEMORY_PATH_TO_SUBTOPIC_ID,
    }}
    prevPartPath={prevPartPath}
    prevPartLabel={prevPartLabel}
  >
    {children}
  </TopicLayout>
);

export default MemoryLayout;
