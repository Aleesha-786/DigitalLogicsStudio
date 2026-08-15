// Merged DLD + COAL problem catalog powering the single, unified /problems
// page. Both courses always render in the same table — course is a filter
// chip, not a page mode. See ProblemsPage.jsx.
//
// Progress is keyed by raw problem.id (see progressService.js ->
// state.problems[id]) and is NOT scoped per catalog, so merging is safe as
// long as ids are never reassigned:
//   DLD catalog ids:  1-40, 2001-2007 (synthetic)
//   COAL catalog ids: 3001-3015
// These ranges are currently disjoint. The dev-time check below will warn
// loudly if a future edit to either catalog ever introduces a collision.

import dldCatalog, {
  problemBannerCards as dldBannerCards,
  problemFilterGroups as dldFilterGroups,
  problemDifficultyOptions,
  problemStatusOptions,
  problemSortOptions,
} from "./problemCatalog";
import coalCatalog, {
  problemBannerCards as coalBannerCards,
  problemFilterGroups as coalFilterGroups,
} from "./coalProblemsCatalog";

// Display IDs shown in the table's ID column, e.g. "DLD-0001", "DLD-2001",
// "COAL-0001" ... "COAL-0015". These are cosmetic labels only — they never
// touch the underlying numeric `id` that progress tracking depends on.
const dldTagged = dldCatalog.map((p) => ({
  ...p,
  course: "dld",
  listId: `DLD-${p.listId}`,
}));

const coalSorted = [...coalCatalog].sort((a, b) => a.numericId - b.numericId);
const coalTagged = coalSorted.map((p, index) => ({
  ...p,
  course: "coal",
  listId: `COAL-${String(index + 1).padStart(4, "0")}`,
}));

if (process.env.NODE_ENV !== "production") {
  const seen = new Map();
  [...dldTagged, ...coalTagged].forEach((p) => {
    if (seen.has(p.id)) {
      // eslint-disable-next-line no-console
      console.error(
        `[allProblemsCatalog] duplicate problem id ${p.id}: "${seen.get(p.id)}" vs "${p.title}". ` +
          "This will corrupt progress tracking between courses — fix the id before shipping.",
      );
    }
    seen.set(p.id, p.title);
  });
}

// The single, unified catalog — always both courses together.
export const allProblemsCatalog = [...dldTagged, ...coalTagged];

export const catalogByCourse = { dld: dldTagged, coal: coalTagged };

// Banner carousel shows cards from both courses in one row.
export const allBannerCards = [...dldBannerCards, ...coalBannerCards];

// Topic filter chips, deduplicated across both courses (e.g. "Number
// Systems" appears in both catalogs and becomes a single shared chip that
// matches problems from either course tagged with that topic).
export const allFilterGroups = [
  "All Topics",
  ...Array.from(
    new Set([
      ...dldFilterGroups.filter((g) => g !== "All Topics"),
      ...coalFilterGroups.filter((g) => g !== "All Topics"),
    ]),
  ),
];

// Course filter chips for the table (separate from the topic chips above).
export const courseFilterOptions = [
  { value: "all", label: "All Courses" },
  { value: "dld", label: "DLD" },
  { value: "coal", label: "COAL" },
];

export { problemDifficultyOptions, problemStatusOptions, problemSortOptions };

export default allProblemsCatalog;

