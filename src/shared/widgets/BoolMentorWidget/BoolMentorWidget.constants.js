// ============================================================
// BoolMentorWidget — shared constants
// Pulled out of the component so config changes don't require
// touching component logic (Improvement Plan §2, §9).
// ============================================================

export const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const QUICK_PROMPTS = [
  { text: "What is a flip-flop?", tag: "DLD" },
  { text: "Explain Boolean algebra laws", tag: "DLD" },
  { text: "What is COAL syntax?", tag: "COAL" },
  { text: "Explain fetch-decode-execute", tag: "COAL" },
];

export const LEVEL_STORAGE_KEY = "bool-mentor-level";
export const COURSE_STORAGE_KEY = "bool-mentor-course";
export const TOPIC_STORAGE_KEY = "bool-mentor-topic";

// Max characters a user can send in a single message (Improvement Plan §7 —
// basic abuse/length guard on the client; the backend still enforces its
// own 4000-char limit independently).
export const MAX_MESSAGE_LENGTH = 2000;

/**
 * Cross-browser-safe id generator.
 *
 * `crypto.randomUUID()` is not available in Safari < 15.4, Firefox < 95, or
 * in non-HTTPS/non-secure contexts, and will throw a TypeError there. This
 * avoids the dependency entirely — good enough for client-only, non-crypto
 * message ids.
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
