import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Check } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import progressService from "../../shared/services/progressService";
import {
  coalCourseParts,
  COAL_PATH_TO_SUBTOPIC_ID,
  COAL_THEORY_OVERVIEW_PATH,
  getCoalPartForPath,
} from "../../shared/utils/coalCourseUtils";
import "./styles/CoalSidebar.css";

const COAL_TOPIC = {
  id: "coal-theory",
  title: "COAL THEORY",
  links: Object.values(COAL_PATH_TO_SUBTOPIC_ID).map((id) => ({ id })),
};

function CoalSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const userKey = progressService.getUserKey(user);
  const catalog = useMemo(() => ({ topics: [COAL_TOPIC], problems: [] }), []);

  const getCompleted = useCallback(() => {
    const snapshot = progressService.getSnapshot(userKey, catalog);
    return snapshot.state.topics?.["coal-theory"]?.completedSubtopics || [];
  }, [catalog, userKey]);

  const [completed, setCompleted] = useState(() => getCompleted());

  const dbLoadedRef = useRef(null);
  useEffect(() => {
    if (!user || userKey === "guest") return;
    if (dbLoadedRef.current === userKey) return;
    dbLoadedRef.current = userKey;
    progressService.loadFromDB(userKey).then(() => setCompleted(getCompleted()));
  }, [user, userKey, getCompleted]);

  useEffect(() => {
    setCompleted(getCompleted());
  }, [getCompleted, location.pathname, location.hash]);

  const activePartId = useMemo(() => {
    if (location.pathname === COAL_THEORY_OVERVIEW_PATH) {
      if (!location.hash) return null;
      const match = location.hash.match(/^#coal-part-(.+)$/);
      return match ? match[1] : null;
    }
    const part = getCoalPartForPath(location.pathname);
    return part ? part.id : null;
  }, [location.pathname, location.hash]);

  const [openPartId, setOpenPartId] = useState(
    activePartId || coalCourseParts[0]?.id || null,
  );

  useEffect(() => {
    if (activePartId) setOpenPartId(activePartId);
  }, [activePartId]);

  const togglePart = (id) => {
    setOpenPartId((current) => (current === id ? null : id));
  };

  return (
    <nav className="coal-folder-sidebar" aria-label="COAL theory course parts">
      <div className="coal-folder-sidebar-inner">
        <div className="coal-folder-sidebar-card">
          <p className="coal-folder-sidebar-kicker">Learning Path</p>
          <h2 className="coal-folder-sidebar-title">Course parts</h2>
          <p className="coal-folder-sidebar-copy">
            Open a part to see its topics, or click straight through.
          </p>
        </div>

        <div className="coal-folder-sidebar-folders">
          {coalCourseParts.map((part) => {
            const isOpen = openPartId === part.id;
            const isActivePart = activePartId === part.id;
            const doneCount = part.modules.filter((m) =>
              completed.includes(m.slug),
            ).length;
            const isPartDone =
              part.modules.length > 0 && doneCount === part.modules.length;

            return (
              <div
                key={part.id}
                className={`coal-folder-sidebar-folder${isOpen ? " is-open" : ""}${
                  isActivePart ? " is-active" : ""
                }`}
              >
                <button
                  type="button"
                  className="coal-folder-sidebar-folder-head"
                  onClick={() => togglePart(part.id)}
                  aria-expanded={isOpen}
                >
                  <span className="coal-folder-sidebar-folder-index">
                    {String(part.part).padStart(2, "0")}
                  </span>
                  <span className="coal-folder-sidebar-folder-copy">
                    <span className="coal-folder-sidebar-folder-label">
                      Part {part.part}
                    </span>
                    <span className="coal-folder-sidebar-folder-title">
                      {part.title}
                    </span>
                  </span>
                  <span className="coal-folder-sidebar-folder-meta">
                    {isPartDone ? (
                      <span
                        className="coal-folder-sidebar-folder-check"
                        title="All topics completed"
                      >
                        <Check size={13} />
                      </span>
                    ) : (
                      <span className="coal-folder-sidebar-folder-count">
                        {doneCount}/{part.modules.length}
                      </span>
                    )}
                    <ChevronDown
                      size={15}
                      className="coal-folder-sidebar-chevron"
                      aria-hidden="true"
                    />
                  </span>
                </button>

                <div className="coal-folder-sidebar-folder-body">
                  <div className="coal-folder-sidebar-folder-body-inner">
                    <Link
                      to={`${COAL_THEORY_OVERVIEW_PATH}#coal-part-${part.id}`}
                      className="coal-folder-sidebar-subitem coal-folder-sidebar-subitem-overview"
                    >
                      Part overview
                    </Link>
                    {part.modules.map((module) => {
                      const path = `/coal/${module.slug}`;
                      const isDone = completed.includes(module.slug);
                      return (
                        <NavLink
                          key={module.slug}
                          to={path}
                          className={({ isActive }) =>
                            `coal-folder-sidebar-subitem${
                              isActive ? " is-active" : ""
                            }${isDone ? " is-done" : ""}`
                          }
                        >
                          <span className="coal-folder-sidebar-subitem-dot" />
                          <span className="coal-folder-sidebar-subitem-label">
                            {module.title}
                          </span>
                          {isDone ? (
                            <Check
                              size={12}
                              className="coal-folder-sidebar-subitem-check"
                            />
                          ) : null}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="coal-folder-sidebar-footer">
          <Link to="/resources/coal" className="coal-folder-sidebar-home-btn">
            ← COAL home
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default CoalSidebar;