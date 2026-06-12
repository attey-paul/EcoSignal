/**
 * EcoSignal - UI Management
 * ═════════════════════════════════════════════════════════
 */

import { showToast } from './notifications.js';
import { fileToBase64, isValidFileSize, isValidFileType } from './utils.js';

/**
 * Initialize UI elements
 */
export function initializeUI() {
    setupEventListeners();
    setupFormValidation();
    setupPhotoUpload();
}

/**
 * Setup general event listeners
 */
function setupEventListeners() {
    // Card navigation
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', (e) => handleCardClick(e));
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleCardClick(e);
            }
        });
    });

    // Back buttons
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => handleBackButton());
    });

    // Nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => handleNavClick(e));
    });
}

/**
 * Handle card clicks
 */
function handleCardClick(event) {
    const card = event.currentTarget;
    const action = card.dataset.action;
    if (action) {
        window.app.router.navigate(action);
    }
}

/**
 * Handle back button
 */
function handleBackButton() {
    window.history.back();
}

/**
 * Handle nav link clicks
 */
function handleNavClick(event) {
    const link = event.currentTarget;
    const page = link.dataset.page;
    if (page) {
        window.app.router.navigate(page);
    }
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    const reportForm = document.getElementById('report-form');
    if (reportForm) {
        reportForm.addEventListener('submit', handleReportSubmit);

        // Real-time validation
        const description = document.getElementById('description');
        const charCount = document.getElementById('char-count');
        if (description && charCount) {
            description.addEventListener('input', () => {
                charCount.textContent = description.value.length;
            });
        }
    }

    const trackingSearch = document.getElementById('tracking-search');
    if (trackingSearch) {
        trackingSearch.addEventListener('submit', handleTrackingSubmit);
    }
}

/**
 * Setup photo upload
 */
function setupPhotoUpload() {
    const photoInput = document.getElementById('photo');
    const uploadArea = document.querySelector('.upload-area');

    if (!photoInput || !uploadArea) return;

    // Click to upload
    uploadArea.addEventListener('click', () => photoInput.click());
    uploadArea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            photoInput.click();
        }
    });

    // File selection
    photoInput.addEventListener('change', handlePhotoSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = 'var(--primary-light)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.backgroundColor = '';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = '';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            photoInput.files = files;
            handlePhotoSelect({ target: { files } });
        }
    });
}

/**
 * Handle photo selection
 */
async function handlePhotoSelect(event) {
    const files = event.target.files;
    const photoPreview = document.getElementById('photo-preview');
    const photoError = document.getElementById('photo-error');

    if (!photoPreview) return;

    photoPreview.innerHTML = '';
    photoError?.classList.remove('show');

    for (const file of files) {
        // Validate file
        if (!isValidFileType(file)) {
            showToast('Format de fichier non supporté', 'error');
            photoError?.classList.add('show');
            photoError.textContent = 'Formats acceptés: JPG, PNG, WebP';
            continue;
        }

        if (!isValidFileSize(file)) {
            showToast('Fichier trop volumineux (max 5 MB)', 'error');
            photoError?.classList.add('show');
            photoError.textContent = 'Taille maximale: 5 MB';
            continue;
        }

        // Preview
        const base64 = await fileToBase64(file);
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.innerHTML = `
            <img src="${base64}" alt="Aperçu" />
            <button class="photo-remove" aria-label="Supprimer la photo">&times;</button>
        `;

        photoItem.querySelector('img').addEventListener('click', () => {
            const modal = document.getElementById('image-modal');
            document.getElementById('modal-image').src = base64;
            modal.classList.remove('hidden');
        });

        photoItem.querySelector('.photo-remove').addEventListener('click', () => {
            photoItem.remove();
        });

        photoPreview.appendChild(photoItem);
    }
}

/**
 * Handle report form submission
 */
async function handleReportSubmit(event) {
    event.preventDefault();

    const type = document.getElementById('problem-type').value;
    const description = document.getElementById('description').value;

    // Validate
    if (!type) {
        showToast('Veuillez sélectionner un type de problème', 'error');
        return;
    }

    if (description.length < 20) {
        showToast('La description doit contenir au moins 20 caractères', 'error');
        return;
    }

    // Submit (in real app, would send to server)
    showToast('Signalement envoyé avec succès!', 'success');
    window.app.router.navigate('confirmation');
}

/**
 * Handle tracking search
 */
function handleTrackingSubmit(event) {
    event.preventDefault();
    const trackingInput = document.getElementById('tracking-input');
    if (trackingInput && window.app.searchTracking) {
        window.app.searchTracking(trackingInput.value);
    }
}

/**
 * Show modal
 */
export function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('modal-open');
    }
}

/**
 * Hide modal
 */
export function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('modal-open');
    }
}

/**
 * Setup modal close handlers
 */
export function setupModals() {
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                hideModal(modal.id);
            }
        });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
}
