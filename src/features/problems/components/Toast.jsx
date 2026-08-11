import React, { useEffect } from "react";
import "./Toast.css";

/**
 * Minimal, dependency-free toast. No toast library exists in this codebase
 * yet (checked — no react-toastify/react-hot-toast/etc.), so this is a
 * small standalone component rather than a new dependency.
 *
 * Usage:
 *   const [toast, setToast] = useState(null); // string | null
 *   <Toast message={toast} onDismiss={() => setToast(null)} />
 *
 * Auto-dismisses after `duration` ms; also dismissible by click.
 */
export default function Toast({ message, onDismiss, duration = 5000, tone = "error" }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div
      className={`app-toast app-toast--${tone}`}
      role="alert"
      onClick={onDismiss}
    >
      {message}
    </div>
  );
}

