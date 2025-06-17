/**
 * @file aiService.js
 * @description Modular Gemini API integration for EnergiWatch-MVP using Cloudflare Pages Functions.
 * Provides functions to generate demo data and optimisation recommendations.
 */

// Available Gemini models
const GEMINI_MODELS = {
	FLASH: "gemini-2.0-flash", // Reliable working model
	PRO_1_5: "gemini-1.5-pro", // Latest available Pro model
	PRO_LEGACY: "gemini-2.0-pro", // Older Pro, likely unavailable
	VISION: "gemini-2.0-vision",
	// Add more models as they become available
};

// Default model to use - change this single line to switch models across the application
const GEMINI_MODEL = GEMINI_MODELS.FLASH;

/**
 * Calls Gemini API via our secure Pages Function proxy.
 * @param {string} prompt
 * @param {string} [model=GEMINI_MODEL] - Optional model override
 * @returns {Promise<string>}
 */
async function callGemini(prompt, model = GEMINI_MODEL) {
	try {
		// Call our Pages Function instead of the Gemini API directly
		const response = await fetch("/api/gemini", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				prompt,
				model,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`API error: ${errorData.error || response.statusText}`);
		}

		const data = await response.json();

		// Extract the text from the Gemini API response
		const text =
			data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";

		return text;
	} catch (err) {
		console.error("Gemini API error:", err);
		throw new Error("Gemini API error: " + (err.message || err));
	}
}

/**
 * Generates random but realistic demo appliance, solar, and usage data for the application using the Gemini API.
 * Falls back to local generation if the API call fails or returns invalid data.
 * @returns {Promise<object>} A promise that resolves to an object containing:
 * - `appliances`: {Array<object>} Array of appliance objects.
 * - `solarData`: {Array<number>} Array of 30 daily solar generation kWh values.
 * - `usageData`: {Array<number>} Array of 30 daily energy usage kWh values.
 * - `tariffData`: {number} Fixed tariff rate (0.4562).
 * - `isAIGenerated`: {boolean} Flag indicating whether data was AI-generated or using local fallback.
 */
import { logError } from "./logger.js";

