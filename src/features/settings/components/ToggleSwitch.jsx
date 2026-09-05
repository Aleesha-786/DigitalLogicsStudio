import React from "react";

/**
 * Shared on/off switch used by every toggle in Settings (dark mode, reduced
 * motion, notifications, public profile, 2FA...). Keeping one implementation
 * means one place to fix accessibility or styling issues.
 */
export default function ToggleSwitch({
  isOn,
  onClick,
  disabled = false,
  ariaLabel,
  labelOn = "On",
  labelOff = "Off",
  savingLabel,
}) {
  return (
    <button
      type="button"
      className={`settings-toggle${isOn ? " is-on" : ""}`}
      role="switch"
      aria-checked={isOn}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="settings-toggle-track">
        <span className="settings-toggle-thumb" />
      </span>
      <span className="settings-toggle-label">
        {disabled && savingLabel ? savingLabel : isOn ? labelOn : labelOff}
      </span>
    </button>
  );
}
