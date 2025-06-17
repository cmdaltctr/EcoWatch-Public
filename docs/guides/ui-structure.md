# UI Structure & Styling

This document describes the UI layout, DOM structure, and how JavaScript interacts with the HTML and CSS in EnergiWatch-MVP.

---

## Main Layout (index.html)

- Uses a single-page layout with sections for:
  - Appliance list
  - Energy usage & solar generation chart
  - Bill overview
  - Tariff editor
  - AI recommendations
  - User settings (dark mode, budget, usage mode toggles)
- Responsive design using Tailwind CSS (see `input.css`, `tailwind.config.js`).

---

## JavaScript-Driven UI

- **JavaScript Modules for UI**: UI rendering is handled by several modules:
  - **`ui.js`**: Manages general UI elements.
    - `renderApplianceList()`: Builds appliance cards and toggles dynamically.
    - `renderTariffEditor()`: Renders the tariff input.
    - `updateBillOverview()`: Updates bill and solar contribution summaries.
    - `toggleDarkMode()`, `loadDarkModePreference()`: Handle dark mode.
    - `initUsageModeToggle()`: Initializes usage mode toggle.
  - **`chartUtils.js`**: Manages the energy chart.
    - `createEnergyChart()`: Renders the initial usage vs solar line chart (using Chart.js).
    - `updateEnergyChart()`: Updates the chart with new data.
    - `updateChartView()`: Handles switching between day/week/month views.
  - **`recommendations.js`**: Manages the display of recommendations.
    - `displayRecommendations()`: Renders AI advice (supports Markdown via `marked.js`).
    - `showRecommendationsLoading()`, `showRecommendationsError()`: Handle loading/error states for the recommendations panel.
- **Event delegation** is used for toggles to minimize DOM listeners and improve performance.

---

## CSS & Theming

- Uses Tailwind CSS utility classes for layout and theming.
- Dark mode is handled via a toggle, with preference persisted in local storage.
- Custom styles can be found in `css/styles.css` and `input.css`.

---

## DOM-Module Mapping Example

| UI Feature          | HTML Element ID/Class         | JS Function(s)                |
|---------------------|------------------------------|-------------------------------|
| Appliance List      | `#appliancesList`            | `ui.js::renderApplianceList`         |
| Tariff Editor       | `#tariffForm`, `#tariffRateInput` | `ui.js::renderTariffEditor`     |
| Energy Chart        | `#energyChart`               | `chartUtils.js::createEnergyChart`, `chartUtils.js::updateEnergyChart`, `chartUtils.js::updateChartView` |
| Bill Overview       | `#monthlyBillEstimate`, `#monthlyTargetBill`, `#billComparisonResult`, `#solarContribution` | `ui.js::updateBillOverview` |
| AI Recommendations  | `#recommendations`           | `recommendations.js::displayRecommendations`, `recommendations.js::showRecommendationsLoading`, `recommendations.js::showRecommendationsError` |
| Dark Mode Toggle    | `#darkModeToggle`            | `ui.js::toggleDarkMode`, `ui.js::loadDarkModePreference` |
| Budget Input        | `#budget`                    | `handleBudgetChange`          |
| Usage Mode Toggle   | `#usageModeToggle`           | `ui.js::initUsageModeToggle` (UI part), `eventHandlers.js::handleUsageModeToggle` (logic part) |

---

For more details, see the HTML and CSS files, and refer to `js/ui.js`, `js/chartUtils.js`, and `js/recommendations.js` for their respective UI logic.
