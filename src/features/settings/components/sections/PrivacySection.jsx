import React from "react";
import { Download } from "lucide-react";
import ToggleSwitch from "../ToggleSwitch";
import { usePrivacySettings } from "../../hooks";

/**
 * New section: lets users control leaderboard visibility and download a
 * copy of their account data. The export button works today (client-side
 * JSON download); the public-profile toggle is optimistic local state until
 * a backend endpoint exists — see usePrivacySettings for the TODO.
 */
export default function PrivacySection({ user }) {
  const {
    publicProfile,
    privacySaving,
    privacyError,
    handleTogglePublicProfile,
    exporting,
    exportError,
    handleExportData,
  } = usePrivacySettings({ user });

  return (
    <div className="settings-panel">
      <header className="settings-panel-header">
        <h2>Privacy</h2>
        <p>Control who can see your progress and export your data.</p>
      </header>

      <section className="settings-block">
        <div className="settings-item">
          <div>
            <h3>Public Profile</h3>
            <p>
              Let other learners see your solved-problem count and streak on the
              leaderboard.
            </p>
            {privacyError && <p className="settings-error-text">{privacyError}</p>}
          </div>
          <ToggleSwitch
            isOn={publicProfile}
            onClick={handleTogglePublicProfile}
            disabled={privacySaving}
            ariaLabel="Toggle public profile"
            savingLabel="Saving…"
          />
        </div>
      </section>

      <section className="settings-block">
        <h3 className="settings-block-title">Your Data</h3>
        <p className="settings-hint-text">
          Download a copy of your account details as a JSON file.
        </p>
        {exportError && <p className="settings-error-text">{exportError}</p>}
        <button
          type="button"
          className="settings-btn settings-btn-secondary settings-btn-inline"
          onClick={handleExportData}
          disabled={exporting}
        >
          <Download size={16} aria-hidden="true" />
          <span>{exporting ? "Preparing…" : "Export My Data"}</span>
        </button>
      </section>
    </div>
  );
}
