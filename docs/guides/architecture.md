# Architecture Overview

EnergiWatch-MVP is a modular, browser-based energy monitoring and optimization app. Its architecture emphasizes maintainability, separation of concerns, and extensibility.

## Main Layers

- **UI Layer**: Handles DOM rendering, user interaction, and visual feedback. Core UI updates are in `ui.js`, with specialized modules for chart display (`chartUtils.js`) and recommendations (`recommendations.js`).
- **Logic Layer**: Contains business logic for energy calculations, bill estimation, and AI integration (see `logic.js`, `aiService.js`).
- **State Management**: Maintains app state in memory and local storage (see `state.js`, `storage.js`).
- **Event Handling**: Centralizes all event listeners and user-driven actions (see `eventHandlers.js`).

## Data Flow

1. **User Input**: Users interact with UI elements (e.g., toggles, forms, buttons).
2. **Event Handling**: `eventHandlers.js` processes events, updates state, and triggers logic/UI updates.
3. **State Updates**: Changes are reflected in the state and/or persisted to storage.
4. **Logic Execution**: Core calculations (bill, usage, AI recommendations) run in `logic.js` and `aiService.js`.
5. **UI Rendering**: The UI is updated by `ui.js`, `chartUtils.js`, or `recommendations.js` to reflect new data, state changes, or AI-generated advice.

## Extensibility

- All major features are modularized.
- Adding new features typically involves creating a new module and wiring it into `main.js` and `eventHandlers.js`.
- The tariff rate is enforced as a constant (45.62 sen/kWh, 0.4562 RM/kWh) throughout the logic layer.

---

See [js-modules.md](js-modules.md) for details on each JavaScript file/module.
