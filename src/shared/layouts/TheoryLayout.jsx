import { useLocation } from "react-router-dom";
import TopicLayout from "../components/topics/TopicLayout";
import "./TheoryLayout.css";

// ── Generic theory layout ───────────────────────────────────────────
// Wraps PremiumLearningShell (the actual chrome: hero, chapter dots,
// prev/next, built-in sidebar drawer) for whichever track is passed in
// — same shell every other DLD topic page (e.g. boolean-algebra) uses,
// so the navbar/sidebar looks and behaves identically across the site.
//
// The sidebar always lists only the CURRENT PART's topics — each part
// is its own mini-course (e.g. "Part 1 · Foundations"), so its sidebar
// should read the same way boolean-algebra's does: just that course's
// topics, not every topic in the whole track mixed together.
//
// track.pagesScope separately controls how wide the hero's chapter-dot /
// prev-next navigation reaches (this is unrelated to the sidebar list):
//  - "all"  (COAL) — dots span every topic in the whole course, matching
//    COAL's existing (pre-unification) behavior
//  - "part" (DLD)  — dots scoped to just the current part, matching each
//    DLD category's original standalone behavior
export default function TheoryLayout({ track, children, title, subtitle, intro, highlights = [] }) {
  const { pathname } = useLocation();
  const { utils, courseParts } = track;

  const currentPart = utils.getPartForPath(pathname) || courseParts[0];
  const currentPartIndex = courseParts.findIndex((p) => p.id === currentPart.id);
  const nextPart =
  currentPartIndex >= 0 && currentPartIndex < courseParts.length - 1
    ? courseParts[currentPartIndex + 1]
    : null;
      const nextPartPath = nextPart?.modules?.[0]
    ? utils.getTopicPath(nextPart.modules[0].slug)
    : null;
      const nextPartLabel = nextPart?.title || null;

        const prevPart =
    currentPartIndex > 0 ? courseParts[currentPartIndex - 1] : null;
  const prevPartPath = prevPart?.modules?.[0]
    ? utils.getTopicPath(prevPart.modules[0].slug)
    : null;
  const prevPartLabel = prevPart?.title || null;

 const currentPartPages = currentPart.modules.map((module) => ({
  path: utils.getTopicPath(module.slug),
  label: module.title,
  description: module.description || `Part ${currentPart.part} · ${currentPart.title}`,
}));

// Scope path→subtopicId to just this part's modules, so the progress
// ring's "X of Y" count matches the same pages shown in this view — not
// every topic in the whole course. This matters most for COAL, which
// tracks all its progress under one shared topic id across every part;
// without this, a topic completed back in Part 1 would still count
// toward Part 2's ring.
const currentPartPathToSubtopicId = Object.fromEntries(
  currentPart.modules.map((module) => [
    utils.getTopicPath(module.slug),
    module.subtopicId || module.slug,
  ]),
);

  const pages = track.pagesScope === "all" ? utils.buildTopicPages() : currentPartPages;

  const topicId =
    typeof track.progressTopicId === "function"
      ? track.progressTopicId(currentPart)
      : track.progressTopicId;

  const topic = {
    id: topicId,
    title: (track.pagesScope === "all" ? track.meta.title : currentPart.title).toUpperCase(),
    links: Object.values(utils.PATH_TO_SUBTOPIC_ID).map((id) => ({ id })),
  };

  return (
    <TopicLayout
      title={title}
      subtitle={subtitle}
      intro={intro}
      highlights={highlights}
      pages={pages}
      sidebarPages={currentPartPages}
      overviewPath={track.homePath}
      isSidebarItemActive={utils.isPartSidebarActive}
      isSidebarItemDone={utils.isPartSidebarDone}
      topicLabel={track.sidebarTitle}
      sidebarTitle={`Part ${currentPart.part} · ${currentPart.title}`}
      sidebarCopy={track.sidebarCopy}
      heroKicker={track.heroKicker}
      progressVerb="explored"
      rootClassName={track.rootClassName}
      sidebarFooterLink={track.homePath}
      sidebarFooterLabel={`← ${track.id === "coal" ? "COAL" : "DLD"} home`}
      tracking={{ topic, pathToSubtopicId: currentPartPathToSubtopicId }}
      nextPartPath={nextPartPath}
      nextPartLabel={nextPartLabel}
      prevPartPath={prevPartPath}
      prevPartLabel={prevPartLabel}
    >
      {children}
    </TopicLayout>
  );
}

