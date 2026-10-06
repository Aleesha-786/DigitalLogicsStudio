import { useState } from "react";
import { getErrorMessage } from "../utils";

export default function usePasswordChange({ changePassword }) {
  const [currentPassword, setCurrentPasswordRaw] = useState("");
  const [newPassword, setNewPasswordRaw] = useState("");
  const [confirmPassword, setConfirmPasswordRaw] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Wrap each setter so typing in any field clears a stale error, matching
  // the original inline behavior.
  const withErrorClear = (setter) => (value) => {
    setter(value);
    setPasswordError((prev) => (prev ? "" : prev));
  };

  const setCurrentPassword = withErrorClear(setCurrentPasswordRaw);
  const setNewPassword = withErrorClear(setNewPasswordRaw);
  const setConfirmPassword = withErrorClear(setConfirmPasswordRaw);

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
      setCurrentPasswordRaw("");
      setNewPasswordRaw("");
      setConfirmPasswordRaw("");
    } catch (err) {
      setPasswordError(getErrorMessage(err, "Unable to update your password right now."));
    } finally {
      setPasswordSaving(false);
    }
  };

  return {
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
  };
}
