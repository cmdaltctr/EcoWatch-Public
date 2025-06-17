/**
 * @file applianceList.js
 * @description Functions for rendering and updating the appliance list in the UI,
 * including individual appliance cards and their toggle states (essential, continuous operation).
 */
import { setApplianceEssential } from './state.js';

/**
 * Render the list of appliances
 * @param {Array} appliances - Array of appliance objects
 */
export function renderApplianceList(appliances) {
    const appliancesList = document.getElementById("appliancesList");
    
    // Clear previous content
    appliancesList.innerHTML = '';
    
    // Create grid container
    const gridContainer = document.createElement('div');
    gridContainer.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
    
    // Add appliance cards
    appliances.forEach(appliance => {
        // Create appliance card
        const applianceCard = document.createElement('div');
        applianceCard.className = "bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200";
        
        // Create flex container for card content
        const flexContainer = document.createElement('div');
        flexContainer.className = "flex justify-between items-center";
        
        // Create left side with name and details
        const leftSide = document.createElement('div');
        
        // Add appliance name
        const nameElement = document.createElement('h3');
        nameElement.className = "font-semibold text-lg";
        nameElement.textContent = appliance.name;
        leftSide.appendChild(nameElement);
        
        // Add power and usage details
        const detailsElement = document.createElement('p');
        detailsElement.className = "text-sm text-gray-600 dark:text-gray-400 mt-1";
        detailsElement.textContent = `Power: ${appliance.powerWatts}W • Daily Usage: ${appliance.typicalDailyHours}h`;
        leftSide.appendChild(detailsElement);
        
        // Create right side with toggles
        const rightSide = document.createElement('div');
        rightSide.className = "flex items-center space-x-2";
        
        // Create essential toggle button
        const essentialToggle = document.createElement('button');
        essentialToggle.className = `essential-toggle cursor-pointer px-2.5 py-1 rounded-full text-xs font-medium ${
            appliance.isEssential 
                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" 
                : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
        }`;
        essentialToggle.textContent = appliance.isEssential ? "Essential" : "Non-Essential";
        essentialToggle.dataset.applianceId = appliance.id;
        
        // The click handler is managed by handleEssentialToggle in eventHandlers.js
        // which is set up in main.js to handle clicks on elements with class 'essential-toggle'
        
        // Create continuous operation toggle button
        const continuousToggle = document.createElement('button');
        continuousToggle.className = `continuous-toggle cursor-pointer px-2.5 py-1 rounded-full text-xs font-medium ${
            appliance.isContinuouslyOn 
                ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100" 
                : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
        }`;
        continuousToggle.textContent = appliance.isContinuouslyOn ? "24/7" : "On Demand";
        continuousToggle.dataset.applianceId = appliance.id;
        
        // Assemble the card
        rightSide.appendChild(essentialToggle);
        rightSide.appendChild(continuousToggle);
        flexContainer.appendChild(leftSide);
        flexContainer.appendChild(rightSide);
        applianceCard.appendChild(flexContainer);
        gridContainer.appendChild(applianceCard);
    });
    
    // Add the grid to the appliance list container
    appliancesList.appendChild(gridContainer);
}

/**
 * Update the visual state of an appliance's essential toggle
 * @param {string} applianceId - ID of the appliance
 * @param {boolean} isEssential - Whether the appliance is now essential
 */
export function updateApplianceEssentialToggle(applianceId, isEssential) {
    const toggle = document.querySelector(`.essential-toggle[data-appliance-id="${applianceId}"]`);
    if (toggle) {
        toggle.textContent = isEssential ? "Essential" : "Non-Essential";
        toggle.classList.toggle("bg-green-100", isEssential);
        toggle.classList.toggle("text-green-800", isEssential);
        toggle.classList.toggle("dark:bg-green-800", isEssential);
        toggle.classList.toggle("dark:text-green-100", isEssential);
        toggle.classList.toggle("bg-blue-100", !isEssential);
        toggle.classList.toggle("text-blue-800", !isEssential);
        toggle.classList.toggle("dark:bg-blue-800", !isEssential);
        toggle.classList.toggle("dark:text-blue-100", !isEssential);
    }
}

/**
 * Update the visual state of an appliance's continuous operation toggle
 * @param {string} applianceId - ID of the appliance
 * @param {boolean} isContinuouslyOn - Whether the appliance is now in continuous operation mode
 */
export function updateApplianceContinuousToggle(applianceId, isContinuouslyOn) {
    const toggle = document.querySelector(`.continuous-toggle[data-appliance-id="${applianceId}"]`);
    if (toggle) {
        toggle.textContent = isContinuouslyOn ? "24/7" : "On Demand";
        toggle.classList.toggle("bg-blue-100", isContinuouslyOn);
        toggle.classList.toggle("text-blue-800", isContinuouslyOn);
        toggle.classList.toggle("dark:bg-blue-800", isContinuouslyOn);
        toggle.classList.toggle("dark:text-blue-100", isContinuouslyOn);
        toggle.classList.toggle("bg-gray-200", !isContinuouslyOn);
        toggle.classList.toggle("text-gray-700", !isContinuouslyOn);
        toggle.classList.toggle("dark:bg-gray-600", !isContinuouslyOn);
        toggle.classList.toggle("dark:text-gray-200", !isContinuouslyOn);
    }
}
