/**
 * Application configuration.
 *
 * Environment variables prefixed with EXPO_PUBLIC_ are embedded at build time
 * and accessible via process.env.
 *
 * @see https://docs.expo.dev/guides/environment-variables/
 */

export const config = {
  /**
   * Base URL for the backend API.
   * Set via EXPO_PUBLIC_API_URL environment variable.
   * Defaults to localhost for development.
   */
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1/',
} as const;

export type Config = typeof config;
