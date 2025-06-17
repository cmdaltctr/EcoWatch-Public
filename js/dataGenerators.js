/**
 * @file dataGenerators.js
 * @description Provides functions to generate realistic-looking hourly, daily, and monthly
 * energy usage and solar generation data for demonstration and simulation purposes.
 */

// Cache for generated data to maintain consistency across different views or requests if needed.
// Currently, this cache is not actively used by the exported functions in a way that persists data between calls to them from outside this module.
// The exported functions are pure in terms of their input parameters for specific generation tasks.
const dataCache = {
    hourlyUsage: {},
    hourlySolar: {},
    dailyUsage: {},
    dailySolar: {},
    monthlyUsage: {},
    monthlySolar: {}
};

/**
 * Generate realistic energy usage data based on the time of day
 * @param {number} hour - Hour of the day (0-23)
 * @param {number} baseMultiplier - Base multiplier for the data
 * @returns {number} - Energy usage in kWh
 */
export function generateHourlyUsage(hour, baseMultiplier = 1.0) {
    // Base pattern for a typical household
    // Night (12am-6am): Low usage
    // Morning (6am-9am): Peak usage
    // Day (9am-4pm): Moderate usage
    // Evening (4pm-10pm): Peak usage
    // Night (10pm-12am): Decreasing usage
    
    let baseUsage;
    
    if (hour >= 0 && hour < 6) {
        // Night: very low usage (0.1 - 0.3 kWh)
        baseUsage = 0.1 + (Math.random() * 0.2);
    } else if (hour >= 6 && hour < 9) {
        // Morning peak (0.5 - 1.2 kWh)
        baseUsage = 0.5 + (Math.random() * 0.7);
    } else if (hour >= 9 && hour < 16) {
        // Daytime: moderate usage (0.3 - 0.8 kWh)
        baseUsage = 0.3 + (Math.random() * 0.5);
    } else if (hour >= 16 && hour < 22) {
        // Evening peak (0.7 - 1.5 kWh)
        baseUsage = 0.7 + (Math.random() * 0.8);
    } else {
        // Late evening (0.2 - 0.5 kWh)
        baseUsage = 0.2 + (Math.random() * 0.3);
    }
    
    // Add some randomness and apply the base multiplier
    const randomness = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    return parseFloat((baseUsage * baseMultiplier * randomness).toFixed(2));
}

/**
 * Generate realistic solar generation data based on the time of day
 * @param {number} hour - Hour of the day (0-23)
 * @param {number} weatherFactor - Weather factor (0.2 for cloudy, 1.0 for sunny)
 * @returns {number} - Solar generation in kWh
 */
export function generateSolarGeneration(hour, weatherFactor = 0.8) {
    // Solar generation is 0 at night
    if (hour < 6 || hour > 19) return 0;
    
    // Base generation pattern (bell curve from 6am to 7pm)
    // Peak at solar noon (around 12-1pm)
    const peakHour = 12.5; // Solar noon (can be adjusted based on location)
    const hoursFromPeak = Math.abs(hour - peakHour);
    
    // Calculate generation based on time from peak
    // Using a simplified bell curve approximation
    let generation;
    if (hoursFromPeak < 6) {
        // Within 6 hours of peak, generate significant power
        generation = Math.cos((hoursFromPeak * Math.PI) / 12) * 0.9 + 0.1;
    } else {
        // Outside 6 hours, minimal generation
        generation = 0.05;
    }
    
    // Apply weather factor (0.2 for cloudy, 1.0 for sunny)
    generation *= weatherFactor;
    
    // Add some randomness (10% variation)
    const randomness = 0.9 + (Math.random() * 0.2);
    generation *= randomness;
    
    return parseFloat(Math.max(0, generation).toFixed(2));
}

/**
 * Generate realistic hourly distribution for energy usage or solar generation
 * @param {number} dailyTotal - Total for the day
 * @param {string} type - 'usage' or 'solar'
 * @returns {number[]} Array of 24 hourly values
 */
export function generateHourlyDistribution(dailyTotal, type = 'usage') {
    const hourlyValues = [];
    let sum = 0;
    
    // First pass: generate base values
    for (let hour = 0; hour < 24; hour++) {
        let value;
        
        if (type === 'solar') {
            // Solar generation pattern (0 at night, peaks at noon)
            if (hour < 6 || hour > 19) {
                value = 0;
            } else {
                // Bell curve centered at 1pm
                const distanceFromNoon = Math.abs(hour - 13);
                value = Math.exp(-(distanceFromNoon * distanceFromNoon) / 18) * 2;
            }
        } else {
            // Usage pattern (peaks in morning and evening)
            if (hour >= 0 && hour < 6) {
                // Night: low usage
                value = 0.5 + Math.random() * 0.5;
            } else if (hour >= 6 && hour < 9) {
                // Morning peak
                value = 1.5 + Math.random();
            } else if (hour >= 9 && hour < 16) {
                // Daytime: moderate usage
                value = 0.8 + Math.random() * 0.8;
            } else if (hour >= 16 && hour < 22) {
                // Evening peak
                value = 1.2 + Math.random() * 1.2;
            } else {
                // Late evening
                value = 0.7 + Math.random() * 0.6;
            }
        }
        
        hourlyValues.push(value);
        sum += value;
    }
    
    // Second pass: normalize to match daily total
    if (sum > 0) {
        const factor = dailyTotal / sum;
        return hourlyValues.map(v => parseFloat((v * factor).toFixed(2)));
    }
    
    return Array(24).fill(0);
}
