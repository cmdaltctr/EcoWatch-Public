import { defineConfig, loadEnv } from "vite";
import { resolve } from "path";
import cloudflareSecretsPlugin from "./vite-cloudflare-plugin.js";

export default defineConfig(({ command, mode }) => {
	// Load environment variables based on the current mode
	const env = loadEnv(mode, process.cwd(), "");

	// Check if we're running in Firebase Cloud Workstations
	const isFirebaseEnv = env.VITE_FIREBASE_ENV === "true";

	return {
		root: resolve(__dirname),
		plugins: [
			cloudflareSecretsPlugin()
		],
		build: {
			outDir: "dist",
			emptyOutDir: true,
		},
		resolve: {
			alias: {
				'@': resolve(__dirname),
			},
		},
		optimizeDeps: {
			include: ['@google/genai']
		},
		server: {
			hmr: true,
			host: 'localhost', // Use localhost for development
			strictPort: false, // Allow trying other ports if 3000 is in use
			port: 3000, // Use port 3000
			headers: {
				'Access-Control-Allow-Origin': '*' // Allow CORS
			}
		}
	};
});
