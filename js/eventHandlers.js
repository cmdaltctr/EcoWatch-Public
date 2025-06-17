/**
 * eventHandlers.js - Contains all event handlers for EnergiWatch
 */

import {
	renderApplianceList,
	displayRecommendations,
	toggleDarkMode,
	updateEnergyChart,
	renderTariffEditor,
	updateBillOverview,
	updateChartView,
	updateDataSourceIndicator,
} from "./ui.js";

import {
	generateOptimisationAdvice,
	calculateCurrentEstimatedBill,
	calculateMonthlyEnergyUsage,
} from "./logic.js";

import {
	generateDemoData,
	generateOptimisationRecommendations,
	generateLocalDemoData,
} from "./aiService.js";

import {
	getAppliances,
	setAppliances,
	getSolarData,
	setSolarData,
	getUsageData,
	setUsageData,
	getTariffData,
	setTariffData,
	getUsageMode,
	setUsageMode,
	getNeedsRegeneration,
	setNeedsRegeneration,
	isDataAIGenerated,
	setDataAIGenerated,
} from "./state.js";

import {
	loadTariffFromStorage,
	saveTariffToStorage,
	saveAppState,
} from "./storage.js";

/**
 * Handle tariff save - user sets the new tariff
 * @param {number} newTariff - The new tariff rate set by user
 */
export async function handleTariffSave(newTariff) {
	// Always enforce the fixed tariff
	setTariffData(0.4562);
	saveTariffToStorage(0.4562);

	// Recalculate bill and update recommendations
	const budgetInput = document.getElementById("budget");
	const budget = parseFloat(budgetInput?.value) || 100;
	const currentBill = calculateCurrentEstimatedBill(
		getAppliances(),
		getSolarData(),
		getTariffData(),
	);

	// Show loading state while waiting for AI
	displayRecommendations("Generating energy optimization advice...");

	try {
		// --- Calculate bill overview for AI recommendations ---
		const appliances = getAppliances();
		const solarData = getSolarData();
		const tariffData = getTariffData();
		const currentBill = calculateCurrentEstimatedBill(
			appliances,
			solarData,
			tariffData,
		);
		const targetBill = budget;
		const percentDiff =
			targetBill > 0 ? ((currentBill - targetBill) / targetBill) * 100 : 0;
		const absPercentDiff = Math.abs(percentDiff).toFixed(0);
		const isOverBudget = currentBill > targetBill;

		// Calculate bill after solar offset
		let totalSolarKWh = 0;
		if (Array.isArray(solarData) && solarData.length > 0) {
			if (solarData.length === 24) {
				totalSolarKWh = solarData.reduce((sum, kwh) => sum + kwh, 0) * 30;
			} else if (solarData.length === 7) {
				totalSolarKWh = solarData.reduce((sum, kwh) => sum + kwh, 0) * 4.2857;
			} else {
				totalSolarKWh = solarData.reduce((sum, kwh) => sum + kwh, 0);
			}
		}
		let avgRate = 0;
		if (Array.isArray(tariffData) && tariffData.length > 0) {
			if (tariffData[0].ratePerKWh !== undefined) {
				const totalRate = tariffData.reduce(
					(sum, rate) => sum + rate.ratePerKWh,
					0,
				);
				avgRate = totalRate / tariffData.length;
			} else if (typeof tariffData[0] === "number") {
				const totalRate = tariffData.reduce((sum, rate) => sum + rate, 0);
				avgRate = totalRate / tariffData.length;
			}
		} else if (typeof tariffData === "number") {
			avgRate = tariffData;
		} else {
			avgRate = 0.35;
		}
		const solarSavings = totalSolarKWh * avgRate;
		const billAfterSolar = Math.max(0, currentBill - solarSavings);
		const percentDiffAfterSolar =
			targetBill > 0 ? ((billAfterSolar - targetBill) / targetBill) * 100 : 0;
		const absPercentDiffAfterSolar = Math.abs(percentDiffAfterSolar).toFixed(0);
		const isOverBudgetAfterSolar = billAfterSolar > targetBill;

		const inputData = {
			appliances,
			budget,
			solarData,
			tariffData,
			usageMode: getUsageMode(),
			billOverview: {
				currentBill,
				targetBill,
				percentDiff,
				absPercentDiff,
				isOverBudget,
				billAfterSolar,
				percentDiffAfterSolar,
				absPercentDiffAfterSolar,
				isOverBudgetAfterSolar,
			},
		};
		const recommendations =
			await generateOptimisationRecommendations(inputData);
		displayRecommendations(recommendations);
	} catch (error) {
		console.error("Error generating recommendations:", error);
		displayRecommendations(
			"Unable to generate recommendations at this time. Please try again later.",
		);
	}

	// Update Bill Overview section
	updateBillOverview(
		currentBill,
		budget,
		getSolarData(),
		getAppliances(),
		getTariffData(),
	);

	// Show current bill
	const recommendationsSection = document.getElementById("recommendations");
	if (recommendationsSection) {
		let billElement = recommendationsSection.querySelector(
			".text-sm.text-gray-600.dark\\:text-gray-400.mt-2",
		);
		if (billElement) {
			billElement.textContent = `Current estimated monthly bill: RM${currentBill.toFixed(2)}`;
		} else {
			billElement = document.createElement("p");
			billElement.className = "text-sm text-gray-600 dark:text-gray-400 mt-2";
			billElement.textContent = `Current estimated monthly bill: RM${currentBill.toFixed(2)}`;
			recommendationsSection.appendChild(billElement);
		}
	}
}

/**
 * Handle continuous toggle click
 * @param {Event} event - The click event
 */
export async function handleContinuousToggle(event) {
	// Check if the click was on a button with class continuous-toggle
	const target = event.target;
	if (
		!target.classList.contains("continuous-toggle") &&
		!target.closest(".continuous-toggle")
	) {
		return;
	}

	event.preventDefault();
	event.stopPropagation();

	// Find the toggle element (could be the target or its parent)
	const toggleButton = target.classList.contains("continuous-toggle")
		? target
		: target.closest(".continuous-toggle");

	// Get appliance ID from data attribute
	const applianceId = toggleButton.dataset.applianceId;
	if (!applianceId) {
		console.error("No appliance ID found on toggle button");
		return;
	}

	console.log("Continuous toggle clicked for appliance ID:", applianceId);

	// Get current appliances from state
	const appliances = getAppliances();
	if (!appliances || !Array.isArray(appliances)) {
		console.error("No appliances found in state or invalid format");
		return;
	}

	// Find the appliance to toggle by ID (compare as string, do not use parseInt)
	const applianceIndex = appliances.findIndex(
		(a) => String(a.id) === String(applianceId),
	);
	if (applianceIndex === -1) {
		console.error(`Appliance with ID ${applianceId} not found`);
		return;
	}

	// Toggle isContinuouslyOn flag
	const updatedAppliance = { ...appliances[applianceIndex] };
	updatedAppliance.isContinuouslyOn = !updatedAppliance.isContinuouslyOn;

	console.log(
		`Toggled appliance ${updatedAppliance.name} to ${updatedAppliance.isContinuouslyOn ? "24/7" : "On Demand"}`,
	);

	// Create a copy of the appliances array with the updated appliance
	const updatedAppliances = [...appliances];
	updatedAppliances[applianceIndex] = updatedAppliance;

	// Save the updated appliances to state
	setAppliances(updatedAppliances);

	// Update the UI to reflect the changes
	renderApplianceList(updatedAppliances);

	// Update the AI recommendation button text
	const aiButton = document.getElementById("getAIRecommendations");
	if (aiButton) {
		aiButton.textContent = "Regenerate AI Recommendations";
	}
}

/**
 * Handle essential toggle click
 * @param {Event} event - The click event
 */
export async function handleEssentialToggle(event) {
	// Check if the click was on a span with class essential-toggle
	const target = event.target;
	if (
		!target.classList.contains("essential-toggle") &&
		!target.closest(".essential-toggle")
	) {
		return;
	}

	event.preventDefault();
	event.stopPropagation();

	// Find the toggle element (could be the target or its parent)
	const toggleButton = target.classList.contains("essential-toggle")
		? target
		: target.closest(".essential-toggle");

	// Get appliance ID from data attribute
	const applianceId = toggleButton.dataset.applianceId;
	if (!applianceId) {
		console.error("No appliance ID found on toggle button");
		return;
	}

	console.log("Toggle clicked for appliance ID:", applianceId);

	// Get current appliances from state
	const appliances = getAppliances();
	if (!appliances || !Array.isArray(appliances)) {
		console.error("No appliances found in state or invalid format");
		return;
	}

	// Find the appliance to toggle by ID (compare as string, do not use parseInt)
	const applianceIndex = appliances.findIndex(
		(a) => String(a.id) === String(applianceId),
	);
	if (applianceIndex === -1) {
		console.error(`Appliance with ID ${applianceId} not found`);
		return;
	}

	// Toggle isEssential flag
	const updatedAppliance = { ...appliances[applianceIndex] };
	updatedAppliance.isEssential = !updatedAppliance.isEssential;

	console.log(
		`Toggled appliance ${updatedAppliance.name} to ${updatedAppliance.isEssential ? "Essential" : "Non-Essential"}`,
	);

	// Create a copy of the appliances array with the updated appliance
	const updatedAppliances = [...appliances];
	updatedAppliances[applianceIndex] = updatedAppliance;

	// Save the updated appliances to state
	setAppliances(updatedAppliances);

	// Update the UI to reflect the changes
	renderApplianceList(updatedAppliances);

	// Update the AI recommendation button text
	const aiButton = document.getElementById("getAIRecommendations");
	if (aiButton) {
		aiButton.textContent = "Regenerate AI Recommendations";
	}

	// Update Bill Overview only (do not regenerate recommendations)
	const budgetInput = document.getElementById("budget");
	const budget = parseFloat(budgetInput?.value) || 100;
	const fixedTariffRate = 0.4562; // 45.62 sen per kWh
	const currentBill = calculateCurrentEstimatedBill(
		updatedAppliances,
		getSolarData(),
		fixedTariffRate,
	);
	updateBillOverview(
		currentBill,
		budget,
		getSolarData(),
		getAppliances(),
		getTariffData(),
	);
}

/**
 * Handle AI demo data button click
 */
export async function handleAIDemoData() {
	// Show status line under the Generate AI Demo Data button
	const aiDemoStatus = document.getElementById("aiDemoStatus");
	if (aiDemoStatus) {
		aiDemoStatus.textContent = "Generating AI demo data...";
		aiDemoStatus.style.display = "block";
	}
	displayRecommendations("Loading AI demo data...");
	try {
		// Generate demo data
		console.log("Starting to generate demo data...");
		const data = await generateDemoData();
		console.log("Demo data generated:", {
			appliances: data.appliances?.length || 0,
			solarData: data.solarData?.length || 0,
			usageData: data.usageData?.length || 0,
		});

		// Update all state with the generated data
		console.log("Updating state with new data...");
		setAppliances(data.appliances || []);
		setSolarData(data.solarData || []);
		setUsageData(data.usageData || []);

		// Ensure tariff data is set
		console.log("Setting tariff data...");
		setTariffData(0.4562);

		// Track whether data was AI-generated or locally generated
		const isAIGenerated = data.isAIGenerated || false;
		console.log(
			"Data source:",
			isAIGenerated ? "AI-generated" : "Local fallback",
		);

		// Update the AI data source state
		setDataAIGenerated(isAIGenerated);

		// Save individual state components which automatically handles storage
		console.log("Saving application state...");

		// Update UI
		console.log("Rendering appliance list...");
		renderApplianceList(getAppliances(), handleEssentialToggle);

		// Update data source indicator to show AI vs local data source
		updateDataSourceIndicator(isAIGenerated);

		// Render tariff editor with fixed value
		try {
			renderTariffEditor(0.4562, handleTariffSave);
		} catch (err) {
			console.error("Error rendering tariff editor:", err);
		}

		// Update Bill Overview with current bill and budget
		const budgetInput = document.getElementById("budget");
		const budget = parseFloat(budgetInput?.value) || 100;
		const currentBill = calculateCurrentEstimatedBill(
			getAppliances(),
			getSolarData(),
			getTariffData(),
		);
		updateBillOverview(
			currentBill,
			budget,
			getSolarData(),
			getAppliances(),
			getTariffData(),
		);

		// Update energy chart
		const monthlyUsage = calculateMonthlyEnergyUsage(getAppliances());

		// Create 30 days of solar data with good variation
		let monthlySolar;
		const solarData = getSolarData();
		if (!solarData || !Array.isArray(solarData) || solarData.length === 0) {
			// Create default solar data if none exists
			setSolarData(
				Array(24)
					.fill(0)
					.map(() => +(Math.random() * 4.9 + 0.1).toFixed(2)),
			);
		}

		// Always create 30 days of solar data with good variation
		monthlySolar = Array(30)
			.fill(0)
			.map((_, dayIndex) => {
				let baseValue;
				const solarArray = getSolarData();

				if (solarArray.length === 24) {
					// For hourly data, use a random hour as the base value
					const randomHour = Math.floor(Math.random() * 24);
					baseValue = solarArray[randomHour];
				} else if (solarArray.length === 7) {
					// For weekly data, use the corresponding day of week
					const weekDay = dayIndex % 7;
					baseValue = solarArray[weekDay];
				} else {
					// For any other length, cycle through available values
					const index = dayIndex % solarArray.length;
					baseValue = solarArray[index];
				}

				// Ensure baseValue is a number and not zero
				if (
					typeof baseValue !== "number" ||
					isNaN(baseValue) ||
					baseValue === 0
				) {
					baseValue = 0.5 + Math.random() * 4.5; // Default between 0.5 and 5
				}

				// Add variation to create realistic patterns (±30%)
				const variation = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
				return +(baseValue * variation).toFixed(2);
			});

		updateEnergyChart(monthlyUsage, monthlySolar);

		// Generate and display recommendations
		displayRecommendations("Generating energy optimization advice...");
		try {
			const recommendations = await generateOptimisationAdvice(
				getAppliances(),
				budget,
				getSolarData(),
				getTariffData(),
			);
			displayRecommendations(recommendations);
		} catch (error) {
			console.error("Error generating recommendations:", error);
			displayRecommendations(
				"Unable to generate recommendations at this time. Please try again later.",
			);
		}

		// Update AI demo status
		if (aiDemoStatus) {
			aiDemoStatus.textContent = "AI demo data generated successfully!";
			setTimeout(() => {
				aiDemoStatus.style.display = "none";
			}, 3000);
		}
	} catch (err) {
		console.error("Error generating AI demo data:", err);
		displayRecommendations("Error generating AI demo data: " + err.message);

		if (aiDemoStatus) {
			aiDemoStatus.textContent = "Error generating AI demo data!";
			aiDemoStatus.style.display = "block";
		}
	}
}

/**
 * Handle AI recommendation button click
 */
