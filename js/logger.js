/**
 * @file logger.js
 * @description Simple browser-side logger that logs errors to the browser console only.
 * Usage: import { logError } from './logger.js';
 */

/**
 * Logs an error message to the browser console with a [LOGGER] prefix.
 * @param {string} message - The error message to log.
 */
export function logError(message) {
  const now = new Date();
  const logMessage = `[${now.toISOString()}] ${message}`;
  console.warn('[LOGGER]', logMessage);
}
