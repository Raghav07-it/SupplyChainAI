import { apiRequest } from "./client";

export async function searchGlobal(query) {
  if (!query || !query.trim()) {
    return { query: "", total_matches: 0, results: [] };
  }
  return apiRequest(`/search?q=${encodeURIComponent(query.trim())}`, {
    method: "GET",
  });
}

