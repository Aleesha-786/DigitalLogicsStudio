import React from "react";
import TopicLayout from "../../../shared/components/topics/TopicLayout";
import { dldCourseParts } from "../../../shared/data/dldCourseOutline";
import {
  combinationalPages,
  COMBINATIONAL_TOPIC,
  COMBINATIONAL_PATH_TO_SUBTOPIC_ID,
} from "./combinationalConfig";

const currentPartIndex = dldCourseParts.findIndex((p) => p.id === "combinational-circuits");
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

const CombinationalLayout = ({
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
    pages={combinationalPages}
    overviewPath={combinationalPages[0]?.path}
    topicLabel="Combinational Circuits"
    sidebarTitle="Combinational Circuits"
    sidebarCopy="Move through signal routing, encoding, decoding, and selection with one premium lesson framework."
    heroKicker="Combinational Circuits"
    progressVerb="complete"
    tracking={{
      topic: COMBINATIONAL_TOPIC,
      pathToSubtopicId: COMBINATIONAL_PATH_TO_SUBTOPIC_ID,
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

export default CombinationalLayout;