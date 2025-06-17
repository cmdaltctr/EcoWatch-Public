/**
 * @file storage.js
 * @description Handles all localStorage operations for EnergiWatch, including saving and loading application state, tariff data, appliances, solar data, usage data, and usage mode.
 */

// Default tariff rate of 45.62 sen per kilowatt hour (0.4562 RM/kWh)
const DEFAULT_TARIFF_RATE = 0.4562;
const STORAGE_KEY = 'energiwatch_app_state';

/**
 * Helper function to safely parse JSON.
 * @param {string} json - The JSON string to parse.
 * @param {*} defaultValue - The value to return if parsing fails or input is null/undefined.
 * @returns {*} The parsed object or the default value.
 */
function safeJsonParse(json, defaultValue) {
    try {
        return json ? JSON.parse(json) : defaultValue;
    } catch (e) {
        console.error('Error parsing JSON from storage:', e);
        return defaultValue;
    }
}

/**
 * Load the entire application state from localStorage
 * @returns {Object} The saved application state or null if not found
 */
export function loadAppState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const result = safeJsonParse(saved, null);
        console.log('Loaded app state from localStorage:', result ? 'data exists' : 'no data');
        return result;
    } catch (e) {
        console.error('Error loading application state:', e);
        return null;
    }
}

/**
 * Save the entire application state to localStorage
 * @param {Object} state - The application state to save
 */
export function saveAppState(state) {
    try {
        console.log('Saving app state to localStorage');
        const stateToSave = {
            ...state,
            // Don't log the entire state if it's too large
            appliances: state.appliances ? `[${state.appliances.length} items]` : null,
            solarData: state.solarData ? `[${state.solarData.length} items]` : null,
            usageData: state.usageData ? `[${state.usageData.length} items]` : null,
            // Log the data source flag
            isAIGenerated: state.isAIGenerated ? 'AI-generated' : 'Local fallback'
        };
        console.log('State being saved:', stateToSave);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        console.log('App state saved successfully');
    } catch (e) {
        console.error('Error saving application state:', e);
    }
}

/**
 * Clear all application data from localStorage
 */
export function clearAppState() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error('Error clearing application state:', e);
    }
}

// Tariff storage functions

/**
 * Loads the tariff rate. Currently returns a default fixed rate.
 * @returns {number} The default tariff rate.
 */
export function loadTariffFromStorage() {
    // We always return the fixed tariff rate regardless of what's in storage
    return DEFAULT_TARIFF_RATE;
}

/**
 * Saves the tariff rate. Currently saves the default fixed rate to the app state.
 * @param {number} rate - The tariff rate to save (note: currently unused, default is saved).
 */
export function saveTariffToStorage(rate) {
    // We always save the fixed rate to ensure consistency
    const state = loadAppState() || {};
    state.tariffData = DEFAULT_TARIFF_RATE;
    console.log('Saving tariff data to storage:', state.tariffData);
    saveAppState(state);
    console.log('Tariff data saved successfully');
}

// Appliances storage functions

/**
 * Loads the list of appliances from application state in localStorage.
 * @returns {Array<object>} The array of appliance objects, or an empty array if none found.
 */
export function loadAppliancesFromStorage() {
    const state = loadAppState();
    const result = state?.appliances || [];
    console.log('Loaded appliances from storage:', result.length > 0 ? `${result.length} items` : 'no data');
    return result;
}

/**
 * Saves the list of appliances to application state in localStorage.
 * @param {Array<object>} appliances - The array of appliance objects to save.
 */
export function saveAppliancesToStorage(appliances) {
    const state = loadAppState() || {};
    state.appliances = appliances;
    console.log('Saving appliances to storage:', appliances.length > 0 ? `${appliances.length} items` : 'no data');
    saveAppState(state);
    console.log('Appliances saved successfully');
}

// Solar data storage functions

/**
 * Loads solar generation data from application state in localStorage.
 * @returns {Array<number>|null} The array of solar data, or null if not found.
 */
export function loadSolarDataFromStorage() {
    const state = loadAppState();
    const result = state?.solarData || null;
    console.log('Loaded solar data from storage:', result ? `${result.length} items` : 'no data');
    return result;
}

/**
 * Saves solar generation data to application state and a separate localStorage key for backward compatibility.
 * @param {Array<number>} solarData - The array of solar data to save.
 */
export function saveSolarDataToStorage(solarData) {
    // Save to app state
    const state = loadAppState() || {};
    state.solarData = solarData;
    saveAppState(state);
    
    // Also save to localStorage with 'solarGenerationData' key for backward compatibility
    try {
        localStorage.setItem('solarGenerationData', JSON.stringify(solarData));
    } catch (e) {
        console.error('Failed to save solar data to localStorage:', e);
    }
}

// Usage data storage functions

/**
 * Loads energy usage data from application state in localStorage.
 * @returns {Array<number>|null} The array of usage data, or null if not found.
 */
export function loadUsageDataFromStorage() {
    const state = loadAppState();
    const result = state?.usageData || null;
    console.log('Loaded usage data from storage:', result ? `${result.length} items` : 'no data');
    return result;
}

/**
 * Saves energy usage data to application state in localStorage.
 * @param {Array<number>} usageData - The array of usage data to save.
 */
export function saveUsageDataToStorage(usageData) {
    const state = loadAppState() || {};
    state.usageData = usageData;
    saveAppState(state);
}

// Usage mode storage functions

/**
 * Loads the usage mode from application state in localStorage.
 * @returns {string} The current usage mode (e.g., 'on-demand', '24/7'), or 'on-demand' if not found.
 */
export function loadUsageModeFromStorage() {
    const state = loadAppState();
    return state?.usageMode || 'on-demand';
}

/**
 * Saves the usage mode to application state in localStorage.
 * @param {string} usageMode - The usage mode to save.
 */
export function saveUsageModeToStorage(usageMode) {
    const state = loadAppState() || {};
    state.usageMode = usageMode;
    saveAppState(state);
}
