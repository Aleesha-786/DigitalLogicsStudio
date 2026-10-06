import { useState } from "react";
import { getErrorMessage } from "../utils";

export default function useAccountDeletion({ deleteAccount, navigate }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePasswordRaw] = useState("");
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const setDeletePassword = (value) => {
    setDeletePasswordRaw(value);
    if (deleteError) setDeleteError("");
  };

  const handleCancel = () => {
    setShowDeleteConfirm(false);
    setDeletePasswordRaw("");
    setDeleteError("");
  };

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

  return {
    showDeleteConfirm,
    setShowDeleteConfirm,
    deletePassword,
    setDeletePassword,
    deleteSaving,
    deleteError,
    handleDeleteAccount,
    handleCancel,
  };
}
