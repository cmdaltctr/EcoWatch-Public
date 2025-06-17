# EcoWatch-MVP Documentation

![Version](https://img.shields.io/badge/version-1.1.0-blue)

## Introduction

EcoWatch-MVP is a web-based application designed to help users optimize their electricity usage and costs. The app allows users to set a target monthly electricity bill, input a list of household appliances with energy consumption data, and receive AI-driven recommendations for energy optimization. It also includes a dark mode toggle for user convenience.

### Key Features

- Input a target monthly electricity bill
- Add household appliances with energy consumption data
- Use a "Demo Data" button to populate sample data
- Receive simulated AI-driven recommendations for energy optimization
- Toggle between light and dark mode

---

## Technical Documentation

Technical documentation for EcoWatch-MVP is organized into two main categories:

1. **Guides and Overviews (Manual Documentation):** These documents provide high-level explanations, architectural details, and guides for developers. They are located in the `docs/guides/` directory:

   - [Architecture Overview](docs/guides/architecture.md): High-level architecture and data flow.
   - [JavaScript Modules](docs/guides/js-modules.md): Details on JavaScript modules and their interactions.
   - [UI Structure](docs/guides/ui-structure.md): UI layout, DOM structure, and CSS usage.
   - [Extension Guide](docs/guides/extension-guide.md): Guide for extending and modifying the app.
   - [API Details](docs/guides/api.md): API integration details.
   - [Cloudflare Pages Functions](docs/guides/cloudflare-pages-functions.md): Implementation details for secure API access.
   - [Module Relationships Diagram](docs/guides/diagram.md): Visual representation of module interactions.
   - [Execution Diagrams](docs/guides/execution-diagrams.md): Diagrams illustrating key execution flows.

2. **API Documentation (Auto-generated from Code):** Detailed documentation for all JavaScript modules, functions, and their parameters is auto-generated from JSDoc comments in the source code.
   - **To generate/update API documentation:** Run the command `npm run generate-docs` from the project root. This will populate the `docs/jsdoc/` directory.
   - **To view API documentation:** After generation, open the `docs/jsdoc/index.html` file in your web browser.

This project uses **Tailwind CSS** for styling, ensuring a responsive and modern design. The JavaScript codebase follows a modular structure, with key logic organized within the `js/` directory. The app also includes a functional dark mode toggle for enhanced user experience.

Start with the documents in `docs/guides/` for a big-picture overview. For detailed information on specific functions or modules, generate and consult the JSDoc API documentation.

---

## Configuration

### Local Development

The project uses `.env` and `.env.example` files to store API keys and other configuration details. Ensure you copy `.env.example` to `.env` and populate it with the required values before running the application.

```bash
# Start local development server
npm run dev

# Start local development with Cloudflare Pages Functions
npm run dev:cf
```

### Cloudflare Pages Deployment

This project is configured for deployment to Cloudflare Pages with secure API key management:

1. API keys are stored as encrypted Environment Variables in the Cloudflare Pages dashboard
2. Cloudflare Pages Functions are used to securely proxy API requests without exposing keys to clients
3. The `wrangler.toml` file contains the necessary configuration for Pages Functions

```bash
# Deploy to Cloudflare Pages
npm run deploy:cf
```

Alternatively, you can deploy directly through the Cloudflare dashboard.

---

## Changelog

### v1.1.0 (2025-06-03)

#### New Features

- Cloudflare Pages Functions implementation for secure API access
- Environment Variables configuration for secure API key management
- Debug logging and secret bindings for Gemini API key configuration
- Observability logs in wrangler configuration

#### Bug Fixes

- Gemini API integration by updating to stable v1 endpoint
- Stabilized Gemini API integration by confirming `gemini-2.0-flash` as the primary working model and establishing a fallback strategy (`gemini-1.5-pro`, `gemini-pro`).
- Improved API key retrieval logic and error handling
- Corrected secrets syntax in wrangler.toml

#### Improvements

- Refactored frontend code to use Pages Functions instead of direct API calls
- Updated Cloudflare Pages configuration with revised binding syntax
- Simplified wrangler.toml configuration and updated build output settings
- Moved and updated Cloudflare Pages Functions documentation

### v1.0.0 (2025-05-16 to 2025-05-22)

#### Initial Features

- Initial project setup with Vite, TailwindCSS, and PostCSS
- Comprehensive documentation structure with architecture diagrams
- JSDocs task, config and documentation comments
- Example .env file for configuration
- Energy chart view with day/week/month options and persistent app state
- Solar contribution display and integration with bill overview
- Tariff editor section and energy budget management UI
- Custom styles for headings, paragraphs, and recommendations display
- Usage mode toggle for appliances with continuous operation option
- AI recommendations with keyword highlighting
- Sticky bill overview section with custom scrollbar styles

#### Initial Bug Fixes

- Configured Vite for broader network access and flexible port usage
- Updated .gitignore to exclude generated JSDocs

#### Initial Improvements

- Refactored application structure for better modularity
- Enhanced energy usage calculations for monthly data
- Optimized AI data handling and recommendation generation
- Updated chart view button styles for clarity and consistency
- Improved heading color in prose class for better readability
- Reorganized documentation files into docs/guides directory
- Used relative paths for CSS and JS resources

---