// Function to generate demo data using AI
export async function generateDemoData() {
	console.log("[AI DEBUG] generateDemoData called");
	// Updated prompt for more realistic Malaysian household data and solar generation logic
	const prompt = `Generate a JSON object representing 30 days of data for a typical middle-income Malaysian household (e.g., 3-5 occupants). The data should include:
1.  'appliances': An array of 5 to 8 common household appliances. Each appliance object must have:
    *   'id': A unique string identifier (e.g., "appliance1").
    *   'name': A descriptive name (e.g., "Refrigerator", "Air Conditioner 1.5HP").
    *   'powerWatts': A realistic power consumption value in watts (e.g., Refrigerator: 100-200W, Air Conditioner 1.5HP: 1200-1500W). Ensure values are not zero.
    *   'typicalDailyHours': A realistic number for average daily hours of operation (e.g., Refrigerator: 24, Air Conditioner: 4-8).
    *   'isContinuouslyOn': A boolean, true if the appliance typically runs 24/7 (like a refrigerator).
    *   'isEssential': A boolean, true if the appliance is generally considered essential.
2.  'solarData': An array of 30 numbers representing daily solar energy generation in kWh.
    *   Values should be realistic for a Malaysian residential solar panel system (e.g., typically between 0 kWh on very overcast days or if system is off, up to 15 kWh on a very sunny day for a moderately sized system, but average around 4-10 kWh).
    *   Vary the values daily to simulate weather changes. Not all values should be zero or the same.
    *   Crucially, these are daily totals. Implicitly, solar generation only occurs during daylight hours; the daily total should reflect this. For example, a day with 12 hours of strong sun would yield a higher kWh than a day with only 6 hours of weak sun. DO NOT generate solar data that would imply generation during nighttime.
3.  'usageData': An array of 30 numbers representing total daily household energy consumption in kWh.
    *   Values should be realistic for the described Malaysian household, considering the appliances and solar generation (e.g., typically between 10 kWh and 30 kWh).
    *   Vary the values daily.
    *   Ensure usage is generally higher than solar generation, but sometimes solar might cover a significant portion.
Return ONLY the JSON object, with no introductory text, explanations, or markdown formatting. The JSON should be directly parsable.`;
	// Call Gemini
	let data;
	let isAIGenerated = true; // Flag to track if data was AI-generated
	try {
		const response = await callGemini(prompt);
		const jsonStart = response.indexOf("{");
		const jsonEnd = response.lastIndexOf("}") + 1;
		// Log raw Gemini response
		console.log("[AI DEBUG] Gemini raw response:", response);
		data = JSON.parse(response.slice(jsonStart, jsonEnd));
		// Log parsed Gemini data
		console.log("[AI DEBUG] Parsed Gemini data:", data);
	} catch (e) {
		// Handle errors
		const errMsg = `[generateDemoData] Gemini failed, using local fallback. Error: ${e && e.message ? e.message : e}`;
		console.warn("[AI DEBUG] Gemini failed, using local fallback. Error:", e);
		logError(errMsg);
		data = generateLocalDemoData();
		isAIGenerated = false;
	}

	// If Gemini response is nested under 'household', extract it
	if (data && typeof data === "object" && data.household) {
		data = data.household;
	}
	// Fallback: If solarData or appliances are all zero/invalid, use local random data
	if (
		!data ||
		!Array.isArray(data.solarData) ||
		data.solarData.every((v) => v === 0) ||
		!Array.isArray(data.appliances) ||
		data.appliances.length === 0
	) {
		const errMsg = `[generateDemoData] Gemini data invalid/empty, using local fallback. Data: ${JSON.stringify(data)}`;
		console.warn(
			"[AI DEBUG] Gemini data invalid/empty, using local fallback. Data:",
			data,
		);
		logError(errMsg);
		data = generateLocalDemoData();
		isAIGenerated = false;
	}
	// Always return top-level { appliances, solarData, usageData, tariffData }
	// --- Ensure both arrays are present and length 30 ---
	let solarDataOut =
		Array.isArray(data.solarData) && data.solarData.length === 30
			? data.solarData
			: Array.from(
					{ length: 30 },
					() => +(Math.random() * 7.5 + 0.5).toFixed(2),
				);
	let usageDataOut =
		Array.isArray(data.usageData) && data.usageData.length === 30
			? data.usageData
			: Array.from({ length: 30 }, () => +(Math.random() * 17 + 8).toFixed(2));

	// If using local data for solar or usage data, set the flag to false
	if (!Array.isArray(data.solarData) || !Array.isArray(data.usageData)) {
		isAIGenerated = false;
	}

	return {
		appliances: data.appliances,
		solarData: solarDataOut,
		usageData: usageDataOut,
		tariffData: 0.4562, // Fixed tariff rate as per requirements
		isAIGenerated: isAIGenerated, // Include flag in the returned data
	};
}

/**
 * Generates random demo data locally as a fallback.
 * Uses cached data for solar and usage to provide consistency across calls if AI fails repeatedly.
 * @returns {object} An object containing:
 * - `appliances`: {Array<object>} Array of randomly generated appliance objects.
 * - `solarData`: {Array<number>} Array of 30 cached or newly generated daily solar kWh values.
 * - `usageData`: {Array<number>} Array of 30 cached or newly generated daily usage kWh values.
 * - `tariffData`: {number} Fixed tariff rate (0.4562).
 */
let cachedSolarData = null;
let cachedUsageData = null;

export function generateLocalDemoData() {
	// Helper to randomize appliance
	function randomAppliance(id) {
		const names = [
			"Refrigerator",
			"Air Conditioner",
			"TV",
			"Washing Machine",
			"Microwave",
			"Fan",
			"Lights",
			"Water Heater",
			"Laptop",
			"Oven",
		];
		return {
			id: `appliance${id}`,
			name: names[Math.floor(Math.random() * names.length)],
			powerWatts: Math.floor(Math.random() * 1800) + 50, // 50W to 1850W
			typicalDailyHours: +(Math.random() * 12 + 1).toFixed(1), // 1 to 13 hours
			isContinuouslyOn: Math.random() < 0.3,
			isEssential: Math.random() < 0.5,
		};
	}
	// 5-8 appliances
	const appliances = Array.from(
		{ length: Math.floor(Math.random() * 4) + 5 },
		(_, i) => randomAppliance(i + 1),
	);

	// Generate solar data only once and reuse it in subsequent calls
	if (!cachedSolarData || cachedSolarData.length !== 30) {
		cachedSolarData = Array.from(
			{ length: 30 },
			() => +(Math.random() * 7.5 + 0.5).toFixed(2),
		);
	}

	// Generate usage data only once and reuse it in subsequent calls
	if (!cachedUsageData || cachedUsageData.length !== 30) {
		cachedUsageData = Array.from(
			{ length: 30 },
			() => +(Math.random() * 17 + 8).toFixed(2),
		);
	}

	return {
		appliances,
		solarData: cachedSolarData,
		usageData: cachedUsageData,
		tariffData: 0.4562, // Fixed tariff rate as per requirements
	};
}

