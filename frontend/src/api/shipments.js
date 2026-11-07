import { apiRequest } from "./client";

export async function getShipments() {
  return apiRequest("/shipments", {
    method: "GET",
  });
}

export async function getShipment(id) {
  return apiRequest(`/shipments/${id}`, {
    method: "GET",
  });
}

export async function createShipment(shipmentData) {
  return apiRequest("/shipments", {
    method: "POST",
    body: JSON.stringify(shipmentData),
  });
}

export async function updateShipment(id, shipmentData) {
  return apiRequest(`/shipments/${id}`, {
    method: "PUT",
    body: JSON.stringify(shipmentData),
  });
}

export async function deleteShipment(id) {
  return apiRequest(`/shipments/${id}`, {
    method: "DELETE",
  });
}

