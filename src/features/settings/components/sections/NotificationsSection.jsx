import React from "react";
import ToggleSwitch from "../ToggleSwitch";
import { useNotificationsToggle } from "../../hooks";

export default function NotificationsSection({
  emailNotificationsOptedOut,
  updateNotificationPreferences,
}) {
  const { notificationsEnabled, notifSaving, notifError, handleToggleNotifications } =
    useNotificationsToggle({ emailNotificationsOptedOut, updateNotificationPreferences });

  return (
    <div className="settings-panel">
      <header className="settings-panel-header">
        <h2>Notifications</h2>
        <p>Choose which emails you receive from Digital Logics Studio.</p>
      </header>

      <section className="settings-block">
        <div className="settings-item">
          <div>
            <h3>Email Notifications</h3>
            <p>
              Welcome email, milestone emails (5/10/25+ problems solved), a weekly
              progress digest, and a reminder if you've been away a while.
            </p>
            {notifError && <p className="settings-error-text">{notifError}</p>}
          </div>
          <ToggleSwitch
            isOn={notificationsEnabled}
            onClick={handleToggleNotifications}
            disabled={notifSaving}
            ariaLabel="Toggle email notifications"
            savingLabel="Saving…"
          />
        </div>
      </section>
    </div>
  );
}
