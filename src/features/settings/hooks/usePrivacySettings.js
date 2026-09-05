import { useState } from "react";
import { getErrorMessage } from "../utils";

/**
 * New: privacy preferences. `publicProfile` is optimistic local state — wire
 * it up to a real `updatePrivacyPreferences(...)` call on the backend when
 * one exists. `handleExportData` is fully functional today: it builds a
 * JSON snapshot of the known profile fields and downloads it client-side.
 */
export default function usePrivacySettings({ user } = {}) {
  const [publicProfile, setPublicProfile] = useState(user?.publicProfile ?? true);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacyError, setPrivacyError] = useState("");

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const handleTogglePublicProfile = async () => {
    if (privacySaving) return;
    const next = !publicProfile;
    setPrivacyError("");
    setPublicProfile(next);
    setPrivacySaving(true);
    try {
      // TODO: replace with a real API call once the backend supports it.
      await new Promise((resolve) => setTimeout(resolve, 350));
    } catch (err) {
      setPublicProfile(!next);
      setPrivacyError(getErrorMessage(err, "Couldn't update your preference. Please try again."));
    } finally {
      setPrivacySaving(false);
    }
  };

  const handleExportData = async () => {
    setExportError("");
    setExporting(true);
    try {
      const payload = {
        name: user?.name || null,
        email: user?.email || null,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "account-data.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(getErrorMessage(err, "Couldn't prepare your data export. Please try again."));
    } finally {
      setExporting(false);
    }
  };

  return {
    publicProfile,
    privacySaving,
    privacyError,
    handleTogglePublicProfile,
    exporting,
    exportError,
    handleExportData,
  };
}
