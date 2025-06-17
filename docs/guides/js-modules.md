# JavaScript Modules & Interactions

EnergiWatch-MVP is organized into modular JavaScript files, each with a clear responsibility. Below is a summary of each major module and how they interact:

---

## main.js

- **Role:** Entry point; initializes the app, sets up event listeners, and orchestrates module interactions.
- **Imports:**
  - UI utilities (`ui.js`)
  - State management (`state.js`)
  - Event handlers (`eventHandlers.js`)
  - Chart utilities (`chartUtils.js`)
- **Key Functions:**
  - `init()`: Initializes the UI, state, event handlers, and chart on DOM load.
  - Handles robust initialization of toggles and triggers initial data loading.

---

## ui.js

- **Role:** Handles general DOM manipulation and UI rendering (excluding chart display and recommendations).
- **Exports:**
  - `renderTariffEditor`, `renderApplianceList`, `toggleDarkMode`, `loadDarkModePreference`, `initUsageModeToggle`, `updateBillOverview`
- **Interactions:**
  - Called by `main.js` and `eventHandlers.js` to update the UI based on state changes or user input.

---

## logic.js

- **Role:** Core business logic for energy calculations and bill estimation.
- **Exports:**
  - `calculateCurrentEstimatedBill`, `calculateEnergyUsage`, `calculateMonthlyCost`, `calculateWeeklyEnergyUsage`, `calculateMonthlyEnergyUsage`, `generateOptimisationAdvice`
- **Interactions:**
  - Used by `eventHandlers.js` to process user data and trigger calculations.
  - Enforces the fixed tariff rate (45.62 sen/kWh) in all calculations.

---

## aiService.js

- **Role:** Integrates with Gemini AI for demo data and optimization advice.
- **Exports:**
  - `generateDemoData`, `generateLocalDemoData`, `generateOptimisationRecommendations`
- **Interactions:**
  - Called by `eventHandlers.js` and `logic.js` for AI-powered features.
  - Fallbacks to local data if API fails.

---

## eventHandlers.js

- **Role:** Centralizes all event listeners and handlers for user actions.
- **Exports:**
  - `handleTariffSave`, `handleContinuousToggle`, `handleEssentialToggle`, `handleAIDemoData`, `handleAIRecommendations`, `handleUsageModeToggle`, `handleBudgetChange`
- **Interactions:**
  - Connects UI events to logic/state updates and UI re-renders.
  - Calls `logic.js` for calculations.
  - Calls `aiService.js` to fetch AI-powered data or advice.
  - Calls `recommendations.js` to display advice.
  - Calls `chartUtils.js` to update chart views or data.
  - Calls `ui.js` for other general UI updates.
  - Interacts with `state.js` and `storage.js` for data management.

---

## state.js & storage.js

- **Role:** Manage application state in memory and persist to local storage.
- **Exports:**
  - `getAppliances`, `setAppliances`, `getSolarData`, `setSolarData`, etc. (representative examples)
- **Interactions:**
  - Used by most modules to get/set persistent data.

---

## recommendations.js

- **Role:** Manages the display of AI-generated optimization advice and other recommendations in the UI. Handles loading and error states for the recommendations section. Uses `marked.js` for rendering Markdown content.
- **Exports:**
  - `displayRecommendations`, `showRecommendationsLoading`, `showRecommendationsError`
- **Interactions:**
  - Called by `eventHandlers.js` (e.g., after `handleAIRecommendations` successfully fetches advice) to render the recommendations.
  - Relies on `marked.js` (loaded via CDN) for Markdown to HTML conversion.

---

## chartUtils.js

- **Role:** Handles all aspects of the energy usage and solar generation chart, including its creation, data updates, and view switching (daily, weekly, monthly).
- **Exports:**
  - `energyChart` (the Chart.js instance)
  - `createEnergyChart`
  - `updateChartView`
  - `updateEnergyChart`
- **Interactions:**
  - `createEnergyChart` is typically called by `main.js` during application initialization.
  - `updateChartView` is called by `eventHandlers.js` (e.g., when the user clicks day/week/month view buttons).
  - `updateEnergyChart` is called when new data is available, likely triggered via `eventHandlers.js` or after state updates.
  - Imports `getUsageData`, `getSolarData` from `state.js` to populate the chart.

---

## data.js, logger.js

- **Role:** Utility modules for static data (e.g., default appliance list) and logging errors/debug info.

---

## Module Interaction Diagram

main.js
  ├── ui.js
  ├── state.js
  ├── chartUtils.js      // For chart creation
  │     └── state.js   // Chart utils gets data from state
  └── eventHandlers.js
        ├── logic.js
        │     └── aiService.js
        ├── ui.js
        ├── recommendations.js // For displaying recommendations
        ├── chartUtils.js      // For chart updates/view changes
        ├── state.js
        └── storage.js

// data.js and logger.js are utility modules, typically imported where needed
// but not central to this high-level interaction flow.

For more details on each module, see their respective code files.
