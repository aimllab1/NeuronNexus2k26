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
const port = hasWindow ? window.location.port : '';

// In production (hosted together), the API is on the same host and port.
// In development, we use port 5000 as a fallback.
const dynamicBase = port ? `${protocol}//${host}:${port}` : `${protocol}//${host}`;
const isLocalhost = ['localhost', '127.0.0.1'].includes(host);
const finalBase = envBase || (isLocalhost ? `${protocol}//${host}:5000` : dynamicBase);

export const API_BASE: string = finalBase;