export async function handleAIRecommendations() {
	displayRecommendations("Generating AI recommendations...");
	try {
		const budgetInput = document.getElementById("budget");
		const budget = parseFloat(budgetInput.value) || 100;
		// Calculate Bill Overview values
		const currentBill = calculateCurrentEstimatedBill(
			getAppliances(),
			getSolarData(),
			getTariffData(),
		);
		// Calculate target bill
		const targetBill = budget;
		// Calculate percentage difference
		const percentDiff =
			targetBill > 0 ? ((currentBill - targetBill) / targetBill) * 100 : 0;
		// Calculate absolute percentage difference
		const absPercentDiff = Math.abs(percentDiff).toFixed(0);
		// Check if current bill is over budget
		const isOverBudget = currentBill > targetBill;

		// --- Calculate bill after solar offset ---
		let totalSolarKWh = 0;
		const solarData = getSolarData();
		const tariffData = getTariffData();
		// Calculate total solar kWh
		if (Array.isArray(solarData) && solarData.length > 0) {
			if (solarData.length === 24) {
				totalSolarKWh = solarData.reduce((sum, kwh) => sum + kwh, 0) * 30;
			} else if (solarData.length === 7) {
				totalSolarKWh = solarData.reduce((sum, kwh) => sum + kwh, 0) * 4.2857;
			} else {
				totalSolarKWh = solarData.reduce((sum, kwh) => sum + kwh, 0);
			}
		}
		// Calculate average rate
		let avgRate = 0;
		if (Array.isArray(tariffData) && tariffData.length > 0) {
			if (tariffData[0].ratePerKWh !== undefined) {
				const totalRate = tariffData.reduce(
					(sum, rate) => sum + rate.ratePerKWh,
					0,
				);
				avgRate = totalRate / tariffData.length;
			} else if (typeof tariffData[0] === "number") {
				const totalRate = tariffData.reduce((sum, rate) => sum + rate, 0);
				avgRate = totalRate / tariffData.length;
			}
			// Calculate average rate
		} else if (typeof tariffData === "number") {
			avgRate = tariffData;
		} else {
			avgRate = 0.35;
		}
		// Calculate solar savings
		const solarSavings = totalSolarKWh * avgRate;
		// Calculate bill after solar offset
		const billAfterSolar = Math.max(0, currentBill - solarSavings);
		// Calculate percentage difference after solar offset
		const percentDiffAfterSolar =
			targetBill > 0 ? ((billAfterSolar - targetBill) / targetBill) * 100 : 0;
		// Calculate absolute percentage difference after solar offset
		const absPercentDiffAfterSolar = Math.abs(percentDiffAfterSolar).toFixed(0);
		const isOverBudgetAfterSolar = billAfterSolar > targetBill;

		// Prepare input data for AI recommendations
		const inputData = {
			appliances: getAppliances(),
			budget,
			solarData: solarData,
			tariffData: tariffData,
			usageMode: getUsageMode(), // Include the usage mode in the input data
			billOverview: {
				currentBill,
				targetBill,
				percentDiff,
				absPercentDiff,
				isOverBudget,
				billAfterSolar,
				percentDiffAfterSolar,
				absPercentDiffAfterSolar,
				isOverBudgetAfterSolar,
			},
		};
		const advice = await generateOptimisationRecommendations(inputData);
		displayRecommendations(advice);
	} catch (err) {
		displayRecommendations(
			"Error generating AI recommendations: " + err.message,
		);
	}
}

/**
 * Handle budget input change
 */
/**
 * Handle usage mode toggle click
 */
export function handleUsageModeToggle() {
	console.log("Usage mode toggle clicked");

	// Get the toggle button
	const toggleBtn = document.getElementById("usageModeToggle");
	if (!toggleBtn) {
		console.error("Toggle button not found");
		return;
	}

	// Get current mode
	const currentMode = toggleBtn.dataset.mode || "on-demand";

	// Switch between modes
	if (currentMode === "on-demand") {
		// Switch to 24/7 mode
		setUsageMode("24/7");
		toggleBtn.textContent = "24/7";
		toggleBtn.dataset.mode = "24/7";
		toggleBtn.className =
			"px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors";
	} else {
		// Switch to on-demand mode
		setUsageMode("on-demand");
		toggleBtn.textContent = "On-demand";
		toggleBtn.dataset.mode = "on-demand";
		toggleBtn.className =
			"px-3 py-1.5 rounded-md text-sm font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors";
	}

	console.log(`Usage mode changed to: ${getUsageMode()}`);
}

/**
 * Handle view toggle between day/week/month
 * @param {string} view - The view to switch to ('day', 'week', or 'month')
 */
export function handleViewToggle(view) {
	try {
		// Update the chart view
		updateChartView(view);

		// Log the view change
		console.log(`[DEBUG] Switched to ${view} view`);
	} catch (error) {
		console.error("Error switching view:", error);
		displayRecommendations("Error switching view. Please try again.");
	}
}

/**
 * Handles changes to the budget input.
 * Recalculates bill overview, updates energy chart, and regenerates AI recommendations.
 */
