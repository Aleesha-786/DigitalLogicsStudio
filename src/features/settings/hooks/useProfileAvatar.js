import { useRef, useState } from "react";
import { getErrorMessage } from "../utils";

export default function useProfileAvatar({ user, updateProfile }) {
  const fileInputRef = useRef(null);

  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || null);
  const [pendingAvatar, setPendingAvatar] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");

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
    reader.onerror = () =>
      setAvatarError("Couldn't read that file. Please try another image.");
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

  return {
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
  };
}
