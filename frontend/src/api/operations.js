import { apiRequest } from "./client";

export async function getSuppliers() {
  return apiRequest("/suppliers");
}

export async function getProducts() {
  return apiRequest("/products");
}

export async function getWarehouses() {
  return apiRequest("/warehouses");
}

export async function getInventory() {
  return apiRequest("/inventory");
}

export async function getShipments() {
  return apiRequest("/shipments");
}