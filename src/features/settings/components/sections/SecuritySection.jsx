import React from "react";
import { usePasswordChange } from "../../hooks";

export default function SecuritySection({ changePassword }) {
  const {
    currentPassword,
    newPassword,
    confirmPassword,
    passwordSaving,
    passwordError,
    passwordSuccess,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    handleChangePassword,
  } = usePasswordChange({ changePassword });

  return (
    <div className="settings-panel">
      <header className="settings-panel-header">
        <h2>Security</h2>
        <p>Change the password used to log in.</p>
      </header>

      <section className="settings-block">
        <form className="settings-form" onSubmit={handleChangePassword} noValidate>
          <label className="settings-field">
            <span>Current Password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          <label className="settings-field">
            <span>New Password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
          </label>

          <label className="settings-field">
            <span>Confirm New Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Re-enter new password"
            />
          </label>

          {passwordError && <p className="settings-error-text">{passwordError}</p>}
          {passwordSuccess && !passwordError && (
            <p className="settings-success-text">{passwordSuccess}</p>
          )}

          <button
            type="submit"
            className="settings-btn settings-btn-primary settings-btn-inline"
            disabled={passwordSaving}
          >
            {passwordSaving ? "Updating…" : "Update Password"}
          </button>
        </form>
      </section>
    </div>
  );
}
