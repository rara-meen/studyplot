import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const formatNotification = (n) => ({
  id: n._id,
  message: n.message,
  type: n.type,
  isRead: n.isRead,
  createdAt: n.createdAt,
});

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount: notifications.filter((n) => !n.isRead).length,
    notifications: notifications.map(formatNotification),
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Please provide a valid notification ID.");
    error.statusCode = 400;
    throw error;
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    { $set: { isRead: true } },
    { new: true }
  );

  if (!notification) {
    const error = new Error("Notification not found.");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    notification: formatNotification(notification),
  });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read.",
  });
});

export const clearNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ userId: req.user.id });

  res.status(200).json({
    success: true,
    message: "Notifications cleared.",
  });
});
