import { compileSimplification } from "../../../../shared/utils/simplification";

// Each expression reduces, using only the laws taught up to the Boolean Laws
// page, to one clearly simplest form. `answers` lists every way of writing
// that form which is not just a reordering — reorderings already match.
const problems = [
  { expression: "AB + A(B + C) + B(B + C)", answers: ["B + AC"] },
  { expression: "(A' + B)' + AB", answers: ["A"] },
  { expression: "A'B'C + A'BC + AC", answers: ["C"] },
  { expression: "(A + B)(A + C)", answers: ["A + BC"] },
  { expression: "(AB)'(A' + B)", answers: ["A'"] },
];

export const LAWS_ASSESSMENT_PROBLEMS = problems.map(compileSimplification);