export async function handleBudgetChange() {
	// Get budget input
	const budgetInput = document.getElementById("budget");
	if (!budgetInput) return;

	const budget = parseFloat(budgetInput.value);

	// Use stored energy usage and solar generation data instead of recalculating
	if (!getAppliances()) return;

	// --- HANDLE USAGE DATA ---
	let monthlyUsage;

	// Check if we already have AI-generated usage data
	if (
		!getUsageData() ||
		!Array.isArray(getUsageData()) ||
		getUsageData().length === 0
	) {
		// Always generate local data first for immediate display
		const localData = generateLocalDemoData();
		setUsageData(localData.usageData);
		monthlyUsage = localData.usageData;

		// Then try to get AI-generated data in the background
		generateDemoData()
			.then((data) => {
				// Only update if we got valid usage data
				if (
					data &&
					data.usageData &&
					Array.isArray(data.usageData) &&
					data.usageData.length > 0
				) {
					setUsageData(data.usageData);
					monthlyUsage = data.usageData;

					// After setting new data, update the chart with both usage and solar data
					if (getSolarData() && Array.isArray(getSolarData())) {
						updateEnergyChart(data.usageData, getSolarData());
					}
				}
			})
			.catch((err) => {
				console.error("Error generating AI usage data:", err);
				// Already using local data, so no fallback needed
			});
	} else {
		// Use the existing usage data
		const usageArray = getUsageData();

		// If we don't have 30 days of data, expand it to 30 days
		if (usageArray.length !== 30) {
			monthlyUsage = Array(30)
				.fill(0)
				.map((_, dayIndex) => {
					const index = dayIndex % usageArray.length;
					return usageArray[index];
				});
		} else {
			// We already have 30 days of data - use it directly
			monthlyUsage = usageArray;
		}
	}

	// --- HANDLE SOLAR DATA ---
	let monthlySolar;

	// Ensure we have non-zero values for solar data
	if (
		!getSolarData() ||
		!Array.isArray(getSolarData()) ||
		getSolarData().length === 0
	) {
		// Always generate local data first for immediate display
		const localData = generateLocalDemoData();
		setSolarData(localData.solarData);
		monthlySolar = localData.solarData;

		// Then try to get AI-generated data in the background
		generateDemoData()
			.then((data) => {
				// Only update if we got valid solar data
				if (
					data &&
					data.solarData &&
					Array.isArray(data.solarData) &&
					data.solarData.length > 0
				) {
					setSolarData(data.solarData);
					monthlySolar = data.solarData;

					// After setting new data, update the chart with both usage and solar data
					if (getUsageData() && Array.isArray(getUsageData())) {
						updateEnergyChart(getUsageData(), data.solarData);
					}
				}
			})
			.catch((err) => {
				console.error("Error generating AI solar data:", err);
				// Already using local data, so no fallback needed
			});
	} else {
		// Use the existing solar data
		const solarArray = getSolarData();

		// If we don't have 30 days of data, expand it to 30 days
		if (solarArray.length !== 30) {
			monthlySolar = Array(30)
				.fill(0)
				.map((_, dayIndex) => {
					const index = dayIndex % solarArray.length;
					return solarArray[index];
				});
		} else {
			// We already have 30 days of data - use it directly
			monthlySolar = solarArray;
		}
	}

	// Update chart
	updateEnergyChart(monthlyUsage, monthlySolar);

	// Update recommendations
	displayRecommendations("Generating energy optimization advice...");
	try {
		const recommendations = await generateOptimisationAdvice(
			getAppliances(),
			budget,
			getSolarData(),
			getTariffData(),
		);
		displayRecommendations(recommendations);
	} catch (error) {
		console.error("Error generating recommendations:", error);
		displayRecommendations(
			"Unable to generate recommendations at this time. Please try again later.",
		);
	}

	// Update Bill Overview
	const currentBill = calculateCurrentEstimatedBill(
		getAppliances(),
		getSolarData(),
		getTariffData(),
	);
	updateBillOverview(
		currentBill,
		budget,
		getSolarData(),
		getAppliances(),
		getTariffData(),
	);
}
