import { toast } from "react-toastify";

/**
 * Centralized toast notifications.
 * Drop-in replacement for alert() calls across the app.
 */

export const showSuccess = (message) => {
  toast.success(message, { position: "top-right", autoClose: 3000 });
};

export const showError = (message) => {
  toast.error(message, { position: "top-right", autoClose: 5000 });
};

export const showWarning = (message) => {
  toast.warn(message, { position: "top-right", autoClose: 4000 });
};

export const showInfo = (message) => {
  toast.info(message, { position: "top-right", autoClose: 3000 });
};
