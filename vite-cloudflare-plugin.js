/**
 * @file vite-cloudflare-plugin.js
 * @description Vite plugin to inject Cloudflare Secrets into the build process
 */

export default function cloudflareSecretsPlugin() {
  return {
    name: 'vite-plugin-cloudflare-secrets',
    config(config) {
      // This will be called during build time
      // You can modify the Vite config here to inject environment variables
      return {
        define: {
          // Define any environment variables from Cloudflare Secrets
          // These will be replaced at build time
          'import.meta.env.VITE_GEMINI_API_KEY': 
            JSON.stringify(process.env.VITE_GEMINI_API_KEY || '')
        }
      };
    }
  };
}
