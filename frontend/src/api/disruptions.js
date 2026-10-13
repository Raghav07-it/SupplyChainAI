import { apiRequest } from "./client";

export async function getDisruptionSummary() {
  return apiRequest("/disruptions/analytics/summary");
}

export async function getDisruptions({
  portCode,
  severity,
  limit = 50,
  offset = 0,
} = {}) {
  const params = new URLSearchParams();

  if (portCode) {
    params.set("port_code", portCode);
  }

  if (severity) {
    params.set("severity", severity);
  }

  params.set("limit", limit);
  params.set("offset", offset);

  return apiRequest(`/disruptions?${params.toString()}`);
}

export async function getPortRisk(portCode) {
  return apiRequest(
    `/disruptions/risk/${encodeURIComponent(portCode)}`
  );
}

export async function createDisruption(data) {
  return apiRequest("/disruptions", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
}