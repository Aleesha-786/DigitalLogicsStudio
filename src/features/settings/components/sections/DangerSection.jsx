import React from "react";
import { useAccountDeletion } from "../../hooks";

export default function DangerSection({ deleteAccount, navigate }) {
  const {
    showDeleteConfirm,
    setShowDeleteConfirm,
    deletePassword,
    setDeletePassword,
    deleteSaving,
    deleteError,
    handleDeleteAccount,
    handleCancel,
  } = useAccountDeletion({ deleteAccount, navigate });

  return (
    <div className="settings-panel">
      <header className="settings-panel-header">
        <h2>Danger Zone</h2>
        <p>Irreversible actions. Proceed carefully.</p>
      </header>

      <section className="settings-block settings-block-danger">
        <h3 className="settings-block-title">Delete Account</h3>
        <p className="settings-hint-text">
          Permanently delete your account, including all solved problems, progress, and
          activity history. This cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            type="button"
            className="settings-btn settings-btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete My Account
          </button>
        ) : (
          <form className="settings-form" onSubmit={handleDeleteAccount} noValidate>
            <label className="settings-field">
              <span>Enter your password to confirm</span>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </label>

            {deleteError && <p className="settings-error-text">{deleteError}</p>}

            <div className="settings-danger-actions">
              <button
                type="button"
                className="settings-btn settings-btn-ghost"
                disabled={deleteSaving}
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="settings-btn settings-btn-danger"
                disabled={deleteSaving}
              >
                {deleteSaving ? "Deleting…" : "Permanently Delete Account"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
