/**
 * All product data is served from the backend (which seeds from FakeStore).
 * This file only keeps the normalize helper for any legacy usage,
 * and the FakeStore direct-fetch functions are no longer used for display.
 */
import api from './axios';

// ── Backend product fetchers (replaces direct FakeStore calls) ────────────────
export const getProducts    = ()    => api.get('/products');
export const getProduct     = (id)  => api.get(`/products/${id}`);
export const getCategories  = ()    => api.get('/products/categories-list');
export const getByCategory  = (cat) => api.get(`/products/category/${encodeURIComponent(cat)}`);

/**
 * Normalize a backend product to the app's display shape.
 * Backend products already have id, name, price, image, category, rating, ratingCount.
 */
export function normalize(p) {
  return {
    id:          p.id,
    fakestoreId: p.fakestoreId ?? p.id,
    name:        p.name,
    price:       p.price,
    description: p.description,
    image:       p.image,
    category:    p.category,
    rating:      p.rating      ?? 0,
    ratingCount: p.ratingCount ?? 0,
    stock:       p.stock       ?? 99,
  };
}

/**
 * resolveDbId is now a no-op — the product.id IS the DB id.
 * Kept for backward compatibility so no other file needs changing.
 */
export async function resolveDbId(productId) {
  return productId;
}

export function clearIdCache() { /* no-op */ }
