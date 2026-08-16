import React from "react";
import TopicLayout from "../../../shared/components/topics/TopicLayout";
import { dldCourseParts } from "../../../shared/data/dldCourseOutline";
import "./SeqLayout.css";
import { seqPages, SEQ_TOPIC, SEQ_PATH_TO_SUBTOPIC_ID } from "./seqConfig";

const currentPartIndex = dldCourseParts.findIndex((p) => p.id === "sequential-circuits");
const nextPart =
  currentPartIndex >= 0 && currentPartIndex < dldCourseParts.length - 1
    ? dldCourseParts[currentPartIndex + 1]
    : null;
const nextPartPath = nextPart?.modules?.[0]?.path || null;
const nextPartLabel = nextPart?.title || null;

const SeqLayout = ({ children, title, subtitle }) => (
  <TopicLayout
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
      pathToSubtopicId: SEQ_PATH_TO_SUBTOPIC_ID,
    }}
    nextPartPath={nextPartPath}
    nextPartLabel={nextPartLabel}
    sidebarFooterLink="/resources/dld"
    sidebarFooterLabel="← DLD home"
  >
    {children}
  </TopicLayout>
);

export default SeqLayout;