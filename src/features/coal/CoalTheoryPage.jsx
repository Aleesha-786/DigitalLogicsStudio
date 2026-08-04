import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import CoalLayout from "./CoalLayout";
import CoreTopicsSection from "../../shared/components/topics/CoreTopicsSection";
import { buildCoalCoreTopics } from "features/coal/coalCoreTopics";
import { coalCourseMeta, coalCourseParts } from "../../shared/data/coalCourseOutline";
import { getAllCoalModules } from "../../shared/utils/coalCourseUtils";
import { useCoalScrollSpy } from "features/coal/useCoalScrollSpy";
import "./CoalLayout.css";

const coalTopics = buildCoalCoreTopics();
const coalPartIds = coalCourseParts.map((part) => part.id);

function CoalTheoryPage() {
  const location = useLocation();
  const modules = getAllCoalModules();
  const publishedCount = modules.filter((module) => module.hasContent).length;

  // Scrollspy: updates the URL hash as the user scrolls past each part's
  // card, which CoalSidebar (via useLocation) and isCoalPartSidebarActive
  // both already key off of — no separate state needed.
  useCoalScrollSpy(coalPartIds);

  // One-shot: on direct load/navigation with a hash already in the URL
  // (e.g. clicking a sidebar folder link), jump to that section. Scrollspy
  // above only listens *outward* (scroll → hash); this handles the reverse
  // (hash → scroll) so the two don't fight each other.
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // Only run on the hash actually present at navigation time, not on
    // every scrollspy-driven hash replace, or it'll fight the scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CoalLayout
      title="Theory & course path"
      subtitle="All parts and modules"
      intro={coalCourseMeta.description}
    >
      <div className="coal-theory-overview">
        <div className="coal-theory-overview__stats">
          <span>
            <strong>{coalCourseParts.length}</strong> parts
          </span>
          <span>
            <strong>{modules.length}</strong> topics
          </span>
          <span>
            <strong>{publishedCount}</strong> published
          </span>
          <span>
            <strong>~{coalCourseMeta.estimatedWeeks}</strong> weeks
          </span>
        </div>

        <CoreTopicsSection topics={coalTopics} parentTopicId="coal-theory" />
      </div>
    </CoalLayout>
  );
}

export default CoalTheoryPage;