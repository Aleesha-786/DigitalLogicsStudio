import React from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { gsap } from "gsap";
import {
  Compass,
  Flame,
  Search,
  Sparkles,
  Trophy,
  ChevronRight,
  GraduationCap,
  Info,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { useTheme } from "../../shared/context/ThemeContext";
import { useAuth } from "../../auth/context/AuthContext";
import Navbar from "../../shared/components/navbar";
import useLearningProgress from "../../shared/hooks/useLearningProgress";
import coreTopics from "../../shared/data/coreTopics";
import {
  allBannerCards,
  allFilterGroups,
  courseFilterOptions,
  problemDifficultyOptions,
  problemSortOptions,
  problemStatusOptions,
} from "./data/allProblemsCatalog";
import unifiedNavSections from "./data/unifiedNavSections";
import problemTopicLandingMap from "./data/problemTopicLandingMap";
import {
  difficultyTone,
  sortProblems,
  buildTopicLookup,
} from "./utils/problemsUtils";
import { useProblemsCatalog } from "./hooks";
import {
  ProblemModal,
  CoalProblemModal,
  ProblemTableRow,
  SelectedProblemCard,
  SidebarAccordion,
  CalendarWidget,
} from "./components";
import "./ProblemsPage.css";
import {
  trackPracticeEngagement,
  trackTopicEngagement,
} from "../../shared/utils/analytics";

const topicLookup = buildTopicLookup(coreTopics);

export default function ProblemsPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const { topicSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const topicLanding = topicSlug ? problemTopicLandingMap[topicSlug] : null;

  // Course filter for the table only — "all" | "dld" | "coal". Everything
  // else on the page (sidebar, banner carousel, right rail stats/progress,
  // daily challenge) always reflects the combined DLD + COAL catalog.
  // Pre-seeded from ?course=coal so the old /resources/coal/problems
  // redirect still lands users on a COAL-filtered table.
  const [courseFilter, setCourseFilter] = React.useState(
    searchParams.get("course") === "coal" ? "coal" : "all",
  );
  const [activeGroup, setActiveGroup] = React.useState(
    topicLanding?.group || "All Topics",
  );
  const [searchTerm, setSearchTerm] = React.useState("");
  const {
    problems: problemsCatalog,
    loading: problemsLoading,
    error: problemsError,
  } = useProblemsCatalog();
  const [difficulty, setDifficulty] = React.useState(
    problemDifficultyOptions[0],
  );
  const [topicFilter, setTopicFilter] = React.useState(
    topicLanding?.group || "All Topics",
  );
  const [statusFilter, setStatusFilter] = React.useState(
    problemStatusOptions[0],
  );
  const [sortBy, setSortBy] = React.useState(problemSortOptions[0]);
  const [selectedProblemId, setSelectedProblemId] = React.useState(null);
  const [activeProblem, setActiveProblem] = React.useState(null);
  const [openArenaPanel, setOpenArenaPanel] = React.useState(null);
  const [month, setMonth] = React.useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const deferredSearch = React.useDeferredValue(searchTerm);
  const canManageProblems = user?.role === "instructor" || user?.role === "admin";

  const problemBannerCards = allBannerCards;
  const problemFilterGroups = React.useMemo(() => {
    const groups = [
      "All Topics",
      ...new Set(
        problemsCatalog
          .map((problem) => problem.filterGroup)
          .filter(Boolean),
      ),
    ];
    return groups.length > 1 ? groups : allFilterGroups;
  }, [problemsCatalog]);
  const activeNavSections = unifiedNavSections;

  // Keep the course filter chip reflected in the URL (shareable / bookmarkable),
  // without turning it back into a page-wide mode switch.
  React.useEffect(() => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (courseFilter === "all") {
          params.delete("course");
        } else {
          params.set("course", courseFilter);
        }
        return params;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseFilter]);

  const bannerRef = React.useRef(null);
  const tweenRef = React.useRef(null);
  const resumeTimeoutRef = React.useRef(null);
  const retryTimeoutRef = React.useRef(null);
  const retryCountRef = React.useRef(0);

  const getActiveItem = () => {
    if (topicSlug === "k-map") return "K-Map Arena";
    if (topicSlug === "sequential-circuits") return "Sequential Arena";
    if (topicSlug === "number-systems") return "Number Arena";
    if (topicSlug === "assembly") return "Assembly Lab";
    if (!topicSlug) return "Problems Library";
    return "";
  };
  const activeItemLabel = getActiveItem();

  const handleSidebarClick = React.useCallback(
    (item) => {
      setIsMobileSidebarOpen(false); // Close sidebar on mobile drawer click
      if (item.path) {
        navigate(item.path);
      } else if (item.topicSlug) {
        navigate(`/problems/${item.topicSlug}`);
      } else if (item.actionGroup) {
        navigate("/problems");
        setActiveGroup(item.actionGroup);
        setTopicFilter(item.actionGroup);
      } else {
        navigate("/problems");
        setActiveGroup("All Topics");
        setTopicFilter("All Topics");
      }
    },
    [navigate],
  );

  const handleBannerCardClick = React.useCallback((card) => {
    trackPracticeEngagement("banner_card_click", {
      card_title: card.title,
      filter_group: card.filterGroup,
    });
    if (card.path) {
      navigate(card.path);
    } else if (card.filterGroup) {
      setActiveGroup(card.filterGroup);
      setTopicFilter(card.filterGroup);
    }
  }, [navigate]);

  const startAutoscroll = React.useCallback((fromStart = true) => {
    const el = bannerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      if (retryCountRef.current < 8) {
        retryCountRef.current += 1;
        if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = setTimeout(() => {
          startAutoscroll(fromStart);
        }, 800);
      }
      return;
    }

    retryCountRef.current = 0; // reset on success

    if (tweenRef.current) {
      tweenRef.current.kill();
    }

    const currentScroll = el.scrollLeft;
    const targetScroll = fromStart ? maxScroll : 0;
    const distance = Math.abs(currentScroll - targetScroll);
    const duration = distance / 22; // Slow drift: 22 pixels per second

    tweenRef.current = gsap.to(el, {
      scrollLeft: targetScroll,
      duration: duration,
      ease: "none",
      onComplete: () => {
        startAutoscroll(!fromStart);
      },
    });
  }, []);

  React.useEffect(() => {
    const el = bannerRef.current;
    if (!el) return;

    const timeoutId = setTimeout(() => {
      startAutoscroll(el.scrollLeft < (el.scrollWidth - el.clientWidth) / 2);
    }, 800);

    const resumeTimeout = resumeTimeoutRef.current;
    return () => {
      clearTimeout(timeoutId);
      if (tweenRef.current) {
        tweenRef.current.kill();
      }
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [startAutoscroll]);

  const handleMouseEnter = () => {
    if (tweenRef.current) {
      tweenRef.current.pause();
    }
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    // Resume immediately on mouse leave
    const el = bannerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;

    // Check direction based on previous destination
    const isGoingToZero =
      tweenRef.current && tweenRef.current.vars.scrollLeft === 0;
    startAutoscroll(!isGoingToZero);
  };

  React.useEffect(() => {
    const nextGroup = topicLanding?.group || "All Topics";
    setActiveGroup(nextGroup);
    setTopicFilter(nextGroup);
  }, [topicLanding]);

  React.useEffect(() => {
    if (!topicLanding) return;
    trackTopicEngagement(topicLanding.group, "landing_view", {
      landing_slug: topicSlug,
    });
  }, [topicLanding, topicSlug]);

  const { snapshot, recordAttempt, setProblemSolved, monthMatrix } =
    useLearningProgress({
      user,
      topics: coreTopics,
      problems: problemsCatalog,
    });

  const solvedCount = snapshot?.summary?.solvedProblems || 0;
  const attemptedCount = snapshot?.summary?.attemptedProblems || 0;

  // XP & Level calculations
  const xp = solvedCount * 100 + attemptedCount * 30;
  const { level, rankName, nextLevelXp } = React.useMemo(() => {
    if (xp >= 1500) {
      return { level: 4, rankName: "Karnaugh Commander", nextLevelXp: 3000 };
    } else if (xp >= 800) {
      return { level: 3, rankName: "Silicon Architect", nextLevelXp: 1500 };
    } else if (xp >= 300) {
      return { level: 2, rankName: "Logic Gatekeeper", nextLevelXp: 800 };
    }
    return { level: 1, rankName: "Logic Cadet", nextLevelXp: 300 };
  }, [xp]);

  const xpPercentage = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  const dailyProblem = React.useMemo(() => {
    if (!problemsCatalog || !problemsCatalog.length) return null;
    const day = new Date().getDate();
    return problemsCatalog[day % problemsCatalog.length];
  }, [problemsCatalog]);

  const handleSolveDaily = () => {
    if (dailyProblem) {
      setSelectedProblemId(dailyProblem.id);
      setActiveProblem(dailyProblem);
      trackPracticeEngagement("open_daily_challenge", {
        problem_id: dailyProblem.id,
        problem_title: dailyProblem.title,
      });
    }
  };

  // DLD Fact of the Day
  const dailyFact = React.useMemo(() => {
    const dldFacts = [
      "NAND and NOR gates are called universal gates because they can construct any other logic gate.",
      "Karnaugh Maps (K-Maps) were invented in 1953 by Maurice Karnaugh, a telecommunications engineer at Bell Labs.",
      "A multiplexer (MUX) is also known as a data selector because it chooses one of many inputs to pass to a single output.",
      "A flip-flop can store 1 bit of data and is the building block of sequential logic circuits and registers.",
      "De Morgan's Laws state that the complement of a union is the intersection of the complements, and vice versa.",
      "Gray code is a binary numeral system where two successive values differ in only one bit, preventing transient errors in sensors.",
      "In a synchronous sequential logic circuit, all state transitions are synchronized by a global clock signal.",
    ];
    const dayIndex = new Date().getDay();
    return dldFacts[dayIndex % dldFacts.length];
  }, []);

  // Solved problems count in the last 7 days (Weekly Goal tracker)
  const solvedThisWeek = React.useMemo(() => {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const day = new Date(today.getTime() - i * 86400000);
      const year = day.getFullYear();
      const month = String(day.getMonth() + 1).padStart(2, "0");
      const date = String(day.getDate()).padStart(2, "0");
      const key = `${year}-${month}-${date}`;
      const dayData = snapshot?.state?.activity?.[key];
      if (dayData && dayData.solved) {
        count += dayData.solved;
      }
    }
    return count;
  }, [snapshot?.state?.activity]);

  // Rotating quick reference formula cheat-sheet card
  const cheatSheetFormula = React.useMemo(() => {
    const formulas = [
      {
        name: "De Morgan's Theorem",
        formula: "(A · B)' = A' + B'",
        description: "Negated product equals sum of negations.",
      },
      {
        name: "De Morgan's Theorem 2",
        formula: "(A + B)' = A' · B'",
        description: "Negated sum equals product of negations.",
      },
      {
        name: "Absorption Law",
        formula: "A + A · B = A",
        description: "The term A absorbs A · B.",
      },
      {
        name: "Consensus Theorem",
        formula: "A·B + A'·C + B·C = A·B + A'·C",
        description: "B·C is redundant and can be removed.",
      },
      {
        name: "Distributive Law",
        formula: "A + (B · C) = (A + B) · (A + C)",
        description: "OR distributes over AND.",
      },
      {
        name: "Shannon's Expansion",
        formula: "F(A, B) = A · F(1, B) + A' · F(0, B)",
        description: "Used to expand boolean functions.",
      },
    ];
    const day = new Date().getDate();
    return formulas[day % formulas.length];
  }, []);

  const filteredProblems = React.useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    const matches = problemsCatalog.filter((problem) => {
      const problemStatus =
        snapshot?.state?.problems?.[problem.id]?.status || "not_started";
      const matchesSearch =
        !normalizedSearch ||
        problem.title.toLowerCase().includes(normalizedSearch) ||
        problem.description.toLowerCase().includes(normalizedSearch) ||
        problem.tags.some((tag) =>
          tag.toLowerCase().includes(normalizedSearch),
        );

      const matchesDifficulty =
        difficulty === "All Difficulties" || problem.difficulty === difficulty;

      const matchesGroup =
        activeGroup === "All Topics" ||
        problem.filterGroup === activeGroup ||
        problem.topic === activeGroup;

      const matchesTopic =
        topicFilter === "All Topics" ||
        problem.filterGroup === topicFilter ||
        problem.topic === topicFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        (statusFilter === "Solved" && problemStatus === "solved") ||
        (statusFilter === "Attempted" && problemStatus === "attempted") ||
        (statusFilter === "Unsolved" && problemStatus === "not_started");

      const matchesCourse =
        courseFilter === "all" || problem.course === courseFilter;

      return (
        matchesSearch &&
        matchesDifficulty &&
        matchesGroup &&
        matchesTopic &&
        matchesStatus &&
        matchesCourse
      );
    });

    return sortProblems(matches, sortBy, snapshot?.state?.problems || {});
  }, [
    activeGroup,
    courseFilter,
    deferredSearch,
    difficulty,
    problemsCatalog,
    sortBy,
    snapshot?.state?.problems,
    statusFilter,
    topicFilter,
  ]);

  React.useEffect(() => {
    if (!filteredProblems.length) {
      setSelectedProblemId(null);
      return;
    }

    const stillVisible = filteredProblems.some(
      (problem) => problem.id === selectedProblemId,
    );
    if (!stillVisible) {
      setSelectedProblemId(filteredProblems[0].id);
    }
  }, [filteredProblems, selectedProblemId]);

  const selectedProblem = React.useMemo(
    () =>
      filteredProblems.find((problem) => problem.id === selectedProblemId) ||
      problemsCatalog.find((problem) => problem.id === selectedProblemId) ||
      filteredProblems[0] ||
      null,
    [filteredProblems, problemsCatalog, selectedProblemId],
  );

  const topTopicProgress = coreTopics
    .map((topic) => ({
      topic,
      progress: snapshot?.state?.topics?.[topic.id],
    }))
    .sort(
      (left, right) =>
        (right.progress?.completionPercentage || 0) -
        (left.progress?.completionPercentage || 0),
    )
    .slice(0, 4);

  const handleRecordAttempt = React.useCallback(
    (problem) => {
      trackPracticeEngagement("record_attempt", {
        problem_id: problem.id,
        problem_title: problem.title,
        problem_topic: problem.topic,
      });
      recordAttempt(problem);
    },
    [recordAttempt],
  );

  const handleSetProblemSolved = React.useCallback(
    (problem, solved) => {
      trackPracticeEngagement(solved ? "mark_solved" : "mark_unsolved", {
        problem_id: problem.id,
        problem_title: problem.title,
        problem_topic: problem.topic,
      });
      setProblemSolved(problem, solved);
    },
    [setProblemSolved],
  );

  // Stable reference so ProblemTableRow's React.memo actually prevents
  // re-renders — an inline arrow function here would defeat the memoization
  // by creating a new "onOpen" prop identity on every ProblemsPage render.
  const handleOpenProblemRow = React.useCallback(
    (problem, solved, attempted, isLocked) => {
      if (isLocked) return;
      setSelectedProblemId(problem.id);
      setActiveProblem(problem);
      trackPracticeEngagement("open_problem", {
        problem_id: problem.id,
        problem_title: problem.title,
        problem_topic: problem.topic,
      });
      // Opening a problem for the first time marks it "attempted". It will
      // later be upgraded to "solved" via onSolved from the modal.
      if (!solved && !attempted) {
        handleRecordAttempt(problem);
      }
    },
    [handleRecordAttempt],
  );

  if (problemsLoading) {
    return <div className="problems-page-status">Loading problems…</div>;
  }

  if (problemsError) {
    return (
      <div className="problems-page-status problems-page-error">
        {problemsError}
      </div>
    );
  }

  return (
    <div className={`problems-page theme-${theme}`}>
      <div className="problems-backdrop problems-backdrop-left" />
      <div className="problems-backdrop problems-backdrop-right" />

      {/* Floating Toggle Button for Mobile Sidebar Drawer */}
      <button
        type="button"
        className={`mobile-sidebar-toggle ${isMobileSidebarOpen ? "is-active" : ""}`}
        onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
        aria-label="Toggle navigation drawer"
      >
        {isMobileSidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar Backdrop Overlay on Mobile */}
      {isMobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <Navbar toggleTheme={toggleTheme} theme={theme} />

      <main className="problems-shell">
        <aside
          className={`problems-sidebar ${isMobileSidebarOpen ? "is-open" : ""}`}
        >
          <div className="problems-sidebar-brand">
            <span className="problems-sidebar-badge">Practice Arena</span>
            <h1>{topicLanding?.title || "Problems"}</h1>
            <p>
              {topicLanding?.description ||
                "LeetCode-style digital logic practice with activity, progress, and topic depth."}
            </p>
          </div>

          <nav
            className="problems-sidebar-nav"
            aria-label="Problems navigation"
          >
            {/* ── Practice Arenas: always visible, with inline tab panels ── */}
            <div className="sidebar-nav-section">
              <h4 className="sidebar-section-title">Practice Arenas</h4>
              <div className="sidebar-section-items">
                {activeNavSections[0].items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItemLabel === item.label;
                  const isPanelOpen = openArenaPanel === item.label;

                  return (
                    <div key={item.label} className="arena-item-wrapper">
                      {/* The main arena button — same original style */}
                      <button
                        type="button"
                        className={`problems-sidebar-link ${isActive ? "is-active" : ""} ${isPanelOpen ? "panel-open" : ""}`}
                        onClick={() => {
                          setOpenArenaPanel(
                            isPanelOpen ? null : item.label
                          );
                        }}
                      >
                        <span className="problems-sidebar-link-main">
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </span>
                        <span className="arena-item-right">
                          {item.badge ? (
                            <span
                              className={`problems-sidebar-link-badge badge-${item.badge.toLowerCase()}`}
                            >
                              {item.badge}
                            </span>
                          ) : null}
                          <span
                            className={`arena-panel-chevron ${isPanelOpen ? "rotated" : ""}`}
                            aria-hidden="true"
                          >
                            <ChevronRight size={12} />
                          </span>
                        </span>
                      </button>

                      {/* Inline sub-panel — slides open on click */}
                      <div className={`arena-sub-panel ${isPanelOpen ? "is-open" : ""}`}>
                        <div className="arena-sub-panel-inner">
                          <p className="arena-sub-desc">
                            {item.panel?.description}
                          </p>
                          <div className="arena-sub-links">
                            {item.panel?.links.map((link) => (
                              <button
                                key={link.label}
                                type="button"
                                className="arena-sub-link"
                                onClick={() => {
                                  setOpenArenaPanel(null);
                                  setIsMobileSidebarOpen(false);
                                  if (link.action === "navigate") {
                                    navigate(link.value);
                                  } else if (link.action === "filter") {
                                    navigate("/problems");
                                    setDifficulty(link.value);
                                  } else if (link.action === "topic") {
                                    navigate("/problems");
                                    setActiveGroup(link.value);
                                    setTopicFilter(link.value);
                                  }
                                }}
                              >
                                <span className="arena-sub-link-dot" />
                                {link.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── All other sections as accordion tabs ── */}
            <div className="sidebar-accordion">
              {activeNavSections.slice(1).map((section) => (
                <SidebarAccordion
                  key={section.title}
                  section={section}
                  activeItemLabel={activeItemLabel}
                  onItemClick={handleSidebarClick}
                />
              ))}
            </div>
          </nav>

          <section className="problems-sidebar-foot">
            <h3 className="sidebar-foot-title">Progress Stats</h3>
            <div className="sidebar-stat-item solved">
              <div className="stat-label-wrap">
                <Trophy size={16} className="stat-icon" />
                <span>Solved</span>
              </div>
              <strong>{snapshot.summary.solvedProblems}</strong>
            </div>
            <div className="sidebar-stat-item attempted">
              <div className="stat-label-wrap">
                <Compass size={16} className="stat-icon" />
                <span>Attempted</span>
              </div>
              <strong>{snapshot.summary.attemptedProblems}</strong>
            </div>
            <div className="sidebar-stat-item streak">
              <div className="stat-label-wrap">
                <Flame size={16} className="stat-icon" />
                <span>Streak</span>
              </div>
              <strong>{snapshot.summary.streaks.current} d</strong>
            </div>
          </section>
        </aside>

        <section className="problems-center">
          <div className="problems-banner-slider">
            <div
              className="problems-banner-row"
              ref={bannerRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {[...problemBannerCards, ...problemBannerCards].map((card, idx) => (
                <article
                  key={`${card.title}-${idx}`}
                  className="problems-banner-card"
                  style={{ background: card.gradient, cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${card.title} — ${card.eyebrow}`}
                  onClick={() => handleBannerCardClick(card)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleBannerCardClick(card);
                    }
                  }}
                >
                  <span>{card.eyebrow}</span>
                  <h2>{card.title}</h2>
                  <p>{card.description}</p>
                </article>
              ))}
            </div>
          </div>

          {/* ── Inline Daily Challenge Banner ── */}
          {dailyProblem && (
            <div className="inline-daily-challenge">
              <div className="inline-daily-left">
                <div className="inline-daily-eyebrow">
                  <Sparkles size={14} className="inline-daily-icon" />
                  <span>Daily Challenge</span>
                </div>
                <h3 className="inline-daily-title">{dailyProblem.title}</h3>
                <div className="inline-daily-meta">
                  <span
                    className={`difficulty-pill ${difficultyTone[dailyProblem.difficulty]}`}
                  >
                    {dailyProblem.difficulty}
                  </span>
                  <span className="inline-daily-topic">
                    {dailyProblem.topic}
                  </span>
                  <span className="xp-bonus">+100 XP</span>
                </div>
              </div>
              <div className="inline-daily-right">
                <p className="inline-daily-desc">
                  {dailyProblem.description.slice(0, 110)}…
                </p>
                <button
                  type="button"
                  className="inline-daily-btn"
                  onClick={handleSolveDaily}
                >
                  Solve Today's Challenge →
                </button>
              </div>
            </div>
          )}

          <div className="problems-toolbar-row">
            <div
              className="problems-course-tabs"
              role="group"
              aria-label="Filter by course"
            >
              {courseFilterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={courseFilter === option.value}
                  className={`problems-course-tab ${courseFilter === option.value ? "is-active" : ""}`}
                  onClick={() => setCourseFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {canManageProblems && (
              <Link to="/problems/editor/new" className="problems-add-btn">
                <Plus size={16} aria-hidden="true" />
                Add Problem
              </Link>
            )}
          </div>

          <div className="problems-filter-chip-row">
            {problemFilterGroups.map((group) => (
              <button
                key={group}
                type="button"
                className={`problems-filter-chip ${activeGroup === group ? "is-active" : ""}`}
                onClick={() => {
                  setActiveGroup(group);
                  setTopicFilter(group);
                  trackPracticeEngagement("topic_filter_click", {
                    filter_group: group,
                  });
                }}
              >
                {group}
              </button>
            ))}
          </div>

          {topicLanding ? (
            <section
              className="problems-widget arena-landing-widget"
              aria-labelledby="topic-cluster-links"
            >
              <div className="arena-landing-header">
                <div className="arena-landing-meta">
                  <span className="problems-widget-label">Practice Arena</span>
                  <h2 id="topic-cluster-links" className="arena-landing-title">
                    {topicLanding.title}
                  </h2>
                  <p className="arena-landing-desc">{topicLanding.description}</p>
                </div>
                <div className="arena-landing-stats">
                  <div className="arena-stat-pill">
                    <strong>{filteredProblems.length}</strong>
                    <span>Problems</span>
                  </div>
                  <div className="arena-stat-pill">
                    <strong>
                      {filteredProblems.filter(
                        (p) => snapshot?.state?.problems?.[p.id]?.status === "solved"
                      ).length}
                    </strong>
                    <span>Solved</span>
                  </div>
                  <div className="arena-stat-pill">
                    <strong>
                      {filteredProblems.filter((p) => p.difficulty === "Easy").length}
                    </strong>
                    <span>Easy</span>
                  </div>
                  <div className="arena-stat-pill">
                    <strong>
                      {filteredProblems.filter((p) => p.difficulty === "Medium").length}
                    </strong>
                    <span>Medium</span>
                  </div>
                  <div className="arena-stat-pill">
                    <strong>
                      {filteredProblems.filter((p) => p.difficulty === "Hard").length}
                    </strong>
                    <span>Hard</span>
                  </div>
                </div>
              </div>
              <div className="arena-landing-links-row">
                <span className="arena-links-label">Related tutorials →</span>
                <div className="selected-problem-tags">
                  {topicLanding.links.map((link) => (
                    <Link key={link.to} to={link.to} className="arena-tutorial-link">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <section className="problems-toolbar">
            <label className="problems-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search problems, tags, circuits, latches..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  if (event.target.value.length > 2) {
                    trackPracticeEngagement("search_query", {
                      query_length: event.target.value.length,
                    });
                  }
                }}
              />
            </label>

            <div className="problems-toolbar-selects">
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
              >
                {problemDifficultyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                value={topicFilter}
                onChange={(event) => setTopicFilter(event.target.value)}
              >
                {problemFilterGroups.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {problemStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                {problemSortOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="problems-table-card">
            <div className="problems-table-summary">
              <div>
                <span className="table-summary-label">Problem Library</span>
                <strong>{filteredProblems.length} visible challenges</strong>
              </div>
              <div className="table-summary-stats">
                <span>
                  <Flame size={15} />
                  {snapshot.summary.streaks.current} day streak
                </span>
                <span>
                  <Sparkles size={15} />
                  {snapshot.summary.completionRate}% completion
                </span>
              </div>
            </div>

            <div className="problems-table-wrap">
              <table className="problems-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Acceptance</th>
                    <th>Difficulty</th>
                    <th>Access</th>
                    <th>Status</th>
                    <th>Tags</th>
                    {canManageProblems && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.map((problem) => (
                    <ProblemTableRow
                      key={problem.id}
                      problem={problem}
                      progress={snapshot.state.problems[problem.id] || {}}
                      isSelected={selectedProblemId === problem.id}
                      onOpen={handleOpenProblemRow}
                      canManageProblems={canManageProblems}
                    />
                  ))}
                </tbody>
              </table>

              {!filteredProblems.length ? (
                <div className="problems-empty-state">
                  <h3>No problems match those filters yet</h3>
                  <p>
                    Try widening the topic, difficulty, or solved-state filters.
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </section>

        <aside className="problems-right-rail">
          {/* Level Progress Widget */}
          <div className="problems-widget level-progress-widget">
            <div className="level-header">
              <span className="level-badge">LVL {level}</span>
              <div className="rank-name">{rankName}</div>
            </div>
            <div className="xp-bar-container">
              <div
                className="xp-bar-progress"
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
            <div className="xp-details">
              <span>{xp} XP</span>
              <span>
                {nextLevelXp - xp > 0
                  ? `${nextLevelXp - xp} XP to next lvl`
                  : "Max Lvl"}
              </span>
            </div>
          </div>

          {/* Weekly Practice Goal Widget */}
          <div className="problems-widget weekly-goal-widget">
            <div className="weekly-goal-header">
              <Flame size={15} className="goal-fire-icon" />
              <h4>Weekly Goal</h4>
            </div>
            <div className="weekly-goal-body">
              <div className="goal-text">Solve 5 problems this week</div>
              <div className="goal-progress-wrap">
                <div className="goal-progress-bar">
                  <div
                    className="goal-progress-fill"
                    style={{
                      width: `${Math.min(100, (solvedThisWeek / 5) * 100)}%`,
                    }}
                  ></div>
                </div>
                <span className="goal-ratio">{solvedThisWeek}/5</span>
              </div>
            </div>
          </div>

          {/* Daily Challenge Widget */}
          {dailyProblem && (
            <div className="problems-widget daily-challenge-widget">
              <div className="daily-head">
                <Sparkles size={16} className="daily-glow-icon" />
                <span className="daily-label">Daily Challenge</span>
              </div>
              <div className="daily-body">
                <h4>{dailyProblem.title}</h4>
                <div className="daily-meta">
                  <span
                    className={`difficulty-pill ${difficultyTone[dailyProblem.difficulty]}`}
                  >
                    {dailyProblem.difficulty}
                  </span>
                  <span className="xp-bonus">+100 XP</span>
                </div>
              </div>
              <button
                type="button"
                className="solve-daily-btn"
                onClick={handleSolveDaily}
              >
                Solve Challenge
              </button>
            </div>
          )}

          {/* Cheat-Sheet Formula Widget */}
          <div className="problems-widget cheat-sheet-widget">
            <div className="cheat-sheet-header">
              <GraduationCap size={15} />
              <h4>Quick Formula</h4>
            </div>
            <div className="cheat-sheet-body">
              <div className="cheat-formula-name">{cheatSheetFormula.name}</div>
              <div className="cheat-formula-display">
                <code>{cheatSheetFormula.formula}</code>
              </div>
              <p className="cheat-formula-desc">
                {cheatSheetFormula.description}
              </p>
            </div>
          </div>

          <div className="problems-widget stats-widget">
            <div className="problems-widget-head">
              <div>
                <span className="problems-widget-label">Learner Snapshot</span>
                <h3>
                  {user?.name ? `${user.name}'s progress` : "Guest progress"}
                </h3>
              </div>
            </div>

            <div className="stats-grid">
              <div>
                <strong>{snapshot?.summary?.solvedProblems ?? 0}</strong>
                <span>Solved</span>
              </div>
              <div>
                <strong>{snapshot?.summary?.attemptedProblems ?? 0}</strong>
                <span>Attempted</span>
              </div>
              <div>
                <strong>{snapshot?.summary?.completedTopics ?? 0}</strong>
                <span>Topics complete</span>
              </div>
              <div>
                <strong>{snapshot?.summary?.streaks?.longest ?? 0}</strong>
                <span>Best streak</span>
              </div>
            </div>
          </div>

          <CalendarWidget
            month={month}
            setMonth={setMonth}
            monthMatrix={monthMatrix}
          />

          <SelectedProblemCard
            problem={selectedProblem}
            status={
              selectedProblem
                ? snapshot?.state?.problems?.[selectedProblem.id]
                : null
            }
            onAttempt={handleRecordAttempt}
            onToggleSolved={handleSetProblemSolved}
          />

          <section className="problems-widget">
            <div className="problems-widget-head">
              <div>
                <span className="problems-widget-label">Topic Progress</span>
                <h3>Top learning paths</h3>
              </div>
            </div>

            <div className="topic-progress-mini-list">
              {topTopicProgress.map(({ topic, progress }) => (
                <div key={topic.id} className="topic-progress-mini-item">
                  <div className="topic-progress-mini-copy">
                    <strong>{topic.title}</strong>
                    <span>
                      {progress?.completedCount || 0}/
                      {progress?.totalSubtopics || topic.links.length} modules
                    </span>
                  </div>
                  <div className="topic-progress-mini-bar">
                    <span
                      style={{
                        width: `${progress?.completionPercentage || 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="problems-widget">
            <div className="problems-widget-head">
              <div>
                <span className="problems-widget-label">Recent Activity</span>
                <h3>Latest actions</h3>
              </div>
            </div>

            <div className="recent-activity-list">
               {(snapshot?.recentEvents || []).length ? (
                snapshot.recentEvents.slice(0, 5).map((event) => {
                  const topic = event.topicId
                    ? topicLookup[event.topicId]
                    : null;
                  return (
                    <div key={event.id} className="recent-activity-item">
                      <strong>
                        {event.type === "problem_solved" && "Solved problem"}
                        {event.type === "problem_attempted" &&
                          "Attempted problem"}
                        {event.type === "topic_opened" && "Opened topic"}
                        {event.type === "topic_completed" && "Completed topic"}
                      </strong>
                      <span>
                        {event.title || topic?.title || "Learning activity"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="recent-activity-empty">
                  Start solving or opening modules to populate your activity
                  stream.
                </p>
              )}
            </div>
          </section>

          {/* DLD Fact of the Day */}
          <div className="problems-widget fact-widget">
            <div className="fact-head">
              <Info size={15} />
              <h4>Fact of the Day</h4>
            </div>
            <p className="fact-content">{dailyFact}</p>
          </div>
        </aside>
      </main>

      {activeProblem && activeProblem.course === "coal" && (
        <CoalProblemModal
          problem={activeProblem}
          onClose={() => setActiveProblem(null)}
          onSolved={() => handleSetProblemSolved(activeProblem, true)}
          onAttempt={() => handleRecordAttempt(activeProblem)}
        />
      )}

      {activeProblem && activeProblem.course !== "coal" && (
        <ProblemModal
          problem={activeProblem}
          onClose={() => setActiveProblem(null)}
          onSolved={() => handleSetProblemSolved(activeProblem, true)}
        />
      )}

    </div>
  );
}

