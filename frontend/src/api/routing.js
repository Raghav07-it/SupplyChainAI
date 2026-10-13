import { apiRequest } from "./client";

export async function getWeightedRoute({
  origin,
  destination,
  costWeight = 0.4,
  timeWeight = 0.3,
  distanceWeight = 0.2,
  riskWeight = 0.1,
}) {
  return apiRequest("/routing/weighted", {
    method: "POST",
    body: JSON.stringify({
      origin,
      destination,
      cost_weight: costWeight,
      time_weight: timeWeight,
      distance_weight: distanceWeight,
      risk_weight: riskWeight,
    }),
  });
}

export async function getCheapestRoute({
  origin,
  destination,
}) {
  return apiRequest("/routing/cheapest", {
    method: "POST",
    body: JSON.stringify({
      origin,
      destination,
    }),
  });
}

export async function getFastestRoute({
  origin,
  destination,
}) {
  return apiRequest("/routing/fastest", {
    method: "POST",
    body: JSON.stringify({
      origin,
      destination,
    }),
  });
}

export async function getShortestRoute({
  origin,
  destination,
}) {
  return apiRequest("/routing/shortest", {
    method: "POST",
    body: JSON.stringify({
      origin,
      destination,
    }),
  });
}