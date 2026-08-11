import React from "react";

/* ── Static always-open section for non-arena sidebar groups ──
   Memoized: onItemClick MUST be a stable (useCallback'd) reference from
   the parent, or this memoization is defeated and every accordion
   section re-renders (and its badges/active-states repaint) on every
   unrelated ProblemsPage state change — e.g. typing in the search box
   or flipping a filter chip. */
const SidebarAccordion = React.memo(function SidebarAccordion({
  section,
  activeItemLabel,
  onItemClick,
}) {
  return (
    <div className="sidebar-nav-section">
      <h4 className="sidebar-section-title">{section.title}</h4>
      <div className="sidebar-section-items">
        {section.items.map((item) => {
          const Icon = item.icon;
          const isActive = activeItemLabel === item.label;
          return (
            <button
              key={item.label}
              type="button"
              className={`problems-sidebar-link ${isActive ? "is-active" : ""}`}
              onClick={() => onItemClick(item)}
            >
              <span className="problems-sidebar-link-main">
                <Icon size={15} />
                <span>{item.label}</span>
              </span>
              {item.badge ? (
                <span
                  className={`problems-sidebar-link-badge badge-${item.badge.toLowerCase()}`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default SidebarAccordion;
