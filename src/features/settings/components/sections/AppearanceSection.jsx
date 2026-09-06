import React from "react";
import ToggleSwitch from "../ToggleSwitch";
import { useReducedMotion } from "../../hooks";

export default function AppearanceSection({ theme, toggleTheme }) {
  const { reducedMotion, toggleReducedMotion } = useReducedMotion();

  return (
    <div className="settings-panel">
      <header className="settings-panel-header">
        <h2>Appearance</h2>
        <p>Control how Digital Logics Studio looks and moves on this device.</p>
      </header>

      <section className="settings-block">
        <div className="settings-item">
          <div>
            <h3>Dark Mode</h3>
            <p>Switch between light and dark theme across the whole app.</p>
          </div>
          <ToggleSwitch
            isOn={theme === "dark"}
            onClick={toggleTheme}
            ariaLabel="Toggle dark mode"
            labelOn="Dark"
            labelOff="Light"
          />
        </div>
      </section>

      {/* New: reduced motion preference */}
      <section className="settings-block">
        <div className="settings-item">
          <div>
            <h3>Reduce Motion</h3>
            <p>Turn off non-essential animations and transitions in the app.</p>
          </div>
          <ToggleSwitch
            isOn={reducedMotion}
            onClick={toggleReducedMotion}
            ariaLabel="Toggle reduced motion"
          />
        </div>
      </section>
    </div>
  );
}
