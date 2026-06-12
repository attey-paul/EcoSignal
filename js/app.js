/**
 * EcoSignal - Main Application
 * ═════════════════════════════════════════════════════════
 */

import { router } from './router.js';
import { initializeUI, setupModals } from './ui.js';
import { initializeMap } from './map.js';
import { requestGeolocation, getCachedLocation } from './geolocation.js';
import { generateTrackingCode, copyToClipboard } from './utils.js';
import { saveReport, getReports } from './storage.js';
import { showToast, createReportNotification, displayNotifications, updateNotificationBadge } from './notifications.js';
import { searchTrackingCode } from './tracking.js';

class EcoSignalApp {
    constructor() {
        this.router = router;
        this.currentUser = null;
        this.currentReport = null;
        this.currentTrackingCode = null;
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('🌱 Initializing EcoSignal...');
        
        this.registerPages();
        this.setupRouting();
        initializeUI();
        setupModals();
        this.setupEventHandlers();
        await this.setupGeolocation();
        this.loadMockData();
        updateNotificationBadge();

        console.log('✅ EcoSignal initialized successfully');
    }

    /**
     * Register all pages with router
     */
    registerPages() {
        const pages = ['splash', 'home', 'report', 'confirmation', 'map', 'tracking', 'notifications'];
        pages.forEach(pageName => {
            const element = document.getElementById(pageName);
            if (element) {
                this.router.registerPage(pageName, element);
            }
        });
    }

    /**
     * Setup routing event listeners
     */
    setupRouting() {
        this.router.onNavigate((pageName) => {
            console.log(`📄 Navigating to: ${pageName}`);
            this.updateNavigation(pageName);
            this.handlePageLoad(pageName);
        });
    }

