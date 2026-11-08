const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = rawBaseUrl
  ? rawBaseUrl.replace(/\/+$/, "")
  : "http://127.0.0.1:8000";

export async function apiRequest(endpoint, options = {}) {
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
    const isLocalhost =
      API_BASE_URL.includes("127.0.0.1") || API_BASE_URL.includes("localhost");
    const isHttpsPage =
      typeof window !== "undefined" && window.location.protocol === "https:";

    if (isLocalhost && isHttpsPage) {
      throw new Error(
        "Production Connection Notice: This deployed frontend cannot connect to http://127.0.0.1:8000. In Vercel Project Settings > Environment Variables, please set VITE_API_BASE_URL to your public backend URL and redeploy."
      );
    }
    throw new Error(
      `Unable to connect to the backend server (${API_BASE_URL}). Please verify that the API is active and accessible.`
    );
  }

  if (response.status === 401) {
    // Clear session and redirect to /login if unauthenticated, unless already on /login or /register
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (
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
