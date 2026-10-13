import { apiRequest } from "./client";

export async function getLiveNews({
  query,
  maxResults = 10,
} = {}) {
  const params = new URLSearchParams();

  if (query) {
    params.set("query", query);
  }

  params.set("max_results", maxResults);

  return apiRequest(`/live/news?${params.toString()}`);
}

export async function getLiveWeather(portCode) {
  return apiRequest(
    `/live/weather/${encodeURIComponent(portCode)}`
  );
}

export async function getLiveAlerts() {
  return apiRequest("/live/alerts");
}

export async function refreshLiveIntelligence() {
  return apiRequest("/live/refresh", {
    method: "POST",
  });
}