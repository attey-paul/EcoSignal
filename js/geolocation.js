/**
 * EcoSignal - Geolocation Management
 * ═════════════════════════════════════════════════════════
 */

import { saveUserLocation, getUserLocation } from './storage.js';

/**
 * Request user geolocation
 */
export function requestGeolocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                const location = {
                    latitude,
                    longitude,
                    accuracy,
                    timestamp: new Date().toISOString()
                };
                saveUserLocation(location);
                resolve(location);
            },
            (error) => {
                console.error('Geolocation error:', error);
                reject(error);
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    });
}

/**
 * Watch user location (continuous updates)
 */
export function watchGeolocation(callback) {
    if (!navigator.geolocation) {
        console.error('Geolocation not supported');
        return null;
    }

    return navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const location = { latitude, longitude, accuracy };
            saveUserLocation(location);
            callback(location);
        },
        (error) => console.error('Watch error:', error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
}

/**
 * Stop watching location
 */
export function stopWatchingGeolocation(watchId) {
    if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
    }
}

/**
 * Get cached location
 */
export function getCachedLocation() {
    return getUserLocation();
}

/**
 * Get location name using reverse geocoding (mock)
 */
export async function getLocationName(latitude, longitude) {
    // In production, use a real geocoding API
    try {
        // Mock response based on Abidjan coordinates
        if (Math.abs(latitude - 5.359) < 0.1 && Math.abs(longitude - -4.0083) < 0.1) {
            return {
                city: 'Abidjan',
                district: 'Abobo',
                country: 'Côte d\'Ivoire',
                address: 'Rue Koné Tiémoman, Abobo'
            };
        }
        return {
            city: 'Unknown',
            district: 'Unknown',
            country: 'Côte d\'Ivoire',
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        };
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

/**
 * Calculate distance between two points (Haversine formula)
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
