# Extension & Contribution Guide

This guide explains how to safely extend, modify, or contribute new features to EnergiWatch-MVP.

---

## Adding a New Feature

1. **Plan Your Feature:**
   - Define the feature's purpose and which part of the app it affects (UI, logic, state, AI, etc).
2. **Create/Modify Modules:**
   - Add a new JS module in `js/` if needed.
   - Update or create relevant functions in `ui.js`, `logic.js`, or `eventHandlers.js`.
3. **Wire Up Events:**
   - Add new event listeners in `main.js` or `eventHandlers.js`.
   - Ensure UI elements have unique IDs/classes for targeting.
4. **Update State Management:**
   - Use `state.js` and `storage.js` for persistent data.
5. **UI Changes:**
   - Update `ui.js` for DOM manipulation and visual feedback.
   - Add/modify Tailwind classes or custom CSS as needed.
6. **Testing:**
   - Test thoroughly in the browser.
   - Use browser console logs for debugging.

---

## Enforcing Business Rules

- The electricity tariff is always fixed at 45.62 sen/kWh (0.4562 RM/kWh). Ensure any changes to billing logic maintain this constant (see `logic.js`, `eventHandlers.js`).
- Any generated features must not override this tariff rate.

---

## Best Practices

- Keep modules focused and small.
- Use named exports for all functions.
- Document new functions with JSDoc comments.
- Use debug logging (`logger.js`) for non-UI errors.
- Avoid hardcoding UI text; consider using a constants or locale module if needed.

---

## Contributing

- Follow existing code style (ES6 modules, functional approach).
- Update this documentation as you add features.
- For major changes, discuss with the team first.

### Branching Strategy

When adding new features or making significant changes, it is recommended to use a branching strategy. Common practices include:
- Using a `dev` branch for general development and integration of multiple features.
- Using `feature` branches (e.g., `feature/my-new-feature`) for isolated development of specific features.
Please follow our team's established branching strategy for consistency.

---

For questions or suggestions, update this file or contact the maintainer.
