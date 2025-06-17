# API Integration (Current & Future)

## Current State

- The app integrates with Gemini AI via the `@google/genai` SDK in `aiService.js`.
- API key is loaded from environment variables (`.env`, `import.meta.env`).
- All API calls are handled asynchronously with error fallback to local demo data.

## Adding New APIs

- Add new API integration code in a dedicated JS module (e.g., `weatherApi.js`).
- Store API keys securely in `.env` and never commit secrets to version control.
- Use async/await and robust error handling.
- Document new endpoints and usage in this file.

## Example: Gemini AI Integration

- See `aiService.js` for prompt structure and error handling.
- All AI-powered features (demo data, recommendations) are routed through this module.

## Security Notes

- Never expose API keys in client-side code or public repos.
- Use environment variables and build tools (e.g., Vite) to inject secrets at build time.

---

Update this file as we add or change API integrations.
