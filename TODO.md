# EnergiWatch MVP - Development Plan

## Checkpoint 1: Chart View Enhancement (2025-05-19)

### Objective

Implement day/week/month view toggles for the energy consumption chart with appropriate data aggregation.

### Tasks

#### 1. Data Generation

- [x] Implement 24-hour data generation for day view
- [x] Create weekly data aggregation (7 days)
- [x] Ensure data consistency across different timeframes
- [x] Add realistic daily usage patterns
- [x] Include weekend vs weekday variations
- [x] Add solar generation patterns based on time of day
- [x] Implement seeded random generation for consistent data
- [x] Add weather variations for solar generation

#### 2. UI Components

- [x] Add day/week/month toggle buttons in the chart controls
- [x] Implement responsive chart updates when changing timeframes
- [x] Add loading states during data aggregation
- [x] Include visual indicators for the active timeframe
- [x] Add proper button styling for active/inactive states

#### 3. Chart Configuration

- [x] Configure x-axis labels based on selected timeframe
  - [x] Day: Show hours (00:00 - 23:00)
  - [x] Week: Show days (Mon-Sun)
  - [x] Month: Show dates (1-31)
- [x] Adjust y-axis scaling for different timeframes
- [x] Add tooltips showing precise values and timestamps
- [x] Update chart title based on selected view

#### 4. Data Processing

- [x] Create data aggregation functions:
  - [x] Hourly aggregation for day view
  - [x] Daily aggregation for week view
  - [x] Weekly aggregation for month view
- [x] Implement data caching to improve performance
- [x] Add error handling for data processing
- [x] Add data validation and fallbacks
- [x] Implement proper data formatting for different timeframes

#### 5. Testing

- [x] Verify data consistency across all timeframes
- [x] Test performance with large datasets
- [x] Validate mathematical accuracy of aggregations
- [x] Test on different screen sizes
- [x] Verify correct data caching behavior
- [x] Test view switching performance

#### 6. Additional Features Implemented

- [x] Seeded random number generation for consistent data
- [x] Realistic energy usage patterns throughout the day
- [x] Solar generation simulation with weather variations
- [x] Weekend vs weekday usage patterns
- [x] Data caching for better performance
- [x] Responsive chart updates
- [x] Error handling and data validation
- [x] Proper state management for view toggles

### Technical Notes (Chart View)

- Use appropriate timezone handling for all date/time operations
- Implement proper memory management for data processing
- Consider using web workers for heavy data processing tasks
- Add unit tests for all data transformation functions

### Dependencies

- Charting library (to be determined/confirmed)
- Date manipulation library (e.g., date-fns or dayjs)
- Data processing utilities

### Success Criteria

- Users can seamlessly switch between day/week/month views
- Data is accurately aggregated at all timeframes
- Performance remains smooth even with large datasets
- The UI is intuitive and provides clear feedback

## Last Updated

2025-06-03

## Current Implementation Plan: Cloudflare Secrets Integration

### Objective (Revised)

Securely manage environment variables such as the Gemini API key using Cloudflare Secrets Store for both local development and production deployment.

### Subtasks

#### 1. Setup and Configuration

- [x] Create feature branch `feature/cloudflare-secrets-integration`
- [x] Add Wrangler CLI as a dev dependency
- [x] Create and configure `wrangler.toml` for Cloudflare Workers
- [x] Update environment variable handling in `aiService.js`

#### 2. Vite Integration

- [x] Create Vite plugin for Cloudflare Secrets (`vite-cloudflare-plugin.js`)
- [x] Update `vite.config.js` to use the Cloudflare Secrets plugin
- [x] Add deployment and development scripts to `package.json`

#### 3. Security and Environment Management

- [x] Update `.gitignore` to exclude sensitive files (.env, .wrangler/)
- [x] Create `.env.example` as a template for required environment variables
- [x] Remove actual API key from `.env` file

#### 4. Deployment and Testing

