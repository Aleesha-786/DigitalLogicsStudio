import React from "react";
import { ChevronLeft } from "lucide-react";

/**
 * Shown only on mobile, inside the main panel, once a section has been
 * opened. Lets the user get back to the section list without a browser
 * back-button dependency.
 */
export default function MainPanelHeader({ title, onBack }) {
  return (
    <div className="settings-main-header">
      <button type="button" className="settings-mobile-back" onClick={onBack}>
        <ChevronLeft size={18} aria-hidden="true" />
        <span>All settings</span>
      </button>
      {title && <span className="settings-main-header-title">{title}</span>}
    </div>
  );
}
