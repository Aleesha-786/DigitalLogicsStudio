import { useLocation } from "react-router-dom";
import PremiumLearningShell from "../../shared/components/topics/PremiumLearningShell";
import TheorySidebar from "./components/TheorySidebar";
import "./TheoryLayout.css";

// ── Generic theory layout ───────────────────────────────────────────
// Wraps PremiumLearningShell (the actual chrome: hero, chapter dots,
// prev/next, built-in sidebar drawer) with the always-visible desktop
// TheorySidebar, for whichever track is passed in.
//
// track.pagesScope controls how wide the hero's chapter-dot / prev-next
// navigation reaches:
//  - "all"  (COAL) — spans every topic in the whole course
//  - "part" (DLD)  — scoped to just the current part's topics, matching
//    each DLD category's original standalone behavior so nothing about
//    the on-page navigation changes for existing users
export default function TheoryLayout({ track, children, title, subtitle, intro, highlights = [] }) {
  const { pathname } = useLocation();
  const { utils, courseParts } = track;

  const currentPart = utils.getPartForPath(pathname) || courseParts[0];

  const pages =
    track.pagesScope === "all"
      ? utils.buildTopicPages()
      : currentPart.modules.map((module) => ({
          path: utils.getTopicPath(module.slug),
          label: module.title,
          description: module.description || `Part ${currentPart.part} · ${currentPart.title}`,
        }));

  const sidebarPages = utils.buildPartSidebarPages();

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
    <>
      {/* Desktop-only (≥1280px) accordion sidebar spanning every part —
          independent of PremiumLearningShell's own drawer, which still
          serves mobile. */}
      <TheorySidebar track={track} />

      <PremiumLearningShell
        title={title}
        subtitle={subtitle}
        intro={intro}
        highlights={highlights}
        pages={pages}
        sidebarPages={sidebarPages}
        overviewPath={track.homePath}
        isSidebarItemActive={utils.isPartSidebarActive}
        isSidebarItemDone={utils.isPartSidebarDone}
        topicLabel={track.sidebarTitle}
        sidebarTitle="Course parts"
        sidebarCopy="Jump to a part on the theory path. Open individual topics from the dots above or the cards below."
        heroKicker={track.heroKicker}
        progressVerb="explored"
        rootClassName={track.rootClassName}
        sidebarFooterLink={track.homePath}
        sidebarFooterLabel={`← ${track.id === "coal" ? "COAL" : "DLD"} home`}
        tracking={{ topic, pathToSubtopicId: utils.PATH_TO_SUBTOPIC_ID }}
      >
        {children}
      </PremiumLearningShell>
    </>
  );
}
