/**
 * EcoSignal - Router (Page Navigation)
 * ═════════════════════════════════════════════════════════
 */

export class Router {
    constructor() {
        this.currentPage = 'splash';
        this.pages = new Map();
        this.listeners = [];
    }

    /**
     * Register a page
     */
    registerPage(name, element) {
        this.pages.set(name, element);
    }

    /**
     * Navigate to a page
     */
    navigate(pageName) {
        const page = this.pages.get(pageName);
        if (!page) {
            console.warn(`Page not found: ${pageName}`);
            return false;
        }

        // Hide all pages
        this.pages.forEach(el => {
            el.classList.remove('page-active', 'active');
        });

        // Show target page
        page.classList.add('page-active', 'active', 'animate-fade-in');

        this.currentPage = pageName;
        this.notifyListeners(pageName);

        // Scroll to top
        window.scrollTo(0, 0);

        return true;
    }

    /**
     * Get current page
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Add navigation listener
     */
    onNavigate(callback) {
        this.listeners.push(callback);
    }

    /**
     * Notify listeners of navigation
     */
    notifyListeners(pageName) {
        this.listeners.forEach(callback => callback(pageName));
    }
}

/**
 * Global router instance
 */
export const router = new Router();
