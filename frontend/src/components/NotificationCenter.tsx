import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { notifications, dismissNotification, isConnected } = useWebSocket();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'bg-green-500/10 dark:bg-green-500/10 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/10 dark:bg-yellow-500/10 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/10 dark:bg-red-500/10 border-red-500/30';
      default:
        return 'bg-blue-500/10 dark:bg-blue-500/10 border-blue-500/30';
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative" id="notification-trigger">
      {/* Notification Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition"
      >
        <Bell className="w-6 h-6 text-gray-900 dark:text-white" />

        {/* Connection Status Indicator */}
        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notification Panel - Rendered in Portal */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setIsOpen(false)}
              />

              {/* Notification Dropdown */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{ top: position.top, right: position.right }}
                className="fixed w-96 max-h-[600px] overflow-hidden bg-white dark:bg-gray-900 border border-gray-300 dark:border-white/10 rounded-xl shadow-2xl z-[9999]"
              >
              {/* Header */}
              <div className="p-4 border-b border-gray-300 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h3>
                    {isConnected && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-green-600 dark:text-green-400 font-semibold">Live</span>
                      </div>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => notifications.forEach(n => dismissNotification(n.id))}
                      className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}
              <div className="overflow-y-auto max-h-[500px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">No notifications yet</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      You'll receive live updates here
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`p-4 border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer group`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getIcon(notification.severity)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notification.id);
                            }}
                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded"
                          >
                            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                  <p className="text-center text-xs text-gray-600 dark:text-gray-400">
                    Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
      )}
    </div>
  );
}
