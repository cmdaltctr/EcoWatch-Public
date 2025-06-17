/**
 * Calculates the current estimated bill based on appliances, solar data, and tariff data.
 *
 * @param {Array<object>} appliances - Array of appliance objects.
 * @param {Array<number>} solarData - Array of solar generation data (kWh values).
 * @param {Array<object>|Array<number>|number} tariffData - Tariff data, can be an array of tariff objects, an array of rates, or a single rate.
 * @returns {number} The current estimated bill in MYR.
 */

// Function to calculate the current estimated bill
export function calculateCurrentEstimatedBill(
	appliances,
	solarData,
	tariffData,
) {
	console.log(
		"[DEBUG] calculateCurrentEstimatedBill - appliances:",
		appliances,
	);
	// 1. Calculate total appliance usage for the month (kWh)
	let totalKWh = 0;
	appliances.forEach((appliance) => {
		const dailyKWh =
			(appliance.powerWatts * appliance.typicalDailyHours) / 1000;
		totalKWh += dailyKWh * 30; // Monthly usage
	});
	console.log("[DEBUG] calculateCurrentEstimatedBill - totalKWh:", totalKWh);

	// 2. Calculate total solar generation for the month (kWh)
	let totalSolarKWh = 0;
	console.log("[DEBUG] calculateCurrentEstimatedBill - solarData:", solarData);
	if (Array.isArray(solarData) && solarData.length > 0) {
		// If 24 values, assume hourly; if 7, assume daily; else, sum as-is
		if (solarData.length === 24) {
			// hourly values for one day, multiply by 30 days
			totalSolarKWh = solarData.reduce((sum, kwh) => sum + kwh, 0) * 30;
		} else if (solarData.length === 7) {
			// daily values for a week, multiply by ~4.3 weeks/month
			totalSolarKWh = solarData.reduce((sum, kwh) => sum + kwh, 0) * 4.2857;
		} else {
			totalSolarKWh = solarData.reduce((sum, kwh) => sum + kwh, 0);
		}
	}
	console.log(
		"[DEBUG] calculateCurrentEstimatedBill - totalSolarKWh:",
		totalSolarKWh,
	);

	// 3. Net usage (cannot go below zero)
	// Removed netKWh calculation as per task requirements.
	// console.log("[DEBUG] calculateCurrentEstimatedBill - netKWh:", netKWh); // Removed logging

	// 4. Apply tariff based on totalKWh and average tariff rate
	let estimatedBill = 0;
	let avgRate = 0;

	if (Array.isArray(tariffData) && tariffData.length > 0) {
		if (tariffData[0].ratePerKWh !== undefined) {
			// Calculate average rate from array of objects
			const totalRate = tariffData.reduce(
				(sum, rate) => sum + rate.ratePerKWh,
				0,
			);
			avgRate = totalRate / tariffData.length;
		} else if (typeof tariffData[0] === "number") {
			// Calculate average rate from array of numbers (assuming hourly rates)
			const totalRate = tariffData.reduce((sum, rate) => sum + rate, 0);
			avgRate = totalRate / tariffData.length;
		}
	} else if (typeof tariffData === "number") {
		// Use flat rate if tariffData is a single number
		avgRate = tariffData;
	} else {
		// fallback: flat rate 0.35
		avgRate = 0.35;
	}

	estimatedBill = totalKWh * avgRate;

	return estimatedBill;
}

/**
 * Calculates total monthly energy usage from a list of appliances.
 * @param {Array<object>} appliances - Array of appliance objects.
 * @returns {number} Total energy usage in kWh for the month.
 */
export function calculateEnergyUsage(appliances) {
	let totalKWh = 0;
	appliances.forEach((appliance) => {
		const dailyKWh =
			(appliance.powerWatts * appliance.typicalDailyHours) / 1000;
		totalKWh += dailyKWh * 30; // Monthly usage
	});
	return totalKWh;
}

