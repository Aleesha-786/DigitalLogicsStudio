export const difficultyTone = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
};

export const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

export const monthLabel = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);

export const sortProblems = (items, sortValue, progressMap) => {
  const cloned = [...items];
  const difficultyRank = {
    Easy: 1,
    Medium: 2,
    Hard: 3,
  };

  switch (sortValue) {
    case "Acceptance":
      return cloned.sort(
        (left, right) => right.acceptanceRate - left.acceptanceRate,
      );
    case "Difficulty":
      return cloned.sort(
        (left, right) =>
          difficultyRank[left.difficulty] - difficultyRank[right.difficulty],
      );
    case "Title":
      return cloned.sort((left, right) =>
        left.title.localeCompare(right.title),
      );
    default:
      return cloned.sort((left, right) => {
        const leftStatus = progressMap[left.id]?.status || "not_started";
        const rightStatus = progressMap[right.id]?.status || "not_started";
        if (leftStatus === "solved" && rightStatus !== "solved") return 1;
        if (rightStatus === "solved" && leftStatus !== "solved") return -1;
        return left.numericId - right.numericId;
      });
  }
};

export const buildTopicLookup = (coreTopics) =>
  Object.fromEntries(coreTopics.map((topic) => [topic.id, topic]));
