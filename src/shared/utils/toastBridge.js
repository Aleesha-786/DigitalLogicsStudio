// src/shared/utils/toastBridge.js
//
// Lets plain JS modules (apiClient.js, authService.js, circuitMindService.js,
// etc.) fire toasts without needing the useToast() hook. ToastProvider wires
// itself into this bridge on every render, so it "just works" once mounted.
//
//   import { notify } from "../utils/toastBridge";
//   notify.error("Session expired. Please log in again.");

let toastRef = null;

export function setToastBridge(instance) {
  toastRef = instance;
}

function fallback(message) {
  // ToastProvider hasn't mounted yet (e.g. a very early boot-time error).
  // Log instead of blocking the UI with alert().
  // eslint-disable-next-line no-console
  console.warn("[toast] ToastProvider not mounted yet:", message);
}

export const notify = {
  info: (message, options) => (toastRef ? toastRef.info(message, options) : fallback(message)),
  success: (message, options) => (toastRef ? toastRef.success(message, options) : fallback(message)),
  warning: (message, options) => (toastRef ? toastRef.warning(message, options) : fallback(message)),
  error: (message, options) => (toastRef ? toastRef.error(message, options) : fallback(message)),
};

export default notify;