    /**
     * Update navigation bar
     */
    updateNavigation(pageName) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageName) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Handle page-specific logic
     */
    handlePageLoad(pageName) {
        switch (pageName) {
            case 'home':
                this.handleHomeLoad();
                break;
            case 'map':
                this.handleMapLoad();
                break;
            case 'tracking':
                this.handleTrackingLoad();
                break;
            case 'notifications':
                this.handleNotificationsLoad();
                break;
        }
    }

    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // Splash screen
        const splashStart = document.getElementById('splash-start');
        if (splashStart) {
            splashStart.addEventListener('click', () => {
                this.router.navigate('home');
            });
        }

        // Report form
        const reportForm = document.getElementById('report-form');
        if (reportForm) {
            reportForm.addEventListener('submit', (e) => this.handleReportSubmit(e));
        }

        // Confirmation actions
        const actionTrack = document.getElementById('action-track');
        if (actionTrack) {
            actionTrack.addEventListener('click', () => this.router.navigate('tracking'));
        }

        const actionShare = document.getElementById('action-share');
        if (actionShare) {
            actionShare.addEventListener('click', () => this.handleWhatsAppShare());
        }

        const actionHome = document.getElementById('action-home');
        if (actionHome) {
            actionHome.addEventListener('click', () => this.router.navigate('home'));
        }

        const copyCode = document.getElementById('copy-code');
        if (copyCode) {
            copyCode.addEventListener('click', () => this.handleCopyCode());
        }

        // Tracking search
        const trackingForm = document.getElementById('tracking-search');
        if (trackingForm) {
            trackingForm.addEventListener('submit', (e) => this.handleTrackingSearch(e));
        }

        // Map filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleMapFilter(e));
        });

        // Update location button
        const updateLocationBtn = document.getElementById('update-location');
        if (updateLocationBtn) {
            updateLocationBtn.addEventListener('click', () => this.setupGeolocation());
        }
    }

    /**
     * Setup geolocation
     */
    async setupGeolocation() {
        const locationStatus = document.getElementById('location-status');
        if (!locationStatus) return;

        locationStatus.textContent = 'Détection en cours...';
        
        try {
            const location = await requestGeolocation();
            locationStatus.textContent = `Latitude: ${location.latitude.toFixed(4)}, Longitude: ${location.longitude.toFixed(4)}`;
            this.currentUser = location;
            showToast('Localisation mise à jour', 'success');
        } catch (error) {
            console.error('Geolocation error:', error);
            const cached = getCachedLocation();
            if (cached) {
                locationStatus.textContent = `Localisation en cache`;
                this.currentUser = cached;
            } else {
                locationStatus.textContent = 'Géolocalisation non disponible';
            }
        }
    }

    /**
     * Handle report submission
     */
    handleReportSubmit(event) {
        event.preventDefault();

        const type = document.getElementById('problem-type').value;
        const description = document.getElementById('description').value;

        if (!type) {
            showToast('Sélectionnez un type de problème', 'error');
            return;
        }

        if (description.length < 20) {
            showToast('Description trop courte (min 20 caractères)', 'error');
            return;
        }

        // Generate tracking code
        const trackingCode = generateTrackingCode();
        this.currentTrackingCode = trackingCode;

        // Save report
        const report = {
            code: trackingCode,
            type: type,
            description: description,
            latitude: this.currentUser?.latitude || 5.359,
            longitude: this.currentUser?.longitude || -4.0083,
            problemType: document.getElementById('problem-type').options[document.getElementById('problem-type').selectedIndex].text,
            status: 'received'
        };

        saveReport(report);
        createReportNotification(trackingCode, 'received');

        // Update confirmation screen
        document.getElementById('tracking-code-display').textContent = trackingCode;

        showToast('Signalement envoyé avec succès!', 'success');
        this.router.navigate('confirmation');
    }

    /**
     * Handle copy tracking code
     */
    async handleCopyCode() {
        const code = document.getElementById('tracking-code-display').textContent;
        if (code && code !== 'ECO-2026-XXXX') {
            const success = await copyToClipboard(code);
            if (success) {
                showToast('Code copié dans le presse-papiers', 'success');
            }
        }
    }

    /**
     * Handle WhatsApp sharing
     */
    handleWhatsAppShare() {
        const code = document.getElementById('tracking-code-display').textContent;
        if (code && code !== 'ECO-2026-XXXX') {
            const message = `Je viens de signaler un problème via EcoSignal.\nCode de suivi: ${code}\n\nSuivez mon signalement à: https://ecosignal.example.com`;
            const encoded = encodeURIComponent(message);
            window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
        }
    }

    /**
     * Handle tracking search
     */
    handleTrackingSearch(event) {
        event.preventDefault();
        const input = document.getElementById('tracking-input');
        if (input) {
            this.searchTracking(input.value);
        }
    }

    /**
     * Search tracking
     */
    searchTracking(code) {
        if (!code) {
            showToast('Entrez un code de suivi', 'error');
            return;
        }
        
        searchTrackingCode(code.toUpperCase());
    }

    /**
     * Handle map filter
     */
    handleMapFilter(event) {
        const button = event.currentTarget;
        const filter = button.dataset.filter;

        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    }

    /**
     * Handle home page load
     */
    handleHomeLoad() {
        // Initialize if needed
    }

    /**
     * Handle map page load
     */
    handleMapLoad() {
        setTimeout(() => {
            initializeMap('map-container');
        }, 100);
    }

    /**
     * Handle tracking page load
     */
    handleTrackingLoad() {
        document.getElementById('tracking-empty').classList.remove('hidden');
        document.getElementById('tracking-result').classList.add('hidden');
        document.getElementById('tracking-error').classList.add('hidden');
    }

    /**
     * Handle notifications page load
     */
    handleNotificationsLoad() {
        displayNotifications();
    }

    /**
     * Load mock data for demonstration
     */
    loadMockData() {
        const reports = getReports();
        if (reports.length === 0) {
            // Create sample reports
            const sampleReports = [
                {
                    code: 'ECO-2026-A1B2',
                    type: 'dump',
                    description: 'Dépôt sauvage d\'ordures derrière le marché',
                    latitude: 5.359,
                    longitude: -4.0083,
                    problemType: 'Dépôt sauvage d\'ordures',
                    status: 'resolved',
                    createdAt: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
                    resolvedAt: new Date(Date.now() - 2*24*60*60*1000).toISOString()
                },
                {
                    code: 'ECO-2026-C3D4',
                    type: 'water',
                    description: 'Caniveau bouché, eau stagnante',
                    latitude: 5.35,
                    longitude: -4.01,
                    problemType: 'Eaux stagnantes',
                    status: 'processing',
                    createdAt: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
                    assignedAt: new Date(Date.now() - 2*24*60*60*1000).toISOString()
                },
                {
                    code: 'ECO-2026-E5F6',
                    type: 'dump',
                    description: 'Accumulation de déchets près de la station',
                    latitude: 5.37,
                    longitude: -4.02,
                    problemType: 'Dépôt sauvage d\'ordures',
                    status: 'received',
                    createdAt: new Date(Date.now() - 1*24*60*60*1000).toISOString()
                }
            ];

            sampleReports.forEach(report => saveReport(report));
            console.log('✅ Mock data loaded');
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new EcoSignalApp();
        window.app.init();
    });
} else {
    window.app = new EcoSignalApp();
    window.app.init();
}
