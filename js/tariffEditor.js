/**
 * @file tariffEditor.js
 * @description Functions for rendering and updating the tariff editor UI,
 * allowing the user to modify the electricity tariff rate.
 */

/**
 * Render the fixed tariff editor (single input)
 * @param {number} tariff - Current tariff rate
 * @param {Function} onSave - Callback function when tariff is saved
 */
export function renderTariffEditor(tariff = 0.35, onSave) {
    const form = document.getElementById("tariffForm");
    const input = document.getElementById("tariffRateInput");
    if (!form || !input) return;
    
    input.value = tariff.toFixed(2);
    
    // Clear any existing handlers to prevent duplicates
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Set up the form submission
    newForm.onsubmit = (e) => {
        e.preventDefault();
        const newTariff = parseFloat(input.value) || 0.35;
        if (onSave) onSave(newTariff);
    };
}

/**
 * Update the displayed tariff rate
 * @param {number} tariff - New tariff rate to display
 */
export function updateTariffDisplay(tariff) {
    const input = document.getElementById("tariffRateInput");
    if (input) {
        input.value = tariff.toFixed(2);
    }
    
    // Also update any other elements that display the tariff rate
    const tariffDisplays = document.querySelectorAll(".tariff-display");
    tariffDisplays.forEach(display => {
        display.textContent = `RM${tariff.toFixed(4)}/kWh`;
    });
}
