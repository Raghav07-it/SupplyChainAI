import { apiRequest } from "./client";

export async function getMyRouteAlerts() {
  const res = await apiRequest("/alerts/me", {
    method: "GET",
  });
  return Array.isArray(res) ? res : [];
}

export async function getAllDisruptions() {
  const res = await apiRequest("/disruptions", {
    method: "GET",
  });
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.items)) return res.items;
  return [];
}

export async function acknowledgeAlert(alertId) {
  return apiRequest(`/alerts/${encodeURIComponent(alertId)}/acknowledge`, {
    method: "POST",
  });
}

export async function acknowledgeAllAlerts() {
  return apiRequest("/alerts/acknowledge-all", {
    method: "POST",
  });
}

export async function toggleAlertRead(alertId) {
  return apiRequest(`/alerts/${encodeURIComponent(alertId)}/read`, {
    method: "POST",
  });
}
