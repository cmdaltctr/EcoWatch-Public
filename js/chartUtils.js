/**
 * @file chartUtils.js
 * @description Utilities for creating and updating the energy usage chart.
 * Uses Chart.js for rendering.
 */
import { getUsageData, getSolarData } from './state.js';
import { generateHourlyDistribution } from './dataGenerators.js';

/**
 * @typedef {Object} ChartJsChart Represents a Chart.js Chart instance. Original type: import('chart.js').Chart
 * @typedef {Object} ChartJsTooltipItem Represents a Chart.js TooltipItem for a 'line' chart. Original type: import('chart.js').TooltipItem<'line'>
 */

/** @type {ChartJsChart | null} */
export let energyChart = null;
let currentView = 'month'; // 'day', 'week', or 'month'

/**
 * Generates time labels for the chart's x-axis based on the selected view.
 * @param {string} view - The current chart view ('day', 'week', or 'month').
 * @returns {string[]} An array of time labels.
 */
function generateTimeLabels(view) {
	switch(view) {
		case 'day':
			return Array(24).fill(0).map((_, i) => `${i.toString().padStart(2, '0')}:00`);
		case 'week':
			return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
		case 'month':
		default:
			return Array(30).fill(0).map((_, i) => `Day ${i + 1}`);
	}
}

/**
 * Gets the chart title based on the selected view.
 * @param {string} view - The current chart view ('day', 'week', or 'month').
 * @returns {string} The chart title.
 */
function getChartTitle(view) {
	switch(view) {
		case 'day': return 'Hourly Energy Usage';
		case 'week': return 'Daily Energy Usage (This Week)';
		case 'month': return 'Daily Energy Usage (This Month)';
		default: return 'Energy Usage';
	}
}

/**
 * Gets the x-axis title based on the selected view.
 * @param {string} view - The current chart view ('day', 'week', or 'month').
 * @returns {string} The x-axis title.
 */
function getXAxisTitle(view) {
	switch(view) {
		case 'day': return 'Hour of Day';
		case 'week': return 'Day of Week';
		case 'month': return 'Day of Month';
		default: return 'Time';
	}
}

/**
 * Formats the tooltip content based on the selected view.
 * @param {ChartJsTooltipItem} context - The tooltip context from Chart.js.
 * @param {string} view - The current chart view ('day', 'week', or 'month').
 * @returns {string} The formatted tooltip string.
 */
function formatTooltip(context, view) {
	const label = context.label || '';
	const value = context.parsed.y.toFixed(2);
	const datasetLabel = context.dataset.label || '';
	
	if (view === 'day') {
		return `${datasetLabel} at ${label}: ${value} kWh`;
	} else if (view === 'week') {
		return `${datasetLabel} on ${label}: ${value} kWh`;
	} else {
		return `${datasetLabel} on ${label}: ${value} kWh`;
	}
}

/**
 * Creates the initial energy chart instance or recreates it if it already exists.
 * The chart displays energy usage and solar generation data.
 */
export function createEnergyChart() {
	const canvas = document.getElementById("energyChart");
	if (!canvas) return;

	const ctx = canvas.getContext("2d");

	// Clear any existing chart
	if (energyChart) {
		energyChart.destroy();
	}

	// Get labels based on current view
	const labels = generateTimeLabels(currentView);

	energyChart = new Chart(ctx, {
		type: "line",
		data: {
			labels: labels,
			datasets: [
				{
					label: "Energy Usage (kWh)",
					data: Array(labels.length).fill(0),
					borderColor: "rgb(59, 130, 246)",
					backgroundColor: "rgba(59, 130, 246, 0.1)",
					tension: 0.3,
					fill: true,
					pointRadius: 2,
					borderWidth: 2,
				},
				{
					label: "Solar Generation (kWh)",
					data: Array(labels.length).fill(0),
					borderColor: "rgb(255, 193, 7)",
					backgroundColor: "rgba(255, 193, 7, 0.1)",
					tension: 0.3,
					fill: true,
					pointRadius: 2,
					borderWidth: 2,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			interaction: {
				mode: "index",
				intersect: false,
			},
			plugins: {
				title: {
					display: true,
					text: getChartTitle(currentView),
					font: {
						size: 16,
						weight: 'bold'
					}
				},
				legend: {
					position: "top",
					labels: {
						usePointStyle: true,
						padding: 20
					}
				},
				tooltip: {
					mode: "index",
					intersect: false,
					callbacks: {
						label: (context) => formatTooltip(context, currentView)
					}
				},
			},
			scales: {
				y: {
					beginAtZero: true,
					title: {
						display: true,
						text: "Energy (kWh)",
						font: {
							weight: 'bold'
						}
					},
					ticks: {
						callback: function(value) {
							return value.toFixed(1);
						}
					}
				},
				x: {
					title: {
						display: true,
						text: getXAxisTitle(currentView),
						font: {
							weight: 'bold'
						}
					},
					ticks: {
						autoSkip: true,
						maxRotation: 0,
						maxTicksLimit: currentView === 'day' ? 12 : currentView === 'week' ? 7 : 15,
						callback: function(val, index) {
							// For day view, show every 2 hours
							if (currentView === 'day' && index % 2 !== 0) return '';
							// For month view, show every 5 days
							if (currentView === 'month' && index % 5 !== 0) return '';
							return this.getLabelForValue(val);
						}
					}
				},
			},
		},
		animation: {
			duration: 500,
			easing: 'easeInOutQuart'
		}
	});
}

/**
 * Updates the chart's view to display data for a day, week, or month.
 * It regenerates labels, updates titles, and refreshes the chart data.
 * Also updates the active state of the view toggle buttons.
 * @param {string} view - The view to switch to ('day', 'week', or 'month').
 */
export function updateChartView(view) {
	if (view === currentView) return;
	
	currentView = view;
	
	// Update active button styles
	document.querySelectorAll('#dayViewBtn, #weekViewBtn, #monthViewBtn').forEach(btn => {
		// Remove all potentially conflicting style classes (old active, old inactive, new active) and any border classes.
		btn.classList.remove(
			'text-white', 'bg-blue-700', 'dark:bg-blue-600',             // Old active classes
			'border-blue-700', 'dark:border-blue-600',                   // Old active border classes
			'text-gray-900', 'bg-white', 'dark:text-white',              // Specific old inactive classes that differ from new
			'border-gray-200', 'dark:border-gray-600',                   // Old inactive border classes
			'bg-blue-200', 'text-blue-700', 'dark:bg-blue-700', 'dark:text-blue-200' // New active classes
		);
		// Add new inactive classes (consistent with index.html)
		btn.classList.add(
			'bg-gray-200', 'text-gray-800', 'dark:bg-gray-700', 'dark:text-gray-200'
		);
	});
	
	const activeBtn = document.getElementById(`${view}ViewBtn`);
	if (activeBtn) {
		// Remove new inactive classes (which were just added to all buttons)
		activeBtn.classList.remove(
			'bg-gray-200', 'text-gray-800', 'dark:bg-gray-700', 'dark:text-gray-200'
		);
		// Add new active classes (consistent with index.html)
		activeBtn.classList.add(
			'bg-blue-200', 'text-blue-700', 'dark:bg-blue-700', 'dark:text-blue-200'
		);
	}
	
	// Recreate chart with new view
	createEnergyChart();
	
	// Update chart data for the new view
	const usageData = getUsageData() || [];
	const solarData = getSolarData() || [];
	updateEnergyChart(usageData, solarData);
}

// Update chart data
export function updateEnergyChart(usageData, solarData) {
	if (!energyChart) return;

	// Aggregate data based on current view
	const aggregatedUsage = aggregateData(usageData, currentView);
	const aggregatedSolar = aggregateData(solarData, currentView, { isSolar: true });

	// Update chart data
	energyChart.data.datasets[0].data = aggregatedUsage;
	energyChart.data.datasets[1].data = aggregatedSolar;

	// Update chart title and axes
	energyChart.options.plugins.title.text = getChartTitle(currentView);
	energyChart.options.scales.x.title.text = getXAxisTitle(currentView);

	// Update x-axis labels
	energyChart.data.labels = generateTimeLabels(currentView);

	// Update x-axis ticks based on view
	if (energyChart.options.scales.x.ticks) {
		energyChart.options.scales.x.ticks.maxTicksLimit = 
			currentView === 'day' ? 12 : 
			currentView === 'week' ? 7 : 15;
	}

	energyChart.update();
}

// Aggregate data based on current view
export function aggregateData(data, view, options = {}) {
	if (!data || data.length === 0) return [];

	switch(view) {
		case 'day':
			// For day view, if it's solar data, distribute the first day's total.
			// Otherwise, assume it's already hourly (e.g., usage data).
			if (options.isSolar && data.length > 0) {
				const dailyTotalForFirstDay = data[0]; // Assumes data[0] is the relevant daily total
				return generateHourlyDistribution(dailyTotalForFirstDay, 'solar');
			} else {
				// For usage data or if solar data is somehow already hourly, return as is.
				return data.slice(0, 24);
			}

		case 'week':
			// For week view, return 7 days of data
			return data.slice(0, 7);

		case 'month':
		default:
			// For month view, return 30 days of data
			return data.slice(0, 30);
	}
}
