import React from "react";
import TopicLayout from "../../../../shared/components/topics/TopicLayout";
import { dldCourseParts } from "../../../../shared/data/dldCourseOutline";
import "./NSLayout.css";
import {
  nsPages,
  NS_PATH_TO_SUBTOPIC_ID,
  NS_LEGACY_SUBTOPIC_ALIASES,
  NS_TOPIC,
  NS_DEFAULT_HIGHLIGHTS,
} from "./nsConfig";

const currentPartIndex = dldCourseParts.findIndex((p) => p.id === "number-systems");
const nextPart =
  currentPartIndex >= 0 && currentPartIndex < dldCourseParts.length - 1
    ? dldCourseParts[currentPartIndex + 1]
    : null;
const nextPartPath = nextPart?.modules?.[0]?.path || null;
const nextPartLabel = nextPart?.title || null;

const NSLayout = ({ title, subtitle, intro, highlights = [], children }) => (
  <TopicLayout
    title={title}
    subtitle={subtitle}
    intro={intro}
    highlights={
      highlights.length ? highlights : NS_DEFAULT_HIGHLIGHTS[title] || []
    }
    pages={nsPages}
    overviewPath={nsPages[0]?.path}
    topicLabel="Number Systems"
    sidebarTitle="Number Systems"
    sidebarCopy="Move across binary, decimal, octal, and hexadecimal with one consistent premium conversion workspace."
    heroKicker="Number Systems"
    progressVerb="read"
    rootClassName="ns-layout"
    tracking={{
      topic: NS_TOPIC,
      pathToSubtopicId: NS_PATH_TO_SUBTOPIC_ID,
      subtopicAliases: NS_LEGACY_SUBTOPIC_ALIASES,
    }}
    nextPartPath={nextPartPath}
    nextPartLabel={nextPartLabel}
    sidebarFooterLink="/resources/dld"
    sidebarFooterLabel="← DLD home"
  >
    {children}
  </TopicLayout>
);

export default NSLayout;