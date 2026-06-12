/**
 * EcoSignal - Map Management with Leaflet
 * ═════════════════════════════════════════════════════════
 */

import { getReports } from './storage.js';

let mapInstance = null;
let markers = [];
const ABIDJAN_CENTER = [5.359, -4.0083];

/**
 * Initialize the map
 */
export function initializeMap(containerId = 'map-container') {
    const container = document.getElementById(containerId);
    if (!container || mapInstance) return mapInstance;

    try {
        mapInstance = L.map(containerId).setView(ABIDJAN_CENTER, 12);

        // Add OSM tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(mapInstance);

        // Add reports to map
        loadReportsOnMap();

        return mapInstance;
    } catch (error) {
        console.error('Map initialization error:', error);
        return null;
    }
}

/**
 * Load reports on map
 */
export function loadReportsOnMap(filter = 'all') {
    if (!mapInstance) return;

    // Clear existing markers
    markers.forEach(marker => mapInstance.removeLayer(marker));
    markers = [];

    const reports = getReports();
    const filteredReports = filter === 'all' 
        ? reports 
        : reports.filter(r => r.status === filter);

    filteredReports.forEach(report => {
        if (report.latitude && report.longitude) {
            addMarkerToMap(report);
        }
    });
}

/**
 * Add single marker to map
 */
function addMarkerToMap(report) {
    if (!mapInstance) return;

    const statusColors = {
        received: '#FD7E14',
        processing: '#007BFF',
        resolved: '#28A745',
        rejected: '#DC3545'
    };

    const color = statusColors[report.status] || '#6C757D';

    // Create custom icon
    const icon = L.divIcon({
        html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"><i class="fas fa-map-marker-alt" style="color: white; font-size: 14px;"></i></div>`,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    const marker = L.marker([report.latitude, report.longitude], { icon })
        .bindPopup(`
            <div class="popup-content" style="padding: 10px;">
                <h4>${report.problemType || 'Signalement'}</h4>
                <p>${report.description || 'Pas de description'}</p>
                <p><strong>Code:</strong> ${report.code}</p>
                <p><strong>Statut:</strong> ${getStatusText(report.status)}</p>
                <p><small>${new Date(report.createdAt).toLocaleDateString('fr-FR')}</small></p>
            </div>
        `)
        .addTo(mapInstance);

    markers.push(marker);
}

/**
 * Filter markers by status
 */
export function filterMapMarkers(status) {
    loadReportsOnMap(status);
}

/**
 * Center map on location
 */
export function centerMapOnLocation(latitude, longitude, zoom = 15) {
    if (mapInstance) {
        mapInstance.setView([latitude, longitude], zoom);
    }
}

/**
 * Add user location marker
 */
export function addUserLocationMarker(latitude, longitude) {
    if (!mapInstance) return;

    const icon = L.icon({
        iconUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2328A745"><circle cx="12" cy="12" r="8" opacity="0.3" fill="%2328A745"/><circle cx="12" cy="12" r="5" fill="%2328A745"/></svg>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    L.marker([latitude, longitude], { icon })
        .bindPopup('Votre position')
        .addTo(mapInstance);

    centerMapOnLocation(latitude, longitude);
}

/**
 * Destroy map
 */
export function destroyMap() {
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
        markers = [];
    }
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
