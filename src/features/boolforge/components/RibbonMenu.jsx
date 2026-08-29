import React from "react";
import { ChevronDown } from "lucide-react";

// ─── RibbonMenu ─────────────────────────────────────────────────────────────
// A single ribbon dropdown trigger + panel. Open/close state and the
// outside-click / Escape handling live in the parent (ToolbarRibbon) via a
// single shared listener — this component is purely presentational and
// controlled.
export const RibbonMenu = ({ label, icon: Icon, isOpen, onToggle, children, wide = false, badge }) => (
  <div className="ribbon-dropdown">
    <button
      type="button"
      className={`ribbon-button ribbon-button--menu${isOpen ? " ribbon-button--active" : ""}`}
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-haspopup="true"
    >
      {Icon && <Icon size={15} strokeWidth={2} className="ribbon-btn-icon" />}
      <span>{label}</span>
      {badge != null && <span className="ribbon-badge">{badge}</span>}
      <ChevronDown size={13} strokeWidth={2.5} className="ribbon-chevron" />
    </button>
    {isOpen && (
      <div className={`ribbon-dropdown-content${wide ? " ribbon-dropdown-content--wide" : ""}`}>
        {children}
      </div>
    )}
  </div>
);

// ─── RibbonMenuSection ──────────────────────────────────────────────────────
export const RibbonMenuSection = ({ title, children }) => (
  <div className="ribbon-menu-section">
    {title && <div className="ribbon-menu-section-title">{title}</div>}
    {children}
  </div>
);

// ─── RibbonMenuItem ─────────────────────────────────────────────────────────
// A clickable row: icon, label (+ optional small description), and an
// optional trailing element (badge, checkmark, shortcut hint, etc).
export const RibbonMenuItem = ({
  icon: Icon,
  label,
  description,
  onClick,
  disabled = false,
  danger = false,
  active = false,
  trailing,
}) => (
  <button
    type="button"
    className={[
      "ribbon-menu-item",
      disabled ? "ribbon-menu-item--disabled" : "",
      danger ? "ribbon-menu-item--danger" : "",
      active ? "ribbon-menu-item--active" : "",
    ]
      .filter(Boolean)
      .join(" ")}
    onClick={onClick}
    disabled={disabled}
  >
    {Icon && <Icon size={16} strokeWidth={2} className="ribbon-menu-item-icon" />}
    <span className="ribbon-menu-item-text">
      <span className="ribbon-menu-item-label">{label}</span>
      {description && <span className="ribbon-menu-item-desc">{description}</span>}
    </span>
    {trailing != null && <span className="ribbon-menu-item-trailing">{trailing}</span>}
  </button>
);

export const RibbonMenuDivider = () => <div className="ribbon-menu-divider" />;

// Small "Soon" pill for features that are visible but not wired up yet.
export const SoonBadge = () => <span className="ribbon-soon-badge">Soon</span>;
