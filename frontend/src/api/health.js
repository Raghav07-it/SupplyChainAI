import { apiRequest } from "./client";

export async function getApiStatus() {
  return apiRequest("/");
}

export async function getDatabaseHealth() {
  return apiRequest("/health/database");
}

export async function getDatabaseTables() {
  return apiRequest("/health/tables");
}