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
