import { apiRequest } from "./client";

export async function loginApi({ email, password }) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerApi({ email, password, full_name, company_name }) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name, company_name }),
  });
}

export async function getMeApi() {
  return apiRequest("/auth/me", {
    method: "GET",
  });
}

