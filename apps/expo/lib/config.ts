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

  /**
   * Google Apps Script web app URL that receives "suggest a fix" submissions
   * and appends them to a Google Sheet. See docs/volunteer/google-sheet-setup.md.
   * Set via EXPO_PUBLIC_FEEDBACK_URL. If unset, the fix form is disabled.
   */
  feedbackUrl: process.env.EXPO_PUBLIC_FEEDBACK_URL ?? '',

  /**
   * Presigned-URL endpoint used by the volunteer recording station to upload
   * audio directly to S3. Expected to accept ?speakerId=&wordId=&contentType=
   * and respond with JSON { url, key }. Set via EXPO_PUBLIC_UPLOAD_URL.
   */
  uploadUrl: process.env.EXPO_PUBLIC_UPLOAD_URL ?? '',
} as const;

export type Config = typeof config;
