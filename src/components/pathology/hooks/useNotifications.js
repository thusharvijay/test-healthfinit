import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateNotifications = (newNotifications) => {
      setNotifications(newNotifications.filter(n => !n.dismissed));
      setUnreadCount(notificationService.getUnreadCount());
    };

    const unsubscribe = notificationService.subscribe(updateNotifications);
    
    // Initial load
    updateNotifications(notificationService.notifications);

    return unsubscribe;
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead: (id) => notificationService.markAsRead(id),
    markAllAsRead: () => notificationService.markAllAsRead(),
    dismissNotification: (id) => notificationService.dismissNotification(id)
  };
}