import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Check, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';

// Simple time ago function
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle
};

const iconColorMap = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
  warning: 'text-yellow-600 dark:text-yellow-400'
};

export function NotificationPanel({ 
  isOpen, 
  onClose, 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onDismiss,
  onApprovePasswordReset,
  onRejectPasswordReset,
  onOpenUserEdit
}) {
  const [processingRequest, setProcessingRequest] = useState(null);

  const handleApprove = async (notification) => {
    setProcessingRequest(notification.id);
    try {
      if (onOpenUserEdit && notification.data) {
        // Open edit user modal with password reset context
        onOpenUserEdit(notification.data.user_id, notification.data.request_id);
        onDismiss(notification.id);
      }
    } catch (error) {
      console.error('Error handling approval:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleReject = async (notification) => {
    setProcessingRequest(notification.id);
    try {
      if (onRejectPasswordReset && notification.data) {
        await onRejectPasswordReset(notification.data.request_id);
        onDismiss(notification.id);
      }
    } catch (error) {
      console.error('Error handling rejection:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-16 bottom-0 w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Notifications
          </h3>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <Info className="w-12 h-12 mb-3 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => {
                const Icon = iconMap[notification.type] || Info;
                const isPasswordReset = notification.data?.type === 'password_reset';
                const isProcessing = processingRequest === notification.id;
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColorMap[notification.type]}`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        
                        {notification.message && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {notification.message}
                          </p>
                        )}

                        {/* Password Reset Request Actions */}
                        {isPasswordReset && notification.data && (
                          <div className="mt-3 space-y-2">
                            {notification.data.reason && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded p-2">
                                <span className="font-medium">Reason:</span> {notification.data.reason}
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(notification)}
                                disabled={isProcessing}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-xs font-medium rounded transition-colors"
                              >
                                <UserCheck className="w-3 h-3" />
                                {isProcessing ? 'Processing...' : 'Approve & Reset'}
                              </button>
                              <button
                                onClick={() => handleReject(notification)}
                                disabled={isProcessing}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-medium rounded transition-colors"
                              >
                                <UserX className="w-3 h-3" />
                                {isProcessing ? 'Processing...' : 'Reject'}
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {getTimeAgo(notification.timestamp)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1">
                        {!notification.read && (
                          <button
                            onClick={() => onMarkAsRead(notification.id)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDismiss(notification.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          title="Dismiss"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}