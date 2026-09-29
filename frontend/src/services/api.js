import axios from 'axios';

// Automatically uses the environment variable or defaults to backend localhost port 5000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000, // 20s timeout for AI reasoning operations
});

// ── Customer Refund Endpoints ──
export const lookupOrder = (orderNumber) =>
  api.get(`/refunds/lookup/${orderNumber}`);
export const submitRefundRequest = (payload) => api.post('/refunds', payload);

// ── Admin Dashboard Endpoints ──
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminRequests = (status = '') => {
  const query = status ? `?status=${status}` : '';
  return api.get(`/admin/requests${query}`);
};
export const updateRequestDecision = (id, payload) =>
  api.patch(`/admin/requests/${id}`, payload);
export const getSampleOrders = () => api.get('/admin/sample-orders');

export default api;
