import React from "react";
import { X } from "lucide-react";

export const FloatingPanel = ({ title, icon: Icon, onClose, className = "", children }) => (
  <div
    className={`floating-panel ${className}`}
    onMouseDown={(e) => e.stopPropagation()}
    onTouchStart={(e) => e.stopPropagation()}
  >
    <div className="floating-panel-header">
      <span className="floating-panel-title">
        {Icon && <Icon size={14} strokeWidth={2} />}
        {title}
      </span>
      <button className="floating-panel-close" onClick={onClose} title="Close" aria-label="Close">
        <X size={14} strokeWidth={2.5} />
      </button>
    </div>
    <div className="floating-panel-body">{children}</div>
  </div>
);
