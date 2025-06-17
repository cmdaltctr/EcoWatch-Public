/**
 * @file gemini.js
 * @description Cloudflare Pages Function to proxy requests to the Gemini API
 * This keeps the API key secure by never exposing it to the client
 */

// Server-side fallback model list (client's requested model is tried first)
const GEMINI_MODELS_FALLBACK_ORDER = [
  "gemini-1.5-pro",   // Latest available Pro model
  "gemini-pro"        // Older Pro, last resort
];

// Default model if client doesn't specify one (client now sends gemini-2.0-flash)
const DEFAULT_MODEL_IF_CLIENT_OMITS = "gemini-2.0-flash";

// IMPORTANT: For testing only - replace with your actual API key for testing
// Delete or empty this before production deployment
const FALLBACK_API_KEY = "";

// Main handler for the Gemini API proxy
export async function onRequest(context) {
  try {
    // Log all available properties for debugging
    console.log("[Gemini Function] Full context:", JSON.stringify({
      env: context.env ? Object.keys(context.env) : 'undefined',
      bindings: context.env && context.env.VITE_GEMINI_API_KEY ? 'present' : 'missing',
      request: {
        method: context.request.method,
        url: context.request.url,
        headers: [...context.request.headers.entries()].map(([key, value]) => `${key}: ${value}`)
      }
    }));
    
    // Get the API key from the environment
    // For Cloudflare Pages Functions, secrets are directly available in context.env
    let apiKey = null;
    
    // Log all available environment variables for debugging
    console.log("[Gemini Function] Environment variables available:", 
      context.env ? JSON.stringify(Object.keys(context.env)) : "No env object");
    
    // IMPORTANT: This is the standard way to access secrets in Cloudflare Pages Functions
    if (context.env && context.env.VITE_GEMINI_API_KEY) {
      apiKey = context.env.VITE_GEMINI_API_KEY;
      console.log("[Gemini Function] Successfully found API key in context.env");
    }
    
    // TEMPORARY SOLUTION: Hardcode your API key here for testing
    // REMOVE THIS BEFORE PRODUCTION DEPLOYMENT
    // This is just for testing - replace with your actual API key
    const HARDCODED_API_KEY = "";
    
    if (!apiKey && HARDCODED_API_KEY) {
      apiKey = HARDCODED_API_KEY;
      console.log("[Gemini Function] Using hardcoded API key (TEMPORARY SOLUTION)");
    }
    
    // Last resort - use fallback key (for testing only)
    if (!apiKey && FALLBACK_API_KEY) {
      apiKey = FALLBACK_API_KEY;
      console.log("[Gemini Function] Using fallback API key");
    }
    
    if (!apiKey) {
      console.error("[Gemini Function] API key not found in any location");
      return new Response(JSON.stringify({ 
        error: "API key not configured",
        message: "The Gemini API key could not be found in the environment. Please check your Cloudflare Pages configuration."
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Only accept POST requests
    if (context.request.method !== "POST") {
      return new Response(JSON.stringify({ 
        error: "Method not allowed" 
      }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Parse the request body
    const requestData = await context.request.json();
    const { prompt, model } = requestData;
    
    // Use the model from the request or fall back to the default
    const clientModel = model || DEFAULT_MODEL_IF_CLIENT_OMITS;
    const modelsToTry = [clientModel, ...GEMINI_MODELS_FALLBACK_ORDER].filter(Boolean);

    if (!prompt) {
      return new Response(JSON.stringify({ 
        error: "Prompt is required" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // The modelsToTry array is already defined above (around line 90) and includes the clientModel and fallbacks.
    console.log(`[Gemini Function] Will attempt models in this order: ${modelsToTry.join(', ')}`);

    try {
      // Try each model in order until one works
      let lastError = null;
      
      // Try each model in sequence
      for (const currentModel of modelsToTry) {
        try {
          console.log(`[Gemini Function] Trying model: ${currentModel}`);
          
          // Prepare the request to the Gemini API
          const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/${currentModel}:generateContent`;
          const geminiRequest = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          };

          // Forward the request to Gemini API
          const geminiResponse = await fetch(geminiUrl, geminiRequest);
          
          // Log the response status
          console.log(`[Gemini Function] Gemini API response status for ${currentModel}: ${geminiResponse.status}`);
          
          // If not OK status, try next model
          if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json();
            lastError = errorData;
            console.error(`[Gemini Function] Model ${currentModel} failed with status ${geminiResponse.status}:`, errorData);
            continue; // Try next model
          }
          
          // Parse the response
          const geminiData = await geminiResponse.json();
          
          // Log a sample of the response
          console.log(`[Gemini Function] Successful response from model ${currentModel}:`, 
            JSON.stringify(geminiData).substring(0, 200) + '...');
            
          // Check if the response contains an error
          if (geminiData.error) {
            console.error(`[Gemini Function] Model ${currentModel} returned an error:`, geminiData.error);
            lastError = geminiData.error;
            continue; // Try next model
          }
          
          // If we get here, we have a successful response
          console.log(`[Gemini Function] SUCCESS: Using model ${currentModel} successfully`);
          
          // Add model information to the response
          const responseWithModelInfo = {
            ...geminiData,
            _modelUsed: currentModel
          };
          
          return new Response(JSON.stringify(responseWithModelInfo), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
          
        } catch (modelError) {
          console.error(`[Gemini Function] Error with model ${currentModel}:`, modelError);
          lastError = modelError;
          // Continue to next model
        }
      }
      
      // If we get here, all models failed
      console.error(`[Gemini Function] All models failed. Last error:`, lastError);
      return new Response(JSON.stringify({ 
        error: "Gemini API error", 
        message: lastError?.message || "All Gemini models failed",
        details: lastError
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    } catch (geminiError) {
      console.error(`[Gemini Function] Error calling Gemini API: ${geminiError.message}`);
      return new Response(JSON.stringify({ 
        error: "Gemini API error", 
        message: geminiError.message 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    // Handle any errors in the overall function
    console.error(`[Gemini Function] Server error: ${error.message}`);
    return new Response(JSON.stringify({ 
      error: "Server error", 
      message: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
