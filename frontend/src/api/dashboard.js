import { apiRequest } from "./client";

export async function getDashboardStats() {
  return apiRequest("/dashboard", {
    method: "GET",
  });
}

