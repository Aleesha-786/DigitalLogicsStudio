import React, { useState } from "react";
import ToggleSwitch from "../ToggleSwitch";
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

  // New: two-factor authentication. Local-only placeholder until the
  // backend exposes real enroll/verify endpoints.
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <div className="settings-panel">
      <header className="settings-panel-header">
        <h2>Security</h2>
        <p>Change your password and manage sign-in protection.</p>
      </header>

      <section className="settings-block">
        <div className="settings-item">
          <div>
            <h3>Two-Factor Authentication</h3>
            <p>Require a one-time code from your authenticator app when you sign in.</p>
          </div>
          <ToggleSwitch
            isOn={twoFactorEnabled}
            onClick={() => setTwoFactorEnabled((prev) => !prev)}
            ariaLabel="Toggle two-factor authentication"
          />
        </div>
        {twoFactorEnabled && (
          <p className="settings-hint-text">
            We'll email you setup instructions shortly — two-factor authentication is
            rolling out gradually.
          </p>
        )}
      </section>

      <section className="settings-block">
        <h3 className="settings-block-title">Change Password</h3>
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