/**
 * Calculates the monthly cost based on energy usage and tariff rates.
 * @param {number} energyUsage - Total energy usage in kWh.
 * @param {Array<object>} tariff - Array of tariff objects, each with a `ratePerKWh` property.
 * @returns {number} Calculated monthly cost.
 */
export function calculateMonthlyCost(energyUsage, tariff) {
	// Simple average tariff calculation
	const totalRate = tariff.reduce((sum, rate) => sum + rate.ratePerKWh, 0);
	const avgRate = totalRate / tariff.length;

	return energyUsage * avgRate;
}

/**
 * Calculates daily energy usage for a week, distributing total weekly usage randomly across 7 days.
 * @param {Array<object>} appliances - Array of appliance objects.
 * @returns {Array<number>} Array of 7 numbers representing daily energy usage in kWh for the week.
 */
export function calculateWeeklyEnergyUsage(appliances) {
	const dailyUsage = Array(7).fill(0);
	appliances.forEach((appliance) => {
		const totalWeeklyKWh =
			(appliance.powerWatts * appliance.typicalDailyHours * 7) / 1000;
		// Generate 7 random fractions that sum to 1
		let randoms = Array(7)
			.fill(0)
			.map(() => Math.random());
		const sum = randoms.reduce((a, b) => a + b, 0);
		randoms = randoms.map((r) => r / sum);
		// Distribute totalWeeklyKWh according to random fractions
		randoms.forEach((fraction, i) => {
			dailyUsage[i] += totalWeeklyKWh * fraction;
		});
	});
	return dailyUsage;
}

// Calculate daily solar generation for the week
// calculateWeeklySolarGeneration removed; use AI-generated data only.

/**
 * Calculates daily energy usage for a month, distributing total monthly usage randomly across 30 days.
 * @param {Array<object>} appliances - Array of appliance objects.
 * @returns {Array<number>} Array of 30 numbers representing daily energy usage in kWh for the month.
 */
export function calculateMonthlyEnergyUsage(appliances) {
	// Create array for 30 days of the month
	const monthlyUsage = Array(30).fill(0);

	appliances.forEach((appliance) => {
		const totalMonthlyKWh =
			(appliance.powerWatts * appliance.typicalDailyHours * 30) / 1000;
		// Generate 30 random fractions that sum to 1
		let randoms = Array(30)
			.fill(0)
			.map(() => Math.random());
		const sum = randoms.reduce((a, b) => a + b, 0);
		randoms = randoms.map((r) => r / sum);
		// Distribute totalMonthlyKWh according to random fractions
		randoms.forEach((fraction, i) => {
			monthlyUsage[i] += totalMonthlyKWh * fraction;
		});
	});
	return monthlyUsage;
}

// Import the AI-powered recommendation function
import { generateOptimisationRecommendations } from "./aiService.js";

/**
 * Wrapper around AI recommendation function that formats the input data properly.
 * Ensures the fixed tariff rate of 45.62 sen per kilowatt hour is used internally for AI recommendations.
 * @param {Array<object>} appliances - Array of appliance objects.
 * @param {number} budget - Monthly budget target.
 * @param {Array<number>|object} solarData - Solar generation data (array of kWh values or an object).
 * @param {Array<object>|Array<number>|number} tariffData - Original tariff data used for bill calculation (can be array or number).
 * @param {string} usageMode - The current usage mode (e.g., 'on-demand', 'eco').
 * @returns {Promise<string>} AI-generated advice.
 */
