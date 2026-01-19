const loadTransgressions = async () => {
  // Configuration
  const getApiUrl = () => {
    const apiUrl =
      import.meta.env.VITE_MAP_PROD || import.meta.env.VITE_MAP_DEV;
    if (!apiUrl) {
      throw new Error(
        "API URL not configured. Please set MAP_API_DEV environment variable.",
      );
    }
    return apiUrl;
  };

  // Default headers for GeoJSON API requests
  const getDefaultHeaders = () => ({
    "Content-Type": "application/geo+json",
    Accept: "application/geo+json",
  });

  // Generic API request handler
  async function apiRequest(endpoint = "", options = {}) {
    const baseUrl = getApiUrl();
    const url = endpoint ? `${baseUrl}${endpoint}` : baseUrl;

    const config = {
      method: "GET",
      headers: getDefaultHeaders(),
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = response.json();
    //console.log(data);
    return await data;
  }

  return apiRequest();
};

export default loadTransgressions;
