import { apiRequest } from "./client";

export async function runAgentWorkflow({
  eventText,
  originPortCode = "INMUM",
  destinationPortCode = "NLRTM",
}) {
  return apiRequest("/agents/run-workflow", {
    method: "POST",
    body: JSON.stringify({
      event_text: eventText,
      origin_port_code: originPortCode,
      destination_port_code: destinationPortCode,
    }),
  });
}