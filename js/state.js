/**
 * state.js - Manages application state for EnergiWatch with persistence
 */

import { 
    loadTariffFromStorage,
    loadAppliancesFromStorage,
    loadSolarDataFromStorage,
    loadUsageDataFromStorage,
    loadUsageModeFromStorage,
    saveAppliancesToStorage,
    saveSolarDataToStorage,
    saveUsageDataToStorage,
    saveUsageModeToStorage,
    saveTariffToStorage,
    loadAppState,
    saveAppState
} from "./storage";

// Application state with persistence
let applianceState = {
    appliances: [],
    lastUpdated: Date.now()
};

let solarDataState = null;
let usageDataState = null;
let tariffDataState = 0.4562;
let usageModeState = "on-demand";
let isAIGeneratedState = false; // Track whether data was AI-generated
let needsRegeneration = false;

/**
 * Initialize the application state from storage
 */
export function initializeState() {
    try {
        console.log('Initializing application state...');
        
        // Load all state from storage
        const storedAppliances = loadAppliancesFromStorage();
        const storedSolarData = loadSolarDataFromStorage();
        const storedUsageData = loadUsageDataFromStorage();
        const storedUsageMode = loadUsageModeFromStorage();
        
        console.log('Loaded from storage:', {
            hasAppliances: !!storedAppliances?.length,
            hasSolarData: !!storedSolarData,
            hasUsageData: !!storedUsageData,
            usageMode: storedUsageMode
        });
        
        // Only update state if we have valid stored data
        if (storedAppliances && storedAppliances.length > 0) {
            applianceState = {
                appliances: storedAppliances,
                lastUpdated: Date.now()
            };
            console.log('Restored', storedAppliances.length, 'appliances from storage');
        }
        
        if (storedSolarData) {
            solarDataState = storedSolarData;
            console.log('Restored solar data from storage');
        }
        
        if (storedUsageData) {
            usageDataState = storedUsageData;
            console.log('Restored usage data from storage');
        }
        
        if (storedUsageMode) {
            usageModeState = storedUsageMode;
            console.log('Restored usage mode:', storedUsageMode);
        }
        
        // Always use the fixed tariff rate
        tariffDataState = loadTariffFromStorage();
        console.log('Initialized tariff data:', tariffDataState);
        
        // Load the isAIGenerated flag from app state
        const appState = loadAppState();
        if (appState && typeof appState.isAIGenerated === 'boolean') {
            isAIGeneratedState = appState.isAIGenerated;
            console.log('Restored data source flag:', isAIGeneratedState ? 'AI-generated' : 'Local fallback');
        }
        
        console.log('Application state initialization complete');
    } catch (error) {
        console.error('Error initializing application state:', error);
    }
}

/**
 * Gets the current list of appliances.
 * @returns {Array<object>} A copy of the appliances array.
 */
export function getAppliances() {
    return [...applianceState.appliances]; // Return a copy to prevent direct mutation
}

/**
 * Sets the list of appliances and saves it to storage.
 * @param {Array<object>} appliances - The new array of appliance objects.
 */
export function setAppliances(appliances) {
    if (!Array.isArray(appliances)) {
        console.error('setAppliances: Expected an array of appliances');
        return;
    }
    
    applianceState = {
        appliances: [...appliances], // Store a copy
        lastUpdated: Date.now()
    };
    
    try {
        saveAppliancesToStorage(appliances);
        setNeedsRegeneration(true);
    } catch (error) {
        console.error('Error saving appliances to storage:', error);
    }
}

/**
 * Updates the 'isEssential' status of a specific appliance.
 * @param {string|number} applianceId - The ID of the appliance to update.
 * @param {boolean} isEssential - The new essential status.
 */
export function setApplianceEssential(applianceId, isEssential) {
    const appliances = applianceState.appliances.map(appliance => {
        if (appliance.id === applianceId) {
            return { ...appliance, isEssential };
        }
        return appliance;
    });
    
    setAppliances(appliances); // This will handle saving to storage
}

/**
 * Checks if the data needs regeneration (e.g., due to changes).
 * @returns {boolean} True if data needs regeneration, false otherwise.
 */
export function getNeedsRegeneration() {
    return needsRegeneration;
}

/**
 * Sets the flag indicating whether data needs regeneration.
 * @param {boolean} value - The new value for the flag.
 */
export function setNeedsRegeneration(value) {
    needsRegeneration = Boolean(value);
}

/**
 * Gets the current solar generation data.
 * @returns {Array<number>|null} A copy of the solar data array, or null if not set.
 */
export function getSolarData() {
    return solarDataState ? [...solarDataState] : null; // Return a copy
}

/**
 * Sets the solar generation data and saves it to storage.
 * @param {Array<number>|object} solarData - The new solar data (array of numbers or an object, will be stored as an array).
 */
export function setSolarData(solarData) {
    if (!solarData) {
        console.error('setSolarData: Invalid solar data provided');
        return;
    }
    
    solarDataState = Array.isArray(solarData) ? [...solarData] : solarData;
    
    try {
        saveSolarDataToStorage(solarDataState);
    } catch (error) {
        console.error('Error saving solar data to storage:', error);
    }
}

/**
 * Gets the current energy usage data.
 * @returns {Array<number>|null} A copy of the usage data array, or null if not set.
 */
export function getUsageData() {
    return usageDataState ? [...usageDataState] : null; // Return a copy
}

/**
 * Sets the energy usage data and saves it to storage.
 * @param {Array<number>|object} usageData - The new usage data (array of numbers or an object, will be stored as an array).
 */
export function setUsageData(usageData) {
    if (!usageData) {
        console.error('setUsageData: Invalid usage data provided');
        return;
    }
    
    usageDataState = Array.isArray(usageData) ? [...usageData] : usageData;
    
    try {
        saveUsageDataToStorage(usageDataState);
    } catch (error) {
        console.error('Error saving usage data to storage:', error);
    }
}

/**
 * Gets the current tariff data (always a fixed rate).
 * @returns {number} The fixed tariff rate.
 */
export function getTariffData() {
    return tariffDataState;
}

/**
 * Sets the tariff data to a fixed rate (0.4562) and saves it to storage.
 * This function enforces the fixed tariff rate requirement.
 */
export function setTariffData() {
    // Always enforce the fixed rate as per requirements
    const fixedRate = 0.4562;
    tariffDataState = fixedRate;
    saveTariffToStorage(fixedRate);
}

/**
 * Gets the current usage mode.
 * @returns {string} The current usage mode ('on-demand' or '24/7').
 */
export function getUsageMode() {
    return usageModeState;
}

/**
 * Sets the usage mode and saves it to storage if valid.
 * @param {string} mode - The new usage mode. Must be 'on-demand' or '24/7'.
 */
export function setUsageMode(mode) {
    if (mode === "on-demand" || mode === "24/7") {
        usageModeState = mode;
        try {
            saveUsageModeToStorage(mode);
        } catch (error) {
            console.error('Error saving usage mode to storage:', error);
        }
    }
}

/**
 * Gets whether the current data was AI-generated
 * @returns {boolean} True if data was AI-generated, false if using local fallback
 */
export function isDataAIGenerated() {
    return isAIGeneratedState;
}

/**
 * Sets whether the current data is AI-generated and updates UI indicator
 * @param {boolean} value - Whether data is AI-generated
 */
export function setDataAIGenerated(value) {
    isAIGeneratedState = !!value;
    // Update state in local storage
    try {
        const state = loadAppState() || {};
        state.isAIGenerated = isAIGeneratedState;
        saveAppState(state);
    } catch (error) {
        console.error('Error saving AI data flag to storage:', error);
    }
}