/**
 * Generates natural language energy optimisation advice based on user data using the Gemini API.
 * @param {object} inputData - The input data for generating recommendations.
 * @param {Array<object>} inputData.appliances - Array of appliance objects.
 * @param {number} inputData.budget - Monthly budget target.
 * @param {Array<number>|object} inputData.solarData - Solar generation data.
 * @param {number|Array<object>|Array<number>} inputData.tariffData - Tariff data.
 * @param {string} [inputData.usageMode='on-demand'] - Current usage mode ('on-demand' or '24/7').
 * @param {object} inputData.billOverview - Overview of the current bill status.
 * @returns {Promise<string>} A promise that resolves to a string containing AI-generated advice in Markdown format.
 */
export async function generateOptimisationRecommendations(inputData) {
	// Extract usage mode, defaulting to on-demand if not provided
	const usageMode = inputData.usageMode || "on-demand";

	const prompt = `IMPORTANT: Ensure strict adherence to the following Markdown formatting:
- Use Markdown for formatting.
- Ensure there is a blank line between each section or headings or paragraph.
- Make sure there's bold headings, and use proper headings: # Heading 1 (h1) for the main title, ## Heading 2 (h2) for subheadings, ### Heading 3 (h3) for sub-subheadings, and #### Heading 4 (h4) for sub-sub-subheadings if needed.

Given the following Malaysian household energy data and bill overview in JSON:
${JSON.stringify(inputData, null, 2)}

Please analyse the data and provide detailed, actionable, and easy-to-understand recommendations to help the user save money on their electricity bills.

## Solar Analysis Requirements:
- Perform a detailed analysis of the solar generation data (\`solarData\`) and its impact on the bill.
- Identify patterns in solar generation (high/low production days) and correlate with potential weather patterns.
- Calculate the percentage of household energy needs being met by solar and highlight this metric.
- Reference specific values from \`billOverview.solarSavings\` and \`billOverview.billAfterSolar\` to quantify the financial benefits.
- Recommend optimal times to use high-consumption appliances based on typical solar generation patterns.
- Suggest strategies to maximize solar utilization (e.g., scheduling energy-intensive tasks during peak solar hours).
- If solar generation is significantly lower than household consumption, suggest potential system expansion considerations.

## General Analysis Requirements:
- Actively compare "on demand" vs "24/7" usage patterns. Identify which appliances are always on (24/7) and which are used on demand.
- Distinguish between essential and non-essential appliances. Suggest strategies to reduce or shift usage of non-essential and 24/7 appliances.
- Recommend specific actions, such as scheduling, reducing standby power, or turning off non-essential devices when not needed.
- Estimate potential savings where possible, and explain the reasoning behind each suggestion.
- Use clear, accessible language. Avoid generic tips—base all advice on the provided data.
- If helpful, summarise the main deductions and analyses before giving the advice.
- If the user is over budget, suggest ways to reduce their energy usage.
- If the user is under budget, suggest ways to increase their energy usage.
- Use British English Spelling in the generated text.
- Use RM in the context of Malaysian Ringgit and Malaysian currency.
- Use kWh in the context of kilowatt-hours.
- Ensure the generated words are concise and accurately reflect the data.
- Ensure the content not more than 500 words - IMPORTANT.


Here is an example of the desired formatting:

# Main Title

Some introductory text. Say how much the generated solar power saved your bills.

## Subheading

Some text under the subheading.

### Sub-subheading

Some text under the sub-subheading.

#### Sub-sub-subheading

Some text under the sub-sub-subheading.

Another paragraph with a blank line before it.

Output only the advice text.`;
	return callGemini(prompt);
}
