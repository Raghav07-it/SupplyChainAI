const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Detect whether the application is running in a browser on a local host vs deployed production
const isLocalhostHost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "0.0.0.0");

const isDeployedProduction =
  typeof window !== "undefined" &&
  !isLocalhostHost &&
  (import.meta.env.PROD || window.location.protocol === "https:");

function resolveApiBaseUrl() {
  if (rawBaseUrl && rawBaseUrl.trim()) {
    const trimmed = rawBaseUrl.trim().replace(/\/+$/, "");
    if (isDeployedProduction && (trimmed.includes("127.0.0.1") || trimmed.includes("localhost"))) {
      return {
        url: trimmed,
        isConfigured: false,
        error:
          "Production Connection Notice: This deployed frontend cannot connect to http://127.0.0.1:8000. In Vercel Project Settings > Environment Variables, please set VITE_API_BASE_URL to your public backend URL and redeploy.",
      };
    }
    return { url: trimmed, isConfigured: true, error: null };
  }

  if (isDeployedProduction) {
    return {
      url: "",
      isConfigured: false,
      error:
        "Production Connection Notice: VITE_API_BASE_URL is not set on this deployed site. In Vercel Project Settings > Environment Variables, please set VITE_API_BASE_URL to your public HTTPS backend URL and redeploy.",
    };
  }

  // Local development default
  return { url: "http://127.0.0.1:8000", isConfigured: true, error: null };
}

const { url: API_BASE_URL, isConfigured, error: configError } = resolveApiBaseUrl();

export async function apiRequest(endpoint, options = {}) {
  if (!isConfigured && configError) {
    throw new Error(configError);
  }

  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = `${API_BASE_URL}${endpoint}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkError) {
    if (configError) {
      throw new Error(configError);
    }
    throw new Error(
      `Unable to connect to the backend server (${API_BASE_URL || "unconfigured"}). Please verify that the API is active, online, and accessible.`
    );
  }

  if (response.status === 401) {
    // Clear session and redirect to /login if unauthenticated, unless already on /login or /register
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login") &&
      !window.location.pathname.startsWith("/register")
    ) {
      window.location.href = "/login";
    }
  }

  if (!response.ok) {
    let errorDetail = `API request failed: ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.detail) {
        errorDetail = errorJson.detail;
      }
    } catch {
      // Body not JSON
    }
    const err = new Error(errorDetail);
    err.status = response.status;
    throw err;
  }

  return response.json();
}

export { API_BASE_URL };
