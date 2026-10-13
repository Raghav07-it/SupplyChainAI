import { apiRequest } from "./client";

export async function getAutonomousRoute({
  originPortCode = "INMUM",
  destinationPortCode = "NLRTM",
  costWeight = 0.3,
  timeWeight = 0.2,
  distanceWeight = 0.2,
  riskWeight = 0.3,
  candidateCount = 5,
  riskLevel = "medium",
}) {
  return apiRequest("/routing/autonomous", {
    method: "POST",
    body: JSON.stringify({
      origin_port_code: originPortCode,
      destination_port_code: destinationPortCode,
      cost_weight: costWeight,
      time_weight: timeWeight,
      distance_weight: distanceWeight,
      risk_weight: riskWeight,
      candidate_count: candidateCount,
      risk_level: riskLevel,
    }),
  });
}