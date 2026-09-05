import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function SettingsHeader({ user }) {
  return (
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
  );
}