export async function generateOptimisationAdvice(
	appliances,
	budget,
	solarData,
	tariffData,
	usageMode,
) {
	// Calculate current bill for bill overview
	const currentBill = calculateCurrentEstimatedBill(
		appliances,
		solarData,
		tariffData,
	);
	const targetBill = budget;

	// Consistent percentDiff calculation (current vs target)
	const percentDiff = targetBill > 0 ? ((currentBill - targetBill) / targetBill) * 100 : 0;
	const absPercentDiff = Math.abs(percentDiff).toFixed(0);
	const isOverBudget = currentBill > targetBill;

	// --- Calculate bill after solar offset ---
	// Use the 'solarData' and 'tariffData' parameters passed to this function for these calculations.
	let totalSolarKWh = 0;
	if (Array.isArray(solarData) && solarData.length > 0) {
		if (solarData.length === 24) { // Hourly data for a day, common case
			totalSolarKWh = solarData.reduce((sum, kwh) => sum + (kwh || 0), 0) * 30; // Monthly
		} else if (solarData.length === 7) { // Daily data for a week
			totalSolarKWh = solarData.reduce((sum, kwh) => sum + (kwh || 0), 0) * (30 / 7); // Approx. Monthly
		} else { // Assumed to be daily data for a month, or a pre-aggregated monthly total if not 24/7 length.
			totalSolarKWh = solarData.reduce((sum, kwh) => sum + (kwh || 0), 0);
		}
	} else if (typeof solarData === 'number') { // Handles if solarData is a single pre-aggregated monthly value
	    totalSolarKWh = solarData;
	}

	let avgRate = 0;
	// Use the original 'tariffData' parameter (used for currentBill) to calculate avgRate for solar savings.
	const originalTariffData = tariffData;
	if (Array.isArray(originalTariffData) && originalTariffData.length > 0) {
		if (originalTariffData[0] && typeof originalTariffData[0].ratePerKWh === "number") {
			const totalRate = originalTariffData.reduce((sum, rate) => sum + (rate.ratePerKWh || 0), 0);
			avgRate = originalTariffData.length > 0 ? totalRate / originalTariffData.length : 0;
		} else if (typeof originalTariffData[0] === "number") {
			const totalRate = originalTariffData.reduce((sum, rate) => sum + (rate || 0), 0);
			avgRate = originalTariffData.length > 0 ? totalRate / originalTariffData.length : 0;
		}
	} else if (typeof originalTariffData === "number") {
		avgRate = originalTariffData;
	}

	// Fallback for avgRate if tariffData was not parsable or resulted in 0, use the fixed rate.
	if (isNaN(avgRate) || avgRate === 0) {
	    avgRate = 0.4562; 
	}

	const solarSavings = totalSolarKWh * avgRate;
	const billAfterSolar = Math.max(0, currentBill - solarSavings);
	const percentDiffAfterSolar = targetBill > 0 ? ((billAfterSolar - targetBill) / targetBill) * 100 : 0;
	const absPercentDiffAfterSolar = Math.abs(percentDiffAfterSolar).toFixed(0);
	const isOverBudgetAfterSolar = billAfterSolar > targetBill;

	// Ensure tariffData for the AI prompt is the fixed rate of 0.4562 RM per kWh.
	// This is a specific requirement for the AI's context.
	const fixedTariffRateForAI = 0.4562;

	// Prepare input data for AI recommendations
	const inputData = {
		appliances,
		budget,
		solarData, // Pass original solarData
		tariffData: fixedTariffRateForAI, // AI sees the fixed rate
		usageMode: usageMode || "on-demand",
		billOverview: {
			currentBill,
			targetBill,
			percentDiff,
			absPercentDiff,
			isOverBudget,
			// Add comprehensive solar metrics
			billAfterSolar,
			solarSavings,
			percentDiffAfterSolar,
			absPercentDiffAfterSolar,
			isOverBudgetAfterSolar,
		},
	};

	try {
		// Call the AI-powered recommendation function
		const advice = await generateOptimisationRecommendations(inputData);
		return advice;
	} catch (error) {
		console.error("Error generating AI recommendations:", error);

		// Fallback to a simple message if AI fails
		return `Unable to generate AI recommendations at this time. Please try again later.

Your current bill is estimated at RM${currentBill.toFixed(2)} with a target of RM${budget}.
Your fixed tariff rate is 45.62 sen per kilowatt hour.`;
	}
}
