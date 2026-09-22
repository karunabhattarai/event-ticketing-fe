import { apiRequest } from '../lib/apiClient';

// All three calls require the order's accessToken as a query param — the
// backend plan gates these endpoints the same way it gates GET /orders/:id,
// since an order id alone isn't authorization (see backend Global Constraints).

export function initiateRedirectPayment(orderId: string, token: string): Promise<{ url: string }> {
  return apiRequest<{ url: string }>(`/payment/redirect/${orderId}/initiate?token=${encodeURIComponent(token)}`, { method: 'POST' });
}

export function generateDynamicQr(orderId: string, token: string): Promise<{ qrImageDataUrl: string; expiresInSeconds: number }> {
  return apiRequest(`/payment/dynamic-qr/${orderId}/generate?token=${encodeURIComponent(token)}`, { method: 'POST' });
}

export function pollDynamicQrStatus(orderId: string, token: string): Promise<{ status: string }> {
  return apiRequest(`/payment/dynamic-qr/${orderId}/status?token=${encodeURIComponent(token)}`);
}
