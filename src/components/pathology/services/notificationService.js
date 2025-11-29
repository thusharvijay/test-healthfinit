class NotificationService {
  constructor() {
    this.listeners = new Set();
    this.notifications = [];
    this.nextId = 1;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(listeners) {
    listeners.forEach(callback => callback(this.notifications));
  }

  addNotification(type, title, message, data) {  // ✅ Added data parameter
    const notification = {
      id: Date.now() + Math.random(),
      type: type,
      title: title,
      message: message,
      data: data || null,  // ✅ Use parameter with fallback
      timestamp: new Date().toISOString(),
      read: false,
      dismissed: false
    };

    this.notifications.unshift(notification);
    this.notify(this.listeners);
    return notification.id;
  }

  clearNotificationsByType(type) {
    this.notifications = this.notifications.filter(n => n.data?.type !== type);
    this.notify(this.listeners);
  }


  hasNotificationWithRequestId(requestId) {
    return this.notifications.some(n => n.data?.request_id === requestId);
  }

  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notify(this.listeners);
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.notify(this.listeners);
  }

  dismissNotification(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.dismissed = true;
      this.notify(this.listeners);
    }
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  getActiveNotifications() {
    return this.notifications.filter(n => !n.dismissed);
  }
}

export const notificationService = new NotificationService();