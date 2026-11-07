import { apiRequest } from "./client";

export async function getProducts() {
  return apiRequest("/products", {
    method: "GET",
  });
}

export async function getProduct(id) {
  return apiRequest(`/products/${id}`, {
    method: "GET",
  });
}

export async function createProduct(productData) {
  return apiRequest("/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
}

export async function updateProduct(id, productData) {
  return apiRequest(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
}

export async function deleteProduct(id) {
  return apiRequest(`/products/${id}`, {
    method: "DELETE",
  });
}

