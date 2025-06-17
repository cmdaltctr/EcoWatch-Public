# Cloudflare Pages Functions Implementation

## Overview

This document describes the implementation of Cloudflare Pages Functions in the EnergiWatch-MVP project to securely handle API calls to the Gemini API without exposing the API key to clients.

## Architecture

The implementation follows a secure proxy pattern:

1. Frontend code sends requests to a Pages Function endpoint
2. Pages Function securely accesses the API key from Cloudflare Environment Variables
3. Pages Function forwards the request to the Gemini API with the secure key
4. Response is returned to the frontend

```text
┌─────────────┐     ┌───────────────────┐     ┌────────────┐
│             │     │                   │     │            │
│  Frontend   │────▶│  Pages Function   │────▶│  Gemini    │
│             │     │                   │     │  API       │
│             │◀────│                   │◀────│            │
└─────────────┘     └───────────────────┘     └────────────┘
                            │
                            ▼
                     ┌─────────────────┐
                     │                 │
                     │ Cloudflare      │
                     │ Environment     │
                     │ Variables       │
                     └─────────────────┘
```

## Implementation Details

### 1. Pages Function (`/functions/api/gemini.js`)

The Pages Function is implemented as a serverless function that:

- Accepts POST requests with a prompt and optional model parameter
- Retrieves the API key from Cloudflare Environment Variables
- Forwards the request to the Gemini API
- Returns the response to the client

Key features:

- Default model fallback if none is specified
- Proper error handling
- HTTP method restrictions
- JSON parsing and validation

### 2. Frontend Integration (`/js/aiService.js`)

The frontend code has been refactored to:

- Use the Pages Function endpoint instead of direct API calls
- Implement flexible model selection with a `GEMINI_MODELS` object
- Remove direct API key usage from frontend code
- Add proper error handling for API calls

### 3. Configuration

The following configuration changes were made:

- Added `[functions]` configuration to `wrangler.toml`
- Updated `package.json` scripts for local development and deployment
- Added Environment Variables configuration for API key access

## Local Development

To run the application locally with Pages Functions:

```bash
npm run dev:cf
```

This will:

1. Build the frontend assets
2. Start a local Cloudflare Pages development server
3. Serve both static assets and Pages Functions
4. Use the API key from your local environment variables

## Deployment

To deploy the application to Cloudflare Pages:

```bash
npm run deploy:cf
```

Alternatively, you can deploy through the Cloudflare dashboard if you encounter API token permission issues.

## Security Considerations

This implementation provides several security benefits:

1. **API Key Protection**: The API key is never exposed in frontend code or browser
2. **Controlled Access**: All API calls are proxied through the serverless function
3. **Error Handling**: Proper error handling prevents sensitive information leakage
4. **Method Restrictions**: Only POST requests are allowed to the function endpoint

## Maintenance

### Adding New Models

To add new Gemini models:

1. Add the model to the `GEMINI_MODELS` object in `aiService.js`
2. Use the new model by passing it to the `callGemini()` function

### Updating the API

If the Gemini API changes:

1. Update the request format in the Pages Function
2. Update the response parsing in both the function and frontend code

### Troubleshooting

Common issues:

1. **API Key Access**: Ensure the API key is properly set in Cloudflare Environment Variables
2. **Function Errors**: Check Cloudflare Pages logs for function execution errors
3. **Local Development**: Ensure environment variables are properly set for local testing

### Gemini API Integration Issues (2025-06-03)

#### Issue

We encountered a 500 Internal Server Error when calling the Gemini API through our Pages Function. The error message was: `Gemini API error: API error: Gemini API error`.

#### Root Cause

The issue was caused by two main factors:

1. **Initial Model Issues**: Initial attempts with models like `gemini-2.5-flash-preview` and `gemini-2.0-pro` (user's original preference) resulted in errors. During troubleshooting, `gemini-2.0-flash` was also temporarily suspected or misconfigured, leading to exploration of other models like `gemini-pro`.
2. **Outdated API Endpoint**: We were using an older API endpoint (e.g., `v2beta`) which might have contributed to issues or lacked support for all desired models.

#### Solution

We made the following changes to resolve the integration:

1. **Confirmed Available Models**: Used a script (`list-gemini-models.js`) to verify models accessible with the API key.
2. **Established Model Prioritization**:
    - Set `gemini-2.0-flash` as the primary model for both client-side requests and server-side attempts, as it was confirmed to be working reliably.
    - Implemented server-side fallbacks to `gemini-1.5-pro` and then `gemini-pro` if the primary model fails.
3. **Updated API Endpoint**: Switched to the stable `v1` API endpoint.
4. **Improved API Key Access**: Ensured robust API key retrieval in the Pages Function.
5. **Enhanced Logging & Error Handling**: Added comprehensive logging and more detailed error messages for easier debugging.

#### Environment Variables vs. Secret Store

It's important to note that our implementation uses Cloudflare Environment Variables (set in the Cloudflare Pages dashboard under "Variables and Secrets") rather than the separate Cloudflare Secret Store feature.

While our documentation mentions the "Secret Store", we're actually using:

1. Environment Variables in the Cloudflare dashboard (with the "Encrypt" option enabled)
2. Bindings in `wrangler.toml` to make these variables available to our Pages Function

The Cloudflare Secret Store is a separate feature that allows sharing secrets across multiple Workers/applications and is not currently used in this project.