- [x] Test local development with Vite
- [x] Test Cloudflare Pages development server locally
- [x] Add API key to Cloudflare Secrets Store
- [x] Deploy to Cloudflare Pages for testing
- [x] Fixed `wrangler.toml` configuration to use correct `[[secrets]]` syntax (2025-06-03)
- [x] Added `[assets]` configuration to `wrangler.toml` to specify static assets directory (2025-06-03)
- [x] Identified API token permission issues with Wrangler CLI deployment (2025-06-03)
  - Current token has insufficient permissions for `/memberships` endpoint
  - Continue using Cloudflare dashboard for deployment or update token permissions
- [x] Successfully deployed to Cloudflare Pages (2025-06-03)
  - Deployed to <https://energiwatch-mvp.praxis-7a2.workers.dev>
  - All assets uploaded successfully
- [x] Verify API key is correctly accessed in production

#### 5. Finalization

- [ ] Push feature branch to GitHub
- [ ] Create pull request (do not merge yet)
- [ ] Document the Cloudflare Secrets integration process
- [ ] Merge to main branch after successful testing

### Technical Notes (Cloudflare Integration)

- Cloudflare Secrets are injected at build time using a custom Vite plugin
- For local development, the API key is read from the `.env` file
- For production, the API key is retrieved from Cloudflare Secrets Store
- The application is deployed to Cloudflare Pages, not as a Cloudflare Worker

## Implementation Plan: Pages Functions for Secure API Access (2025-06-03)

### Objective (Gemini API)

Implement Cloudflare Pages Functions to securely access the Gemini API without exposing the API key to clients.

### Implementation Tasks

#### 1. Pages Function Setup

- [x] Create a new branch `feature/cloudflare-pages-functions`
- [x] Create the `functions` directory structure
- [x] Implement the Gemini API proxy function at `/functions/api/gemini.js`
- [x] Update `wrangler.toml` to include the functions configuration

#### 2. Frontend Integration

- [x] Refactor `aiService.js` to use the Pages Function instead of direct API calls
- [x] Implement model selection with a flexible architecture
- [x] Remove direct API key usage from frontend code
- [x] Add proper error handling for API calls

#### 3. Local Development

- [x] Update `package.json` scripts for local development with Pages Functions
- [x] Test the Pages Function locally with `wrangler pages dev`
- [x] Verify API calls work correctly in the local environment

#### 4. Deployment and Testing to Cloudflare Pages

- [x] Deploy to Cloudflare Pages with the new Pages Function (2025-06-03)
- [x] Test the deployed application to ensure API calls work (2025-06-03)
- [x] Verify API key is securely accessed from the Secret Store (2025-06-03)
- [x] Monitor for any errors or performance issues (2025-06-03)
- [x] Fixed Gemini API integration issues (2025-06-03):
  - Updated API endpoint from v2beta to v1
  - Changed model from "gemini-2.0-flash" to "gemini-pro"
  - Improved API key access methods in the Pages function
  - Added comprehensive logging for better debugging
  - Successfully deployed and tested with working API integration

#### 5. Finalization (Gemini API)

- [x] Merge `feature/cloudflare-pages-functions` into `feature/cloudflare-secrets-integration` (2025-06-03)
- [x] Document the Pages Function implementation (2025-06-03)
- [ ] Create pull request for review
- [ ] Merge to main branch after successful testing

### Implementation Notes (2025-06-03) - Checklist

