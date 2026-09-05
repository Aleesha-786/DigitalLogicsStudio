import React from "react";
import { Camera, X } from "lucide-react";
import { useProfileAvatar, useProfileName } from "../../hooks";
import { getInitials } from "../../utils";

export default function ProfileSection({ user, updateProfile }) {
  const {
    fileInputRef,
    avatarPreview,
    pendingAvatar,
    avatarSaving,
    avatarError,
    avatarSuccess,
    handlePickAvatar,
    handleAvatarChange,
    handleSaveAvatar,
    handleRemoveAvatar,
  } = useProfileAvatar({ user, updateProfile });

  const {
    name,
    handleNameChange,
    nameSaving,
    nameError,
    nameSuccess,
    nameChanged,
    handleSaveName,
  } = useProfileName({ user, updateProfile });

  const initials = getInitials(user?.name);

  return (
    <div className="settings-panel">
      <header className="settings-panel-header">
        <h2>Profile</h2>
        <p>Update your photo and how your name appears across the app.</p>
      </header>

      {/* Avatar */}
      <section className="settings-block">
        <h3 className="settings-block-title">Profile Photo</h3>
        <div className="settings-avatar-row">
          <div className="settings-avatar" aria-hidden={!avatarPreview}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="" className="settings-avatar-img" />
            ) : (
              <span className="settings-avatar-initials">{initials}</span>
            )}
          </div>

          <div className="settings-avatar-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="settings-file-input"
              aria-label="Upload profile photo"
            />
            <button
              type="button"
              className="settings-btn settings-btn-secondary"
              onClick={handlePickAvatar}
              disabled={avatarSaving}
            >
              <Camera size={16} aria-hidden="true" />
              <span>Choose Photo</span>
            </button>

            {avatarPreview && (
              <button
                type="button"
                className="settings-btn settings-btn-ghost"
                onClick={handleRemoveAvatar}
                disabled={avatarSaving}
              >
                <X size={16} aria-hidden="true" />
                <span>Remove</span>
              </button>
            )}

            {pendingAvatar && (
              <button
                type="button"
                className="settings-btn settings-btn-primary"
                onClick={handleSaveAvatar}
                disabled={avatarSaving}
              >
                {avatarSaving ? "Saving…" : "Save Photo"}
              </button>
            )}
          </div>
        </div>
        <p className="settings-hint-text">PNG, JPG, or GIF. Max 5MB.</p>
        {avatarError && <p className="settings-error-text">{avatarError}</p>}
        {avatarSuccess && !avatarError && (
          <p className="settings-success-text">{avatarSuccess}</p>
        )}
      </section>

      {/* Name */}
      <section className="settings-block">
        <h3 className="settings-block-title">Display Name</h3>
        <form className="settings-form" onSubmit={handleSaveName} noValidate>
          <label className="settings-field">
            <span>Full Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </label>

          {nameError && <p className="settings-error-text">{nameError}</p>}
          {nameSuccess && !nameError && (
            <p className="settings-success-text">{nameSuccess}</p>
          )}

          <button
            type="submit"
            className="settings-btn settings-btn-primary settings-btn-inline"
            disabled={nameSaving || !nameChanged}
          >
            {nameSaving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </section>

      {/* Email (read-only) */}
      <section className="settings-block">
        <h3 className="settings-block-title">Email Address</h3>
        <div className="settings-readonly-row">
          <span>{user?.email}</span>
          <span className="settings-readonly-tag">Contact support to change</span>
        </div>
      </section>
    </div>
  );
}
