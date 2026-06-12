/**
 * EcoSignal - Notifications Management
 * ═════════════════════════════════════════════════════════
 */

import {
    saveNotification,
    getNotifications,
    getUnreadNotificationsCount,
    markNotificationAsRead
} from './storage.js';

/**
 * Create a toast notification
 */
export function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-enter ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    const icon = getToastIcon(type);
    toast.innerHTML = `
        ${icon}
        <span>${message}</span>
        <button class="toast-close" aria-label="Fermer">&times;</button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    setTimeout(() => removeToast(toast), duration);
}

/**
 * Get icon for toast type
 */
function getToastIcon(type) {
    const icons = {
        success: '<i class="fas fa-check-circle"></i>',
        error: '<i class="fas fa-exclamation-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>',
        info: '<i class="fas fa-info-circle"></i>'
    };
    return icons[type] || icons.info;
}

/**
 * Remove toast notification
 */
function removeToast(toast) {
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
}

/**
 * Create and store a notification
 */
export function createNotification(title, message, type = 'info') {
    const notification = {
        title,
        message,
        type,
        createdAt: new Date().toISOString()
    };
    saveNotification(notification);
    updateNotificationBadge();
    return notification;
}

/**
 * Create report notification
 */
export function createReportNotification(code, type = 'received') {
    const messages = {
        received: {
            title: 'Signalement reçu',
            message: `Votre signalement ${code} a été enregistré avec succès.`
        },
        processing: {
            title: 'Signalement en cours',
            message: `Votre signalement ${code} est en cours de traitement.`
        },
        resolved: {
            title: 'Signalement résolu',
            message: `Votre signalement ${code} a été résolu.`
        }
    };

    const msg = messages[type] || messages.received;
    return createNotification(msg.title, msg.message, 'info');
}

/**
 * Display notifications list
 */
export function displayNotifications() {
    const notifications = getNotifications();
    const notificationsList = document.getElementById('notifications-list');
    const emptyState = document.getElementById('notifications-empty');

    if (!notificationsList) return;

    if (notifications.length === 0) {
        notificationsList.innerHTML = '';
        emptyState?.classList.remove('hidden');
        return;
    }

    emptyState?.classList.add('hidden');
    notificationsList.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.read ? 'read' : ''}" data-id="${notif.id}">
            <div class="notification-title">${notif.title}</div>
            <div class="notification-message">${notif.message}</div>
            <div class="notification-date">${formatNotificationDate(notif.createdAt)}</div>
        </div>
    `).join('');

    // Add click handlers
    notificationsList.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id);
            markNotificationAsRead(id);
            item.classList.add('read');
            updateNotificationBadge();
        });
    });
}

/**
 * Update notification badge count
 */
export function updateNotificationBadge() {
    const badge = document.getElementById('notif-badge');
    if (badge) {
        const count = getUnreadNotificationsCount();
        badge.textContent = count > 0 ? count : '0';
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
}

/**
 * Format notification date
 */
function formatNotificationDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `il y a ${diffMins}m`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;

    return date.toLocaleDateString('fr-FR');
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('Notifications not supported');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}

/**
 * Send browser notification
 */
export function sendBrowserNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2328A745"><path d="M6.05 8.05c-2.73 2.73-2.73 7.17-.02 9.9 1.47-3.4 4.09-6.24 7.36-7.93-2.77 2.34-4.71 5.61-5.39 9.32 2.6 1.23 5.8.78 7.95-1.38C19.43 14.47 20 4 20 4S9.53 4.57 6.05 8.05z"/></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2328A745"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>',
            ...options
        });
    }
}