- [x] **Integrated Solution**: Successfully combined Cloudflare Secrets integration with Pages Functions
- [x] **Integrated Solution**: Created a complete solution that securely handles API keys and requests
- [x] **Architecture**: Frontend (`aiService.js`) sends requests to Pages Function endpoint `/api/gemini`
- [x] **Architecture**: Pages Function securely accesses the API key from Cloudflare Secret Store
- [x] **Architecture**: API requests are proxied through the Pages Function to protect the API key
- [x] **Gemini API Integration Fix (2025-06-03)**: Identified root cause (500 Internal Server Error)
- [x] **Gemini API Integration Fix (2025-06-03)**: Updated API endpoint from v2beta to v1
- [x] **Gemini API Integration Fix (2025-06-03)**: Changed model from "gemini-2.0-flash" to "gemini-pro" (initial fix, later refined by model availability checks)
- [x] **Gemini API Integration Fix (2025-06-03)**: Improved API key access methods in Pages Function
- [x] **Gemini API Integration Fix (2025-06-03)**: Added comprehensive logging
- [x] **Gemini API Integration Fix (2025-06-03)**: Enhanced error handling
- [x] **Gemini API Integration Fix (2025-06-03)**: Made code changes to fix issues
- [x] **Gemini API Integration Fix (2025-06-03)**: Committed changes to git
- [x] **Gemini API Integration Fix (2025-06-03)**: Deployed to Cloudflare Pages (e.g., with `npm run deploy:cf` or dashboard)
- [x] **Gemini API Integration Fix (2025-06-03)**: Verified functionality on deployed site
- [x] **Gemini API Integration Fix (2025-06-03)**: Result - Successfully fixed Gemini API integration
- [x] **Gemini API Integration Fix (2025-06-03)**: Pages Function (`/functions/api/gemini.js`) securely accesses API key
- [x] **Gemini API Integration Fix (2025-06-03)**: Pages Function proxies requests to Gemini API
- [x] **Model Selection**: Implemented flexible model selection in `aiService.js`
- [x] **Model Selection**: Created `GEMINI_MODELS` object for easy model management
- [x] **Model Selection**: Added optional model parameter to `callGemini()` function
- [x] **Model Selection**: Pages Function uses default model if none specified
- [x] **Security Improvements**: API key never exposed in frontend code or browser
- [x] **Security Improvements**: All API calls proxied through serverless function
- [x] **Security Improvements**: Implemented proper error handling and HTTP method restrictions
- [x] **Local Testing**: Successfully tested locally using `npm run dev:cf`
- [x] **Local Testing**: Verified Pages Function works correctly
- [x] **Local Testing**: Confirmed API key is securely accessed locally

### Technical Notes - Checklist

- [x] Pages Functions run server-side and can securely access the Secret Store
- [x] The API key is never exposed to the client
      {{ ... }}
- [x] Model selection is managed in `aiService.js` for flexibility
- [x] A default model is configured in the Pages Function as a fallback
- [x] The Pages Function accepts the model as a parameter from the frontend
- [x] This allows different models to be used for different purposes without changing the backend

## Bill Overview Consistency in AI Recommendations

**Problem Statement:** When the target budget is changed, the `billOverview` data sent to the AI via `js/logic.js#generateOptimisationAdvice` is less detailed than when recommendations are generated via `js/eventHandlers.js#handleAIRecommendations`. Specifically, it lacks "after solar" calculations (`billAfterSolar`, `percentDiffAfterSolar`, etc.). This can lead to the AI's advice and the UI's bill overview display not fully reflecting the impact of solar generation in that scenario.

**Checklist to Fix `js/logic.js#generateOptimisationAdvice`:**

- [x] Define `totalSolarKWh` calculation logic, similar to `eventHandlers.js`.
  - Input: `solarData` parameter.
- [x] Define `avgRate` calculation logic for solar savings, similar to `eventHandlers.js`.
  - Input: `tariffData` parameter (the one used for `currentBill`).
- [x] Calculate `solarSavings = totalSolarKWh * avgRate`.
- [x] Calculate `billAfterSolar = Math.max(0, currentBill - solarSavings)`.
- [x] Calculate `percentDiffAfterSolar = targetBill > 0 ? ((billAfterSolar - targetBill) / targetBill) * 100 : 0;`.
- [x] Calculate `absPercentDiffAfterSolar = Math.abs(percentDiffAfterSolar).toFixed(0);`.
- [x] Calculate `isOverBudgetAfterSolar = billAfterSolar > targetBill;`.
- [x] Add all new "after solar" metrics to the `billOverview` object in `inputData` within `js/logic.js#generateOptimisationAdvice`.

