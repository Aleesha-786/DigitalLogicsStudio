import React from "react";
import { ChevronRight } from "lucide-react";

/**
 * On desktop this renders as a compact icon+label nav rail. On mobile
 * (handled purely in CSS) it becomes a full-width tappable list with a
 * description line and a chevron, since on small screens it IS the main
 * screen the user sees first.
 */
export default function SettingsSidebar({ sections, activeSection, onSelect }) {
  return (
    <aside className="settings-sidebar">
      <nav className="settings-nav" aria-label="Settings sections">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              className={`settings-nav-item${isActive ? " is-active" : ""}${
                section.isDanger ? " is-danger" : ""
              }`}
              onClick={() => onSelect(section.id)}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} aria-hidden="true" className="settings-nav-icon" />
              <span className="settings-nav-text">
                <span className="settings-nav-label">{section.label}</span>
                {section.description && (
                  <span className="settings-nav-description">{section.description}</span>
                )}
              </span>
              <ChevronRight size={16} aria-hidden="true" className="settings-nav-chevron" />
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
