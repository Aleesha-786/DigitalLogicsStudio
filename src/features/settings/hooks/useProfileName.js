import { useMemo, useState } from "react";
import { getErrorMessage } from "../utils";

export default function useProfileName({ user, updateProfile }) {
  const [name, setName] = useState(user?.name || "");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");

  const nameChanged = useMemo(
    () => name.trim() !== (user?.name || "").trim(),
    [name, user?.name]
  );

  const handleNameChange = (value) => {
    setName(value);
    if (nameError) setNameError("");
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

  return {
    name,
    handleNameChange,
    nameSaving,
    nameError,
    nameSuccess,
    nameChanged,
    handleSaveName,
  };
}
