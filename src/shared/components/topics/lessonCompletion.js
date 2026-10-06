import { createContext, useContext } from "react";

// Lets a page rendered inside PremiumLearningShell read and set its own
// completion. Assessment pages (a `pages` entry with `assessment: true`) use
// it: they are completed by passing the assessment, not by "Mark as Read".
const LessonCompletionContext = createContext({
  isComplete: false,
  markComplete: async () => {},
});

export const useLessonCompletion = () => useContext(LessonCompletionContext);

export default LessonCompletionContext;
