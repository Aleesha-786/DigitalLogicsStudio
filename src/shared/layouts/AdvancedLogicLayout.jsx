import React from "react";
import TopicLayout from "../components/topics/TopicLayout";
import { dldCourseParts } from "../data/dldCourseOutline";
import {
  advancedLogicPages,
  ADVANCED_LOGIC_TOPIC,
  ADVANCED_LOGIC_PATH_TO_SUBTOPIC_ID,
} from "../../features/dld-theory/logic-gates/advancedLogicConfig";

const currentPartIndex = dldCourseParts.findIndex((p) => p.id === "advanced-logic");
const nextPart =
  currentPartIndex >= 0 && currentPartIndex < dldCourseParts.length - 1
    ? dldCourseParts[currentPartIndex + 1]
    : null;
const nextPartPath = nextPart?.modules?.[0]?.path || null;
const nextPartLabel = nextPart?.title || null;

const prevPart =
  currentPartIndex > 0 ? dldCourseParts[currentPartIndex - 1] : null;
const prevPartPath = prevPart?.modules?.[0]?.path || null;
const prevPartLabel = prevPart?.title || null;

const AdvancedLogicLayout = ({
  title,
  subtitle,
  intro,
  highlights = [],
  children,
}) => (
  <TopicLayout
    title={title}
    subtitle={subtitle}
    intro={intro}
    highlights={highlights}
    pages={advancedLogicPages}
    overviewPath={advancedLogicPages[0]?.path}
    topicLabel="Advanced Logic"
    sidebarTitle="Advanced Logic"
    sidebarCopy="Study optimization, universal construction, parity, and deeper reasoning inside the same premium shell."
    heroKicker="Advanced Logic"
    progressVerb="complete"
    tracking={{
      topic: ADVANCED_LOGIC_TOPIC,
      pathToSubtopicId: ADVANCED_LOGIC_PATH_TO_SUBTOPIC_ID,
    }}
    nextPartPath={nextPartPath}
    nextPartLabel={nextPartLabel}
    sidebarFooterLink="/resources/dld"
    sidebarFooterLabel="← DLD home"
    prevPartPath={prevPartPath}
    prevPartLabel={prevPartLabel}
  >
    {children}
  </TopicLayout>
);

export default AdvancedLogicLayout;