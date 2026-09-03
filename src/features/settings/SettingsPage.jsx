import React, { useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Camera,
  X,
  Palette,
  Bell,
  ShieldCheck,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import Navbar from "../../shared/components/navbar";
import Footer from "../../shared/components/Footer";
import { useTheme } from "../../shared/context/ThemeContext";
import { useAuth } from "../../auth/context/AuthContext";
import "./Settings.css";

function getErrorMessage(error, fallback) {
  const isNetworkError = !error.response && !error.status;
  if (isNetworkError) {
    return "Cannot reach the server. Please check your connection and try again.";
  }
  return error.message || fallback;
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "danger", label: "Danger Zone", icon: Trash2, isDanger: true },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();
  const {
    user,
    emailNotificationsOptedOut,
    updateNotificationPreferences,
    changePassword,
    deleteAccount,
    updateProfile,
  } = useAuth();

  const [activeSection, setActiveSection] = useState("profile");

  return (
    <div className="settings-page-shell">
      <div className="grid-background" />
      <Navbar toggleTheme={toggleTheme} theme={theme} />

      <main className="settings-page-main">
        <div className="settings-page-header">
          <Link to="/profile" className="settings-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to Profile</span>
          </Link>
          <h1>Account Settings</h1>
          <p>
            Signed in as <strong>{user?.name || "User"}</strong> ({user?.email})
          </p>
        </div>

        <div className="settings-shell">
          <aside className="settings-sidebar">
            <nav className="settings-nav" aria-label="Settings sections">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`settings-nav-item${isActive ? " is-active" : ""}${
                      section.isDanger ? " is-danger" : ""
                    }`}
                    onClick={() => setActiveSection(section.id)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="settings-content">
            {activeSection === "profile" && (
              <ProfileSection user={user} updateProfile={updateProfile} />
            )}
            {activeSection === "appearance" && (
              <AppearanceSection theme={theme} toggleTheme={toggleTheme} />
            )}
            {activeSection === "notifications" && (
              <NotificationsSection
                emailNotificationsOptedOut={emailNotificationsOptedOut}
                updateNotificationPreferences={updateNotificationPreferences}
              />
            )}
            {activeSection === "security" && (
              <SecuritySection changePassword={changePassword} />
            )}
            {activeSection === "danger" && (
              <DangerSection deleteAccount={deleteAccount} navigate={navigate} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ── Profile: avatar + display name ─────────────────────────────────────── */

function ProfileSection({ user, updateProfile }) {
  const fileInputRef = useRef(null);

  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || null);
  const [pendingAvatar, setPendingAvatar] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");

  const [name, setName] = useState(user?.name || "");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");

  const initials = useMemo(() => getInitials(user?.name), [user?.name]);
  const nameChanged = name.trim() !== (user?.name || "").trim();

  const handlePickAvatar = () => fileInputRef.current?.click();

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setAvatarError("");
    setAvatarSuccess("");

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file (PNG, JPG, or GIF).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
      setPendingAvatar(true);
    };
    reader.onerror = () => setAvatarError("Couldn't read that file. Please try another image.");
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    setAvatarSaving(true);
    setAvatarError("");
    setAvatarSuccess("");
    try {
      await updateProfile({ avatarDataUrl: avatarPreview });
      setPendingAvatar(false);
      setAvatarSuccess("Profile photo updated.");
    } catch (err) {
      setAvatarError(getErrorMessage(err, "Couldn't update your photo. Please try again."));
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarSaving(true);
    setAvatarError("");
    setAvatarSuccess("");
    try {
      await updateProfile({ avatarDataUrl: null });
      setAvatarPreview(null);
      setPendingAvatar(false);
      setAvatarSuccess("Profile photo removed.");
    } catch (err) {
      setAvatarError(getErrorMessage(err, "Couldn't remove your photo. Please try again."));
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleSaveName = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    setNameError("");
    setNameSuccess("");

    if (trimmed.length < 2) {
      setNameError("Name must be at least 2 characters long.");
      return;
    }
    if (!nameChanged) return;

    setNameSaving(true);
    try {
      await updateProfile({ name: trimmed });
      setNameSuccess("Name updated successfully.");
    } catch (err) {
      setNameError(getErrorMessage(err, "Couldn't update your name. Please try again."));
    } finally {
      setNameSaving(false);
    }
  };

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
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
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

/* ── Appearance ────────────────────────────────────────────────────────── */

function AppearanceSection({ theme, toggleTheme }) {
  return (
    <div className="settings-panel">
      <header className="settings-panel-header">
        <h2>Appearance</h2>
        <p>Control how Digital Logics Studio looks on this device.</p>
      </header>

      <section className="settings-block">
        <div className="settings-item">
          <div>
            <h3>Dark Mode</h3>
            <p>Switch between light and dark theme across the whole app.</p>
          </div>
          <button
            type="button"
            className={`settings-toggle${theme === "dark" ? " is-on" : ""}`}
            role="switch"
            aria-checked={theme === "dark"}
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
          >
            <span className="settings-toggle-track">
              <span className="settings-toggle-thumb" />
            </span>
            <span className="settings-toggle-label">
              {theme === "dark" ? "Dark" : "Light"}
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}

/* ── Notifications ─────────────────────────────────────────────────────── */

function NotificationsSection({ emailNotificationsOptedOut, updateNotificationPreferences }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(!emailNotificationsOptedOut);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifError, setNotifError] = useState("");

  const handleToggleNotifications = async () => {
    if (notifSaving) return;
    const nextEnabled = !notificationsEnabled;
    setNotifError("");
    setNotificationsEnabled(nextEnabled);
    setNotifSaving(true);
    try {
      await updateNotificationPreferences(!nextEnabled);
    } catch (err) {
      setNotificationsEnabled(!nextEnabled);
      setNotifError(getErrorMessage(err, "Couldn't update your preference. Please try again."));
    } finally {
      setNotifSaving(false);
    }
  };

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
          <button
            type="button"
            className={`settings-toggle${notificationsEnabled ? " is-on" : ""}`}
            role="switch"
            aria-checked={notificationsEnabled}
            aria-label="Toggle email notifications"
            disabled={notifSaving}
            onClick={handleToggleNotifications}
          >
            <span className="settings-toggle-track">
              <span className="settings-toggle-thumb" />
            </span>
            <span className="settings-toggle-label">
              {notifSaving ? "Saving…" : notificationsEnabled ? "On" : "Off"}
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}

/* ── Security ──────────────────────────────────────────────────────────── */

function SecuritySection({ changePassword }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError("New password must be different from your current password.");
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(getErrorMessage(err, "Unable to update your password right now."));
    } finally {
      setPasswordSaving(false);
    }
  };

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
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          <label className="settings-field">
            <span>New Password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
          </label>

          <label className="settings-field">
            <span>Confirm New Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
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

/* ── Danger Zone ───────────────────────────────────────────────────────── */

function DangerSection({ deleteAccount, navigate }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    setDeleteError("");

    if (!deletePassword) {
      setDeleteError("Please enter your password to confirm.");
      return;
    }

    setDeleteSaving(true);
    try {
      await deleteAccount(deletePassword);
      navigate("/", { replace: true });
    } catch (err) {
      setDeleteError(getErrorMessage(err, "Unable to delete your account right now."));
      setDeleteSaving(false);
    }
  };

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
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  if (deleteError) setDeleteError("");
                }}
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
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword("");
                  setDeleteError("");
                }}
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
