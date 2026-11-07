const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

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
