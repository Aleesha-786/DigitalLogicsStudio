import { useState } from "react";
import { getErrorMessage } from "../utils";

export default function useNotificationsToggle({
  emailNotificationsOptedOut,
  updateNotificationPreferences,
}) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    !emailNotificationsOptedOut
  );
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

  return { notificationsEnabled, notifSaving, notifError, handleToggleNotifications };
}
