/**
 * @file usageModeToggle.js
 * @description Functions for initializing and updating the UI of the usage mode toggle button (On-demand / 24/7).
 */

/**
 * Initialize the usage mode toggle with direct event listener
 * @param {Function} onToggle - Callback function when toggle is clicked, receives the new mode as an argument.
 */
export function initUsageModeToggle(onToggle) {
    const toggle = document.getElementById('usageModeToggle');
    if (!toggle) {
        console.error('Usage mode toggle not found');
        return;
    }
    
    // Clear any existing click handlers to prevent duplicates
    toggle.onclick = null;
    
    // Add the direct click listener
    toggle.addEventListener('click', function() {
        console.log('Usage mode toggle clicked');
        
        // Get current mode from data attribute
        const currentMode = this.dataset.mode || 'on-demand';
        
        // Toggle the mode
        if (currentMode === 'on-demand') {
            // Change to 24/7 mode
            this.dataset.mode = '24/7';
            this.textContent = '24/7';
            this.classList.remove('bg-gray-200', 'text-gray-800', 'dark:bg-gray-700', 'dark:text-gray-200');
            this.classList.add('bg-blue-600', 'text-white');
        } else {
            // Change to on-demand mode
            this.dataset.mode = 'on-demand';
            this.textContent = 'On-demand';
            this.classList.remove('bg-blue-600', 'text-white');
            this.classList.add('bg-gray-200', 'text-gray-800', 'dark:bg-gray-700', 'dark:text-gray-200');
        }
        
        // Call the provided toggle handler
        if (onToggle) {
            onToggle(this.dataset.mode);
        }
        
        // Update the AI recommendation button text
        const aiButton = document.getElementById("getAIRecommendations");
        if (aiButton) {
            aiButton.textContent = "Regenerate AI Recommendations";
        }
    });
}

/**
 * Update the usage mode toggle UI
 * @param {string} mode - The current mode ('on-demand' or '24/7')
 */
export function updateUsageModeToggle(mode) {
    const toggle = document.getElementById('usageModeToggle');
    if (!toggle) return;
    
    // Update the data attribute and UI
    toggle.dataset.mode = mode;
    
    if (mode === '24/7') {
        toggle.textContent = '24/7';
        toggle.classList.remove('bg-gray-200', 'text-gray-800', 'dark:bg-gray-700', 'dark:text-gray-200');
        toggle.classList.add('bg-blue-600', 'text-white');
    } else {
        toggle.textContent = 'On-demand';
        toggle.classList.remove('bg-blue-600', 'text-white');
        toggle.classList.add('bg-gray-200', 'text-gray-800', 'dark:bg-gray-700', 'dark:text-gray-200');
    }
}
