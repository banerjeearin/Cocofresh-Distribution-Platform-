import axios from 'axios';

// Fastify backend runs on port 3001
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptors here if needed (e.g., for auth tokens)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const checkHealth = async () => {
  const { data } = await api.get('/../health'); // using /health relative to /api goes up
  return data;
};

// Customer specific API calls can be defined here or in a separate file like customerService.ts
export const getCustomers = async () => {
  const { data } = await api.get('/customers');
  return data;
};

export const getDashboardStats = async () => {
  const { data } = await api.get('/dashboard');
  return data;
};

export const getDeliveries = async () => {
  const { data } = await api.get('/deliveries');
  return data;
};

export const getPayments = async () => {
  const { data } = await api.get('/payments');
  return data;
};

export const getInvoices = async () => {
  const { data } = await api.get('/invoices');
  return data;
};

export const getWhatsApp = async () => {
  const { data } = await api.get('/whatsapp');
  return data;
};
