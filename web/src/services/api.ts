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

export const markDeliverySlot = async ({
  id, action, qty_delivered,
}: {
  id: string;
  action: 'delivered' | 'skipped';
  qty_delivered?: number;
}) => {
  const { data } = await api.patch(`/deliveries/${id}`, {
    action,
    qty_delivered,
    marked_by: 'admin',
  });
  return data;
};

export const bulkDeliverAll = async (slotIds?: string[]) => {
  const { data } = await api.post('/deliveries/bulk', {
    slot_ids:  slotIds,   // undefined = all today's pending
    action:    'delivered',
    marked_by: 'admin',
  });
  return data;
};


export const getPayments = async () => {
  const { data } = await api.get('/payments');
  return data;
};

export const recordPayment = async (payload: {
  customer_id: string;
  amount: number;
  payment_mode: string;
  reference?: string;
  payment_date?: string;
}) => {
  const { data } = await api.post('/payments', payload);
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

export const logWhatsAppMessage = async (payload: {
  customer_id:   string;
  template_type: string;
  message_body?: string;
}) => {
  const { data } = await api.post('/whatsapp', payload);
  return data;
};

export const markWhatsAppSent = async (id: string) => {
  const { data } = await api.patch(`/whatsapp/${id}/sent`);
  return data;
};

