import { Bell, Menu, User, Key, ChevronDown } from "lucide-react";
import ThemeToggle from '../ThemeToggle';
import { useState, useEffect, useRef } from "react";
import { useNotifications } from "./hooks/useNotifications";
import { NotificationPanel } from "./NotificationPanel";
import { NotificationToast } from "./NotificationToast";
import { apiService } from "./services/api";
import { notificationService } from "./services/notificationService";
import { AdminPasswordResetModal } from './modals/AdminPasswordResetModal';

function getViewName(view) {
  switch (view) {
    case "dashboard": return "Dashboard";
    case "documents": return "Documents View";
    case "upload": return "Upload Document";
    case "wallet": return "Wallet";
    case "billing": return "Billing";
    case "prompt": return "AI Prompt Helper";
    case "settings": return "Settings";
    default: return view;
  }
}

export function Header({ currentView, setIsMobileMenuOpen, userData, userRole, onOpenUserEditFromNotification, onRejectPasswordReset }) {
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [toastNotifications, setToastNotifications] = useState([]);
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification } = useNotifications();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [showAdminPasswordResetModal, setShowAdminPasswordResetModal] = useState(false);

  // ✅ Show toast for new notifications
  useEffect(() => {
    const lastNotification = notifications[0];
    if (lastNotification && !lastNotification.dismissed && !lastNotification.read) {
      const alreadyShown = toastNotifications.some(t => t.id === lastNotification.id);
      if (!alreadyShown) {
        setToastNotifications(prev => [...prev, lastNotification]);
      }
    }
  }, [notifications]);

  const handleDismissToast = (id) => {
    setToastNotifications(prev => prev.filter(n => n.id !== id));
  };

  // ✅ Handle password reset logic (technician/admin)
  const handleTechnicianPasswordReset = async () => {
    try {
      const response = await apiService.requestPasswordReset("User requested password reset");
      notificationService.addNotification(
        'success',
        'Request Submitted',
        'Your password reset request has been sent to your admin for approval.',
        null
      );
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Password reset error:', error);
      if (error.message.includes('already have a pending')) {
        const cancelRequest = window.confirm(
          'You already have a pending password reset request.\n\nWould you like to cancel the old request and submit a new one?'
        );
        if (cancelRequest) {
          try {
            await apiService.cancelMyPasswordResetRequest();
            await apiService.requestPasswordReset("User requested password reset");
            notificationService.addNotification(
              'success',
              'Request Submitted',
              'Your password reset request has been sent to your admin for approval.',
              null
            );
            setUserMenuOpen(false);
          } catch (retryError) {
            notificationService.addNotification(
              'error',
              'Request Failed',
              retryError.message || 'Failed to submit password reset request',
              null
            );
          }
        }
      } else {
        notificationService.addNotification(
          'error',
          'Request Failed',
          error.message || 'Failed to submit password reset request',
          null
        );
      }
    }
  };

  const handleAdminPasswordReset = () => {
    setUserMenuOpen(false);
    setShowAdminPasswordResetModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    apiService.removeToken();
    window.location.href = '/';
  };

  const adminPasswordResetHandlers = {
    requestOTP: async (email) => {
      await apiService.adminRequestPasswordResetOTP(email);
    },
    verifyAndReset: async (email, otp, password) => {
      await apiService.adminVerifyOTPAndResetPassword(email, otp, password);
    }
  };

  // ✅ Close user menu on outside click or Esc
  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setUserMenuOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [userMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-10 h-16 bg-white dark:bg-[#1E1E1E] border-b border-[#E5E8EC] dark:border-[#2A2A2A] flex items-center px-4 lg:px-6">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-[#F6F7F9] dark:hover:bg-[#262626] transition-all duration-150"
          >
            <Menu size={20} className="text-[#525A6B] dark:text-[#9CA3AF]" />
          </button>

          <nav className="flex items-center space-x-2 min-w-0">
            <span className="text-xl font-semibold text-[#1F2937] dark:text-[#F9FAFB] capitalize">
              {getViewName(currentView)}
            </span>
          </nav>
        </div>

        <div className="flex items-center space-x-3 lg:space-x-6 flex-shrink-0">
          <ThemeToggle />

          {/* 🔔 Notification Bell */}
          <button
            data-tour="notifications"
            onClick={() => setShowNotificationPanel(!showNotificationPanel)}
            className="relative p-2 rounded-lg hover:bg-[#F6F7F9] dark:hover:bg-[#262626] transition-all duration-150"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-[#525A6B] dark:text-[#9CA3AF]" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </button>

          <div className="h-6 w-px bg-[#E3E6EB] dark:bg-[#374151] hidden md:block"></div>

          {/* 👤 User Menu (style copied from first file) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-[#F6F7F9] dark:hover:bg-[#262626] transition"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <User size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left leading-tight hidden md:block">
                <div className="text-sm font-semibold text-[#1F2937] dark:text-[#F9FAFB]">
                  {userData?.owner_name || userData?.name || userData?.owner || "User"}
                </div>
                <div className="text-xs text-[#8C96A1] dark:text-[#9CA3AF]">
                  {userRole}
                </div>
              </div>
              <ChevronDown size={16} className="hidden md:block text-[#8C96A1]" />
            </button>

            {userMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-lg z-50 transform origin-top-right animate-in fade-in-80 scale-in-95"
                role="menu"
                aria-orientation="vertical"
              >
                <div className="py-2">
                  <button
                    onClick={() => {
                      if (userRole === 'Technician') handleTechnicianPasswordReset();
                      else handleAdminPasswordReset();
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                    role="menuitem"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300">
                      <Key size={14} />
                    </span>
                    <span className="flex-1">Reset Password</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 🔔 Notification Panel */}
      <NotificationPanel
        isOpen={showNotificationPanel}
        onClose={() => setShowNotificationPanel(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDismiss={dismissNotification}
        onRejectPasswordReset={onRejectPasswordReset}
        onOpenUserEdit={onOpenUserEditFromNotification}
      />

      {/* 🔐 Admin Password Reset Modal */}
      <AdminPasswordResetModal
        isOpen={showAdminPasswordResetModal}
        onClose={() => setShowAdminPasswordResetModal(false)}
        userEmail={userData?.email}
        onSubmit={adminPasswordResetHandlers}
        onLogout={handleLogout}
      />

      {/* 🪄 Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse items-end">
        {toastNotifications.map(notification => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onDismiss={handleDismissToast}
          />
        ))}
      </div>
    </>
  );
}
