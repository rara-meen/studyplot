import Notification from "../models/Notification.js";

// Best-effort: a notification failing to save should never break the
// primary action (upload, save note, etc.) that triggered it.
export const notify = async (userId, message, type = "success") => {
  try {
    await Notification.create({ userId, message, type });
  } catch {
    // swallow — notifications are non-critical
  }
};
