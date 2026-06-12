/**
 * EcoSignal - Local Storage Management
 * ═════════════════════════════════════════════════════════
 */

const STORAGE_KEYS = {
    REPORTS: 'ecosignal_reports',
    NOTIFICATIONS: 'ecosignal_notifications',
    SETTINGS: 'ecosignal_settings',
    USER_LOCATION: 'ecosignal_user_location'
};

/**
 * Save report to localStorage
 */
export function saveReport(report) {
    try {
        let reports = getReports();
        reports.push({
            ...report,
            id: report.code,
            createdAt: new Date().toISOString(),
            status: 'received'
        });
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
        return true;
    } catch (error) {
        console.error('Error saving report:', error);
        return false;
    }
}

/**
 * Get all reports
 */
export function getReports() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting reports:', error);
        return [];
    }
}

/**
 * Get report by tracking code
 */
export function getReportByCode(code) {
    const reports = getReports();
    return reports.find(r => r.code === code.toUpperCase());
}

/**
 * Update report status
 */
export function updateReportStatus(code, status) {
    try {
        let reports = getReports();
        const index = reports.findIndex(r => r.code === code.toUpperCase());
        if (index !== -1) {
            reports[index].status = status;
            reports[index].updatedAt = new Date().toISOString();
            localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating report:', error);
        return false;
    }
}

/**
 * Delete report
 */
export function deleteReport(code) {
    try {
        let reports = getReports();
        reports = reports.filter(r => r.code !== code.toUpperCase());
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
        return true;
    } catch (error) {
        console.error('Error deleting report:', error);
        return false;
    }
}

/**
 * Save notification
 */
export function saveNotification(notification) {
    try {
        let notifications = getNotifications();
        notifications.unshift({
            ...notification,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            read: false
        });
        // Keep only last 50 notifications
        if (notifications.length > 50) {
            notifications = notifications.slice(0, 50);
        }
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
        return true;
    } catch (error) {
        console.error('Error saving notification:', error);
        return false;
    }
}

/**
 * Get all notifications
 */
export function getNotifications() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting notifications:', error);
        return [];
    }
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(notificationId) {
    try {
        let notifications = getNotifications();
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return false;
    }
}

/**
 * Get unread notifications count
 */
export function getUnreadNotificationsCount() {
    const notifications = getNotifications();
    return notifications.filter(n => !n.read).length;
}

/**
 * Clear all notifications
 */
export function clearNotifications() {
    try {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
        return true;
    } catch (error) {
        console.error('Error clearing notifications:', error);
        return false;
    }
}

/**
 * Save settings
 */
export function saveSettings(settings) {
    try {
        const currentSettings = getSettings();
        const updatedSettings = { ...currentSettings, ...settings };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

/**
 * Get settings
 */
export function getSettings() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return data ? JSON.parse(data) : {
            theme: 'light',
            notifications: true,
            language: 'fr'
        };
    } catch (error) {
        console.error('Error getting settings:', error);
        return {};
    }
}

/**
 * Save user location
 */
export function saveUserLocation(location) {
    try {
        localStorage.setItem(STORAGE_KEYS.USER_LOCATION, JSON.stringify({
            ...location,
            timestamp: new Date().toISOString()
        }));
        return true;
    } catch (error) {
        console.error('Error saving location:', error);
        return false;
    }
}

/**
 * Get user location
 */
export function getUserLocation() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.USER_LOCATION);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting location:', error);
        return null;
    }
}

/**
 * Clear all data (reset app)
 */
export function clearAllData() {
    try {
        localStorage.removeItem(STORAGE_KEYS.REPORTS);
        localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        localStorage.removeItem(STORAGE_KEYS.USER_LOCATION);
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        return false;
    }
}

/**
 * Export all data as JSON
 */
export function exportAllData() {
    return {
        reports: getReports(),
        notifications: getNotifications(),
        settings: getSettings(),
        location: getUserLocation(),
        exportDate: new Date().toISOString()
    };
}
