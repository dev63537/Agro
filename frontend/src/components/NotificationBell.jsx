import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/apiClient';
import { showSuccess, showError } from '../lib/toast';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 30) return 'just now';
  if (diffSec < 60) return `${diffSec} seconds ago`;
  if (diffMin < 60) return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
  if (diffHour < 24) return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ─── Bell Icon SVG ────────────────────────────────────────────────────────────

function BellIcon({ hasUnread }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-6 h-6 transition-colors duration-200 ${
        hasUnread ? 'stroke-amber-500' : 'stroke-gray-500'
      }`}
      aria-hidden="true"
    >
      <path stroke="currentColor" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path stroke="currentColor" d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

// ─── Single Notification Item ─────────────────────────────────────────────────

function NotificationItem({ notification, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: (id) => api.post(`/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleClick = () => {
    if (!notification.read) {
      markReadMutation.mutate(notification._id);
    }
    onClose();
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors duration-150 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        !notification.read ? 'bg-blue-50' : 'bg-white'
      }`}
    >
      {/* Icon */}
      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base select-none">
        {notification.icon || '🔔'}
      </span>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!notification.read ? 'font-semibold text-gray-800' : 'font-normal text-gray-700'}`}>
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(notification.createdAt)}</p>
      </div>

      {/* Unread dot */}
      {!notification.read && (
        <span className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full bg-blue-500" aria-label="Unread" />
      )}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const queryClient = useQueryClient();

  // ── Fetch notifications every 30s ──────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/api/notifications').then((res) => res.data),
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  // ── Mark all read ──────────────────────────────────────────────────────────
  const markAllReadMutation = useMutation({
    mutationFn: () => api.post('/api/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showSuccess('All notifications marked as read');
    },
    onError: () => {
      showError('Could not mark notifications as read');
    },
  });

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    markAllReadMutation.mutate();
  };

  // ── Outside click ──────────────────────────────────────────────────────────
  const handleOutsideClick = useCallback((e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open, handleOutsideClick]);

  // ── Escape key ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* ── Bell Button ──────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors duration-150"
      >
        <BellIcon hasUnread={unreadCount > 0} />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className="absolute top-0.5 right-0.5 min-w-[1.1rem] h-[1.1rem] px-0.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[0.6rem] font-bold leading-none select-none pointer-events-none"
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ───────────────────────────────────────────────── */}
      <div
        className={`fixed inset-x-4 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:mt-2 sm:w-96 card shadow-xl z-50 overflow-hidden
          transition-all duration-200 ease-out origin-top-right
          ${open ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
        role="dialog"
        aria-label="Notifications panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                {unreadCount}
              </span>
            )}
          </h3>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
              className="btn-ghost btn-sm text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {markAllReadMutation.isPending ? 'Marking…' : 'Mark all read'}
            </button>
          )}
        </div>

        {/* Body — scrollable list */}
        <div className="max-h-80 overflow-y-auto overscroll-contain divide-y divide-gray-50">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <span className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <span className="text-3xl mb-2" aria-hidden="true">🎉</span>
              <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onClose={() => setOpen(false)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex justify-center">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
