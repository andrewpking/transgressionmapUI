let cachedPromise = null;

/**
 * loadTransgressions({ force: boolean } = {})
 * - Returns a promise for the GeoJSON data.
 * - Caches the in-flight/completed promise so multiple callers or re-renders won't start new requests.
 * - Pass `{ force: true }` to bypass the cache and start a fresh request.
 */
const loadTransgressions = async ({ force = false } = {}) => {
  if (cachedPromise && !force) {
    return cachedPromise;
  }

  // Start and cache the promise immediately so parallel callers share it
  cachedPromise = (async () => {
    // Configuration
    const getApiUrl = () => {
      const apiUrl =
        import.meta.env.VITE_MAP_PROD || import.meta.env.VITE_MAP_DEV;
      if (!apiUrl) {
        throw new Error(
          "API URL not configured. Please set VITE_MAP_DEV or VITE_MAP_PROD environment variable.",
        );
      }
      return apiUrl;
    };

    // Default headers for GeoJSON API requests
    const getDefaultHeaders = () => ({
      "Content-Type": "application/geo+json",
      Accept: "application/geo+json",
    });

    const baseUrl = getApiUrl();
    const response = await fetch(baseUrl, {
      method: "GET",
      headers: getDefaultHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  })();

  return cachedPromise;
};

/**
 * clearTransgressionsCache()
 * - Clear the cached promise so the next caller will fetch fresh data.
 */
export const clearTransgressionsCache = () => {
  cachedPromise = null;
};

export default loadTransgressions;
