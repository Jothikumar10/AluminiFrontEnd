import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  BriefcaseBusiness,
  CalendarDays,
  Heart,
  MessageCircle,
  MessageSquare,
  RefreshCw,
  UserPlus,
  Users,
  GraduationCap,
  Megaphone,
  Info,
  Handshake,
  X,
} from "lucide-react";

import api from "../../api/axios";

const notificationIcons = {
  like: Heart,
  comment: MessageCircle,
  comment_like: MessageSquare,
  connection_request: UserPlus,
  connection_accepted: Users,
  job: BriefcaseBusiness,
  application: BriefcaseBusiness,
  mentorship: GraduationCap,
  event: CalendarDays,
  announcement: Megaphone,
  message: MessageCircle,
  system: Info,
};

const notificationIconStyles = {
  like: "bg-red-50 text-red-500",
  comment: "bg-blue-50 text-blue-600",
  comment_like: "bg-purple-50 text-purple-600",
  connection_request: "bg-indigo-50 text-indigo-600",
  connection_accepted: "bg-green-50 text-green-600",
  job: "bg-orange-50 text-orange-600",
  application: "bg-cyan-50 text-cyan-600",
  mentorship: "bg-pink-50 text-pink-600",
  event: "bg-amber-50 text-amber-600",
  announcement: "bg-violet-50 text-violet-600",
  message: "bg-sky-50 text-sky-600",
  system: "bg-slate-100 text-slate-600",
};

function getInitials(name) {
  if (!name) {
    return "AC";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatRelativeTime(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const difference = now.getTime() - date.getTime();

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getNotificationIcon(type) {
  return notificationIcons[type] || Bell;
}

function getNotificationIconStyle(type) {
  return (
    notificationIconStyles[type] ||
    "bg-slate-100 text-slate-600"
  );
}

function getSenderName(notification) {
  if (notification?.sender?.name) {
    return notification.sender.name;
  }

  return "AlumniConnect";
}

function getSenderInitials(notification) {
  if (notification?.sender?.name) {
    return getInitials(notification.sender.name);
  }

  return "AC";
}

function getNotificationMessage(notification) {
  if (notification?.message) {
    return notification.message;
  }

  return "You have a new notification.";
}

function NotificationAvatar({ notification }) {
  const sender = notification?.sender;

  if (sender?.profileImage) {
    return (
      <img
        src={sender.profileImage}
        alt={sender.name || "User"}
        className="h-11 w-11 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
      {getSenderInitials(notification)}
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkAsRead,
  markingId,
}) {
  const Icon = getNotificationIcon(notification?.type);

  const iconStyle = getNotificationIconStyle(
    notification?.type
  );

  const isRead = Boolean(notification?.isRead);

  const handleClick = () => {
    if (!isRead && notification?._id) {
      onMarkAsRead(notification._id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      className={`group relative flex gap-4 border-b border-slate-100 px-4 py-4 transition sm:px-6 ${
        !isRead
          ? "cursor-pointer bg-indigo-50/50 hover:bg-indigo-50"
          : "bg-white hover:bg-slate-50"
      }`}
    >
      {!isRead && (
        <span className="absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-indigo-600 sm:left-2" />
      )}

      <div className="relative shrink-0">
        <NotificationAvatar notification={notification} />

        <div
          className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white ${iconStyle}`}
        >
          <Icon size={12} strokeWidth={2.5} />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h3
              className={`text-sm ${
                !isRead
                  ? "font-bold text-slate-900"
                  : "font-semibold text-slate-800"
              }`}
            >
              {notification?.title || "Notification"}
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {getNotificationMessage(notification)}
            </p>
          </div>

          <span className="shrink-0 text-xs text-slate-400">
            {formatRelativeTime(notification?.createdAt)}
          </span>
        </div>

        {notification?.sender?.role && (
          <div className="mt-2 text-xs font-medium capitalize text-slate-400">
            {notification.sender.role}
          </div>
        )}

        {!isRead && (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-indigo-600">
            {markingId === notification?._id ? (
              <>
                <RefreshCw
                  size={13}
                  className="animate-spin"
                />
                Marking as read...
              </>
            ) : (
              <>
                <Check size={13} />
                Click to mark as read
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EmptyNotifications() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
        <Bell
          size={34}
          strokeWidth={1.8}
          className="text-indigo-600"
        />
      </div>

      <h2 className="mt-5 text-xl font-bold text-slate-900">
        No notifications yet
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        When someone likes or comments on your post, sends
        a connection request, or interacts with you, you will
        see the notification here.
      </p>
    </div>
  );
}

function LoadingNotifications() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex gap-4 border-b border-slate-100 px-4 py-5 sm:px-6"
        >
          <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-slate-200" />

          <div className="flex-1 space-y-3">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-full max-w-md animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <X size={30} className="text-red-500" />
      </div>

      <h2 className="mt-4 text-lg font-bold text-slate-900">
        Unable to load notifications
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {message ||
          "Something went wrong while loading your notifications."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        <RefreshCw size={16} />
        Try Again
      </button>
    </div>
  );
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [markingId, setMarkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(
    async (showRefreshState = false) => {
      try {
        if (showRefreshState) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const [notificationsResponse, unreadResponse] =
          await Promise.all([
            api.get("/notifications"),
            api.get("/notifications/unread-count"),
          ]);

        const notificationData =
          notificationsResponse?.data?.data;

        const countData = unreadResponse?.data?.data?.count;

        setNotifications(
          Array.isArray(notificationData)
            ? notificationData
            : []
        );

        setUnreadCount(
          typeof countData === "number" ? countData : 0
        );
      } catch (requestError) {
        console.error(
          "Load notifications error:",
          requestError
        );

        setError(
          requestError?.response?.data?.message ||
            "Failed to load notifications."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    if (!notificationId || markingId) {
      return;
    }

    try {
      setMarkingId(notificationId);

      await api.patch(
        `/notifications/${notificationId}/read`
      );

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification?._id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );

      setUnreadCount((currentCount) =>
        Math.max(0, currentCount - 1)
      );
    } catch (requestError) {
      console.error(
        "Mark notification as read error:",
        requestError
      );
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (markingAll || unreadCount === 0) {
      return;
    }

    try {
      setMarkingAll(true);

      await api.patch("/notifications/read-all");

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (requestError) {
      console.error(
        "Mark all notifications as read error:",
        requestError
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const handleRefresh = () => {
    loadNotifications(true);
  };

  const unreadNotifications = useMemo(() => {
    return notifications.filter(
      (notification) => !notification?.isRead
    );
  }, [notifications]);

  const readNotifications = useMemo(() => {
    return notifications.filter(
      (notification) => notification?.isRead
    );
  }, [notifications]);

  return (
    <main className="min-h-[calc(100vh-72px)] bg-slate-50 py-6 sm:py-8">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Bell size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Notifications
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Stay updated with your AlumniConnect activity.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing ? "animate-spin" : ""
                }
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={markingAll || unreadCount === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <CheckCheck size={16} />

              {markingAll
                ? "Marking..."
                : "Mark all as read"}
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {notifications.length}
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
              Unread
            </p>

            <p className="mt-1 text-2xl font-bold text-indigo-700">
              {unreadCount}
            </p>
          </div>

          <div className="hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:block">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Read
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {readNotifications.length}
            </p>
          </div>
        </motion.div>

        {/* Main notification card */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          {loading ? (
            <LoadingNotifications />
          ) : error ? (
            <ErrorState
              message={error}
              onRetry={() => loadNotifications()}
            />
          ) : notifications.length === 0 ? (
            <EmptyNotifications />
          ) : (
            <>
              {/* Unread section */}
              {unreadNotifications.length > 0 && (
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-600" />

                      <h2 className="text-sm font-bold text-slate-800">
                        New
                      </h2>
                    </div>

                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">
                      {unreadNotifications.length}
                    </span>
                  </div>

                  <div>
                    {unreadNotifications.map(
                      (notification) => (
                        <NotificationItem
                          key={notification?._id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                          markingId={markingId}
                        />
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Read section */}
              {readNotifications.length > 0 && (
                <div>
                  {unreadNotifications.length > 0 && (
                    <div className="border-t border-slate-200" />
                  )}

                  <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-6">
                    <h2 className="text-sm font-bold text-slate-800">
                      Earlier
                    </h2>
                  </div>

                  <div>
                    {readNotifications.map(
                      (notification) => (
                        <NotificationItem
                          key={notification?._id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                          markingId={markingId}
                        />
                      )
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.section>
      </div>
    </main>
  );
}