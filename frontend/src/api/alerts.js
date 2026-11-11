import { apiRequest } from "./client";

export async function getAlerts({ view = "all", severity = null, isRead = null, isAcknowledged = null, search = "" } = {}) {
  const params = new URLSearchParams();
  if (view) params.append("view", view);
  if (severity && severity !== "all") params.append("severity", severity);
  if (typeof isRead === "boolean") params.append("is_read", isRead);
  if (typeof isAcknowledged === "boolean") params.append("is_acknowledged", isAcknowledged);
  if (search && search.trim()) params.append("search", search.trim());

  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiRequest(`/alerts${query}`, { method: "GET" });
  return Array.isArray(res) ? res : [];
}

export async function getMyRouteAlerts({ severity = null, search = "" } = {}) {
  const params = new URLSearchParams();
  params.append("view", "my-routes");
  if (severity && severity !== "all") params.append("severity", severity);
  if (search && search.trim()) params.append("search", search.trim());

  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiRequest(`/alerts/me${query}`, { method: "GET" });
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
