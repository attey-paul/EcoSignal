/**
 * EcoSignal - Tracking Management
 * ═════════════════════════════════════════════════════════
 */

import { getReportByCode } from './storage.js';
import { formatDate, formatDateShort } from './utils.js';

/**
 * Get tracking timeline for a report
 */
export function getTrackingTimeline(report) {
    if (!report) return [];

    const timeline = [
        {
            step: 1,
            title: 'Signalement reçu',
            status: 'completed',
            date: report.createdAt,
            description: 'Votre signalement a été enregistré'
        },
        {
            step: 2,
            title: 'Assigné à l\'équipe',
            status: report.status === 'received' ? 'pending' : 'completed',
            date: report.assignedAt || null,
            description: 'Pris en charge par le District'
        },
        {
            step: 3,
            title: 'Intervention en cours',
            status: report.status === 'processing' ? 'active' : 
                    report.status === 'resolved' ? 'completed' : 'pending',
            date: report.processingAt || null,
            description: 'L\'équipe intervient sur place'
        },
        {
            step: 4,
            title: 'Résolu',
            status: report.status === 'resolved' ? 'completed' : 'pending',
            date: report.resolvedAt || null,
            description: 'Intervention terminée et validée'
        }
    ];

    return timeline;
}

/**
 * Display tracking info
 */
export function displayTrackingInfo(report) {
    if (!report) return false;

    const trackingResult = document.getElementById('tracking-result');
    const trackingEmpty = document.getElementById('tracking-empty');
    const trackingError = document.getElementById('tracking-error');

    if (!trackingResult) return false;

    // Hide all states
    trackingResult.classList.add('hidden');
    trackingEmpty.classList.add('hidden');
    trackingError.classList.add('hidden');

    // Show result
    trackingResult.classList.remove('hidden');

    // Update header
    document.getElementById('tracking-title').textContent = report.problemType || 'Signalement';
    document.getElementById('tracking-meta').textContent = 
        `Signalé le ${formatDateShort(report.createdAt)} • ${report.code}`;
    
    // Update status badge
    const statusBadge = document.getElementById('tracking-status');
    const statusText = getStatusText(report.status);
    statusBadge.textContent = statusText;
    statusBadge.className = `status-badge status-${report.status}`;

    // Update timeline
    const timeline = getTrackingTimeline(report);
    const timelineContainer = document.querySelector('.tracking-timeline');
    
    if (timelineContainer) {
        timelineContainer.innerHTML = timeline.map((item, index) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            
            let circleClass = `timeline-circle ${item.status}`;
            let circleContent = item.status === 'completed' 
                ? '<i class="fas fa-check"></i>' 
                : item.step;

            timelineItem.innerHTML = `
                <div class="${circleClass}" aria-label="Étape ${item.step}: ${item.title}">${circleContent}</div>
                <div class="timeline-content">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                    ${item.date ? `<p style="font-size: var(--font-size-xs); color: var(--text-light);">Le ${formatDateShort(item.date)}</p>` : ''}
                </div>
            `;
            
            return timelineItem.outerHTML;
        }).join('');
    }

    return true;
}

/**
 * Search for tracking code
 */
export function searchTrackingCode(code) {
    const report = getReportByCode(code);
    
    const trackingError = document.getElementById('tracking-error');
    const trackingEmpty = document.getElementById('tracking-empty');
    const trackingResult = document.getElementById('tracking-result');

    if (!report) {
        trackingResult.classList.add('hidden');
        trackingEmpty.classList.add('hidden');
        trackingError.classList.remove('hidden');
        document.getElementById('tracking-error-message').textContent = 
            'Code de suivi introuvable. Vérifiez votre code et réessayez.';
        return false;
    }

    return displayTrackingInfo(report);
}

/**
 * Get status text
 */
function getStatusText(status) {
    const statusMap = {
        'received': 'En attente',
        'processing': 'En cours',
        'resolved': 'Résolu',
        'rejected': 'Rejeté'
    };
    return statusMap[status] || 'Inconnu';
}

/**
 * Update report status for demonstration
 */
export function simulateStatusUpdate(code, newStatus) {
    const report = getReportByCode(code);
    if (report) {
        report.status = newStatus;
        if (newStatus === 'processing') {
            report.assignedAt = new Date().toISOString();
        } else if (newStatus === 'resolved') {
            report.processingAt = new Date(Date.now() - 3600000).toISOString();
            report.resolvedAt = new Date().toISOString();
        }
        return displayTrackingInfo(report);
    }
    return false;
}
