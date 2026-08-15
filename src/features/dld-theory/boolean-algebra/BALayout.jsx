import React from "react";
import TopicLayout from "../../../shared/components/topics/TopicLayout";
import { dldCourseParts } from "../../../shared/data/dldCourseOutline";
import "./BALayout.css";
import { baPages, BA_TOPIC, BA_PATH_TO_SUBTOPIC_ID } from "./components/baConfig";

const currentPartIndex = dldCourseParts.findIndex((p) => p.id === "boolean-algebra");
const nextPart =
  currentPartIndex >= 0 && currentPartIndex < dldCourseParts.length - 1
    ? dldCourseParts[currentPartIndex + 1]
    : null;
const nextPartPath = nextPart?.modules?.[0]?.path || null;
const nextPartLabel = nextPart?.title || null;

const BALayout = ({ title, subtitle, intro, highlights = [], children }) => (
  <TopicLayout
    title={title}
    subtitle={subtitle}
    intro={intro}
    highlights={highlights}
    pages={baPages}
    overviewPath="/boolean/overview"
    topicLabel="Boolean Algebra"
    sidebarTitle="Boolean Algebra"
    sidebarCopy="Master the mathematical foundation of every digital circuit with one polished lesson flow."
    heroKicker="Boolean Algebra"
    progressVerb="read"
    rootClassName="ba-layout"
    tracking={{
      topic: BA_TOPIC,
      pathToSubtopicId: BA_PATH_TO_SUBTOPIC_ID,
    }}
    nextPartPath={nextPartPath}
    nextPartLabel={nextPartLabel}
    sidebarFooterLink="/resources/dld"
    sidebarFooterLabel="← DLD home"
  >
    {children}
  </TopicLayout>
);

export default BALayout;