import React from "react";
import TopicLayout from "../../../shared/components/topics/TopicLayout";
import { dldCourseParts } from "../../../shared/data/dldCourseOutline";
import "./RegStyles.css";
import { regPages, REG_TOPIC, REG_PATH_TO_SUBTOPIC_ID } from "./regConfig";

const currentPartIndex = dldCourseParts.findIndex((p) => p.id === "registers-and-register-transfers");
const nextPart =
  currentPartIndex >= 0 && currentPartIndex < dldCourseParts.length - 1
    ? dldCourseParts[currentPartIndex + 1]
    : null;
const nextPartPath = nextPart?.modules?.[0]?.path || null;
const nextPartLabel = nextPart?.title || null;

const RegLayout = ({ children, title, subtitle }) => (
  <TopicLayout
    title={title}
    subtitle={subtitle}
    pages={regPages}
    overviewPath={regPages[0]?.path}
    topicLabel="Registers & Transfers"
    sidebarTitle="Registers & Transfers"
    sidebarCopy="Explore storage, shifting, loading, and counting patterns through one polished navigation system."
    heroKicker="Registers and Register Transfers"
    progressVerb="complete"
    rootClassName="reg-layout"
    tracking={{
      topic: REG_TOPIC,
      pathToSubtopicId: REG_PATH_TO_SUBTOPIC_ID,
    }}
    nextPartPath={nextPartPath}
    nextPartLabel={nextPartLabel}
    sidebarFooterLink="/resources/dld"
    sidebarFooterLabel="← DLD home"
  >
    {children}
  </TopicLayout>
);

export default RegLayout;