// Small, pure display-formatting helpers shared across the Settings feature.

export function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getErrorMessage(error, fallback) {
  const isNetworkError = !error?.response && !error?.status;
  if (isNetworkError) {
    return "Cannot reach the server. Please check your connection and try again.";
  }
  return error?.message || fallback;
}
