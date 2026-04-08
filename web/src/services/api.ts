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

export const getDeliveries = async (date?: string) => {
  const { data } = await api.get('/deliveries', { params: date ? { date } : {} });
  return data;
};

export const markDeliverySlot = async ({
  id, action, qty_delivered,
}: {
  id: string;
  action: 'delivered' | 'skipped' | 'pending';
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

export const getPaymentReceipt = async (paymentId: string) => {
  const { data } = await api.get(`/payments/receipt/${paymentId}`);
  return data;
};


export const getInvoices = async (year?: number, month?: number) => {
  const params: any = {};
  if (year)  params.year  = year;
  if (month) params.month = month;
  const { data } = await api.get('/invoices', { params });
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

// ─── Grades ──────────────────────────────────────────────────────────────────
export const getGrades = async (all = false) => {
  const { data } = await api.get('/grades', { params: all ? { all: 'true' } : {} });
  return data;
};
export const createGrade = async (payload: { label: string; price_per_unit: number }) => {
  const { data } = await api.post('/grades', payload);
  return data;
};
export const updateGrade = async (id: string, payload: { label?: string; price_per_unit?: number }) => {
  const { data } = await api.patch(`/grades/${id}`, payload);
  return data;
};
export const deactivateGrade = async (id: string) => {
  const { data } = await api.delete(`/grades/${id}`);
  return data;
};
export const setSubscriptionGrade = async (subscriptionId: string, grade_id: string) => {
  const { data } = await api.patch(`/subscriptions/${subscriptionId}/grade`, { grade_id });
  return data;
};
export const setSlotGrade = async (slotId: string, grade_id: string) => {
  const { data } = await api.patch(`/delivery-slots/${slotId}/grade`, { grade_id });
  return data;
};

// ─── Holidays ────────────────────────────────────────────────────────────────
export const getHolidays = async (customerId: string) => {
  const { data } = await api.get(`/holidays/${customerId}`);
  return data;
};
export const addHoliday = async (payload: {
  customer_id: string;
  subscription_id: string;
  date: string;
  reason?: string;
}) => {
  const { data } = await api.post('/holidays', payload);
  return data;
};
export const addHolidayRange = async (payload: {
  customer_id: string;
  subscription_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
}) => {
  const { data } = await api.post('/holidays/range', payload);
  return data;
};
export const removeHoliday = async (id: string) => {
  const { data } = await api.delete(`/holidays/${id}`);
  return data;
};
