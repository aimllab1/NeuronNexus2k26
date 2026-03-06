/**
 * Central API base URL.
 * Optional override: VITE_API_BASE_URL
 *
 * Default behavior:
 * - Same machine browser: http://localhost:5000
 * - Remote device browser: http://<current-hostname>:5000
 */
const envBase = ((import.meta.env.VITE_API_BASE_URL as string) || '').trim();
const hasWindow = typeof window !== 'undefined';
const host = hasWindow ? window.location.hostname : 'localhost';
const protocol = hasWindow ? window.location.protocol : 'http:';
const dynamicBase = `${protocol}//${host}:5000`;
const hostIsRemote = !['localhost', '127.0.0.1'].includes(host);
const envUsesLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(envBase);

export const API_BASE: string =
  envBase && !(hostIsRemote && envUsesLocalhost) ? envBase : dynamicBase;