## Previous Implementation Plan: Fix AI Data Regeneration - Checklist

### Problem

- [ ] Address: Application state not persisted between page refreshes

### Solution Tasks

#### 1. State Persistence

- [ ] Implement local storage for application state
- [ ] Save/load appliances data to/from local storage
- [ ] Save/load solar data to/from local storage
- [ ] Save/load usage data to/from local storage
- [ ] Maintain existing tariff data storage

#### 2. State Management Updates

- [ ] Update `state.js` to use persistent storage
- [ ] Modify getters/setters in `state.js` to handle storage operations
- [ ] Add error handling for storage operations in `state.js`

#### 3. Initialization Flow

- [ ] Load existing state from local storage on app start
- [ ] Only generate new AI data if no existing data is found in local storage
- [ ] Maintain ability to manually regenerate data when needed

#### 4. Error Handling (for State Persistence)

- [ ] Add proper error handling for local storage operations
- [ ] Provide user feedback when data loading/saving from/to local storage fails
- [ ] Fall back to in-memory state if local storage is unavailable or fails

#### 5. Testing (State Persistence for AI Data Regeneration)

- [ ] Verify data persistence across page refreshes
- [ ] Test state persistence with different browsers
- [ ] Verify error handling and edge cases for state persistence

## Checkpoint 3: AI Data Transparency (2025-06-06)

### Problem (AI Data Transparency)

{{ ... }}

- No visual indicator showing the source of the currently displayed data
- Different Gemini model capabilities may produce different quality results

### Solution

1. **Track Data Source**

   - [x] Add `isAIGenerated` (boolean) and `aiModelUsed` (string) fields to the data returned by the AI service. (Note: Server (`functions/api/gemini.js`) currently logs the AI model used, e.g., `gemini-2.0-flash`. This information needs to be formally included in the JSON response to the client.)
   - [x] Ensure the client-side `aiService.js` parses these new fields from the `/api/gemini` function's response.
   - [x] Store this data source information (e.g., `isAIGenerated: true`, `aiModelUsed: 'gemini-2.0-flash'`, or `isAIGenerated: false` if AI fails and an error/alternative is shown) in the application's state (e.g., in `js/state.js`).

2. **Visual Indicator**

   - [x] Create a UI element (e.g., a small text label or icon) in `index.html` to display the source of the energy recommendations.
   - [x] Style this indicator. For example: "AI: Gemini Flash" (blue text/icon), "AI: Gemini Pro 1.5" (purple text/icon), or "Recommendations unavailable" (grey text/icon).
   - [x] Add a hover tooltip to the indicator providing more context, like "Powered by Google Gemini 2.0 Flash model." or "AI recommendations could not be generated at this time."

3. **Gemini Model Updates** [COMPLETED - Primary Objective]

   - [x] ~~Update available Gemini models to include newer versions~~ Investigated model availability using `list-gemini-models.js` script. Found `gemini-2.5-flash-preview` and `gemini-2.0-pro` were unavailable (404 errors).
   - [x] ~~Add Gemini 2.5 Flash Preview for improved reasoning capabilities~~ Prioritized available models: `gemini-2.0-flash` (primary), `gemini-1.5-pro` (fallback 1), `gemini-pro` (fallback 2).
   - [x] Keep configuration flexible for future model updates - Implemented in `js/aiService.js` (client) and `functions/api/gemini.js` (server proxy) with clear model lists and fallback logic.
   - Resolved 500 error in `functions/api/gemini.js` caused by `ReferenceError: modelToUse is not defined`.
   - Ensured client (`dist` folder) and server code are synchronized during deployments.

4. **Testing**

   - Verify indicator correctly shows data source
   - Test fallback scenario when AI API fails
   - Confirm indicator persists across page refreshes
