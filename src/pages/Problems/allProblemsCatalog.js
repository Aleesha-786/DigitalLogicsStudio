// Merged DLD + COAL problem catalog for the single /problems page.
//
// Progress is keyed by raw problem.id (see progressService.js ->
// state.problems[id]) and is NOT scoped per catalog, so merging is safe
// as long as ids are never reassigned:
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

const tagged = {
  dld: dldCatalog.map((p) => ({ ...p, course: "dld" })),
  coal: coalCatalog.map((p) => ({ ...p, course: "coal" })),
};

if (process.env.NODE_ENV !== "production") {
  const seen = new Map();
  [...tagged.dld, ...tagged.coal].forEach((p) => {
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

export const allProblemsCatalog = [...tagged.dld, ...tagged.coal];

export const catalogByCourse = tagged;

export const bannerCardsByCourse = {
  dld: dldBannerCards,
  coal: coalBannerCards,
};

export const filterGroupsByCourse = {
  dld: dldFilterGroups,
  coal: coalFilterGroups,
};

// Difficulty/status/sort option lists are identical shape across both
// catalogs today — re-exported from the DLD catalog module as the
// canonical source. If COAL's ever diverge, split this into
// optionsByCourse the same way as bannerCardsByCourse above.
export { problemDifficultyOptions, problemStatusOptions, problemSortOptions };

export default allProblemsCatalog;
