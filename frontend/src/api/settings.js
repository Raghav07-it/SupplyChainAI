import { apiRequest } from "./client";

export async function getSettings() {
  return apiRequest("/settings", {
    method: "GET",
  });
}

export async function updateSettings(data) {
  return apiRequest("/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function updateProfile({ fullName, companyName }) {
  return apiRequest("/auth/profile", {
    method: "PUT",
    body: JSON.stringify({
      full_name: fullName,
      company_name: companyName,
    }),
  });
}

export async function changePassword({ currentPassword, newPassword }) {
  return apiRequest("/auth/change-password", {
    method: "PUT",
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
}

