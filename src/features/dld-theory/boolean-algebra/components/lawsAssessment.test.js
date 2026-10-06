import { LAWS_ASSESSMENT_PROBLEMS } from "./lawsAssessment";
import { gradeStep } from "../../../../shared/utils/simplification";

test("every problem's listed answers are accepted as its simplest form", () => {
  LAWS_ASSESSMENT_PROBLEMS.forEach((problem) => {
    problem.answers.forEach((answer) => {
      expect([problem.expression, gradeStep(problem, answer).status]).toEqual([
        problem.expression,
        "solved",
      ]);
    });
  });
});

test("retyping the given expression is a valid step, not a solution", () => {
  LAWS_ASSESSMENT_PROBLEMS.forEach((problem) => {
    expect(gradeStep(problem, problem.expression).status).toBe("valid");
  });
});
