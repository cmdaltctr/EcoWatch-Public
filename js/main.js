/**
 * main.js - Main application logic for EnergiWatch
 * 
 * This file has been refactored for better maintainability by moving
 * most functionality to dedicated modules.
 */

import {
	loadDarkModePreference,
	createEnergyChart,
	renderTariffEditor,
	toggleDarkMode,
	initUsageModeToggle,
	displayRecommendations,
	updateEnergyChart,
	updateBillOverview,
	renderApplianceList,
	updateDataSourceIndicator
} from "./ui.js";

import {
	initializeState,
	setUsageMode,
	getUsageMode,
	getAppliances,
	getUsageData,
	getSolarData,
	getTariffData,
	getNeedsRegeneration,
	setNeedsRegeneration,
	isDataAIGenerated
} from "./state.js";

import {
	handleEssentialToggle,
	handleAIDemoData,
	handleAIRecommendations,
	handleBudgetChange,
	handleTariffSave,
	handleUsageModeToggle,
	handleContinuousToggle,
	handleViewToggle
} from "./eventHandlers.js";

import { calculateCurrentEstimatedBill } from "./logic.js";

// Initialize the state module
initializeState();

/**
 * Initialize the application
 */
async function init() {
	// Wait for DOM to be fully loaded
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
		return;
	}

	// Load dark mode preference
	loadDarkModePreference();

	// Initialize energy chart
	createEnergyChart();
	
	// Initialize UI with existing data or generate demo data if none exists
	const currentAppliances = getAppliances();
	const currentSolarData = getSolarData();
	const currentUsageData = getUsageData();

	console.log('Initial data check:', {
		hasAppliances: !!currentAppliances?.length,
		hasSolarData: !!currentSolarData,
		hasUsageData: !!currentUsageData
	});

	if (!currentAppliances?.length || !currentSolarData || !currentUsageData) {
		// If any critical data is missing, generate new demo data
		console.log('Generating new demo data...');
		await handleAIDemoData();
	} else {
		// We have all necessary data, update the UI
		console.log('Loading existing data...');
		renderApplianceList(currentAppliances, handleEssentialToggle);
		
		// Update energy chart with existing data
		updateEnergyChart(currentUsageData, currentSolarData);
		
		// Update bill overview
		const budgetInput = document.getElementById("budget");
		const budget = parseFloat(budgetInput?.value) || 100;
		const currentBill = calculateCurrentEstimatedBill(
			currentAppliances,
			currentSolarData,
			getTariffData()
		);
		updateBillOverview(currentBill, budget, currentSolarData, currentAppliances, getTariffData());
		
		// Show data source indicator with existing data based on stored state
		updateDataSourceIndicator(isDataAIGenerated());
	}

	// Add event listeners
	const darkModeToggle = document.getElementById("darkModeToggle");
	const budgetInput = document.getElementById("budget");
	const usageModeToggle = document.getElementById("usageModeToggle");

	// Add dark mode toggle event listener
	if (darkModeToggle) {
		darkModeToggle.addEventListener("click", toggleDarkMode);
	}

	// Add budget input event listener
	if (budgetInput) {
		budgetInput.addEventListener("input", handleBudgetChange);
	}

	// New AI feature buttons
	const generateAIDemoData = document.getElementById("generateAIDemoData");
	if (generateAIDemoData) {
		generateAIDemoData.addEventListener("click", handleAIDemoData);
	}
	
	const getAIRecommendations = document.getElementById("getAIRecommendations");
	if (getAIRecommendations) {
		getAIRecommendations.addEventListener("click", handleAIRecommendations);
	}
	
	// Robustly initialize usage mode toggle with debug logging and retry if needed
	function robustInitUsageModeToggle(retries = 5) {
		const toggle = document.getElementById('usageModeToggle');
		if (!toggle) {
			console.error('[DEBUG] usageModeToggle button not found. Retrying... Retries left:', retries);
			if (retries > 0) {
				setTimeout(() => robustInitUsageModeToggle(retries - 1), 300);
			}
			return;
		}
		initUsageModeToggle(async (mode) => {
			console.log('[DEBUG] Usage mode changed to:', mode);
			// Update the state first
			setUsageMode(mode);
			
			try {
				// Wait for the next tick to ensure state is updated
				await new Promise(resolve => setTimeout(resolve, 0));
				
				// Get the AI button and trigger click
				const aiButton = document.getElementById("getAIRecommendations");
				if (aiButton) {
					// Show loading state
					displayRecommendations("Updating recommendations for " + mode + " mode...");
					
					// Call handleAIRecommendations directly with the updated state
					await handleAIRecommendations();
				}
			} catch (err) {
				console.error('Error updating AI recommendations:', err);
				displayRecommendations("Error updating recommendations. Please try again.");
			}
		});
		console.log('[DEBUG] usageModeToggle event handler attached successfully.');
	}
	robustInitUsageModeToggle();

	// Set up event delegation for essential and continuous toggles
	document.addEventListener('click', handleEssentialToggle);
	document.addEventListener('click', handleContinuousToggle);

	// Initialize with AI-generated data by triggering the handler
	await handleAIDemoData();
	
	// Render tariff editor with fixed value of 45.62 sen/kWh (0.4562 RM/kWh)
	try {
		renderTariffEditor(0.4562, handleTariffSave);
	} catch (err) {
		console.error("Error rendering tariff editor:", err);
	}
}

// Initialize view toggle buttons
document.addEventListener('DOMContentLoaded', () => {
	init();
	
	// Set up view toggle buttons
	document.getElementById('dayViewBtn')?.addEventListener('click', () => handleViewToggle('day'));
	document.getElementById('weekViewBtn')?.addEventListener('click', () => handleViewToggle('week'));
	document.getElementById('monthViewBtn')?.addEventListener('click', () => handleViewToggle('month'));
});
