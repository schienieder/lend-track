import { CreatePaymentData, UpdatePaymentData, Payment } from '@/schemas/payment';

const API_BASE = '/api';

interface PaymentsResponse {
  payments: Payment[];
  total_paid: number;
}

interface SinglePaymentResponse {
  payment: Payment;
}

interface MutationResponse {
  message: string;
  payment?: Payment;
}

// Helper to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const session = localStorage.getItem('supabase.auth.token');
  let token = '';

  if (session) {
    try {
      const parsed = JSON.parse(session);
      token = parsed?.currentSession?.access_token || '';
    } catch {
      // Try alternative storage key pattern
    }
  }

  // Fallback: try to get from supabase storage
  const keys = Object.keys(localStorage);
  const supabaseKey = keys.find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
  if (supabaseKey && !token) {
    try {
      const data = JSON.parse(localStorage.getItem(supabaseKey) || '');
      token = data?.access_token || '';
    } catch {
      // Ignore parsing errors
    }
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Fetch all payments for a loan
export async function fetchPayments(loanId: string): Promise<PaymentsResponse> {
  const response = await fetch(`${API_BASE}/loans/${loanId}/payments`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch payments');
  }

  return response.json();
}

// Fetch a single payment by ID
export async function fetchPayment(id: string): Promise<SinglePaymentResponse> {
  const response = await fetch(`${API_BASE}/payments/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch payment');
  }

  return response.json();
}

// Create a new payment for a loan
export async function createPayment(loanId: string, data: CreatePaymentData): Promise<MutationResponse> {
  const response = await fetch(`${API_BASE}/loans/${loanId}/payments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create payment');
  }

  return response.json();
}

// Update a payment
export async function updatePayment(id: string, data: UpdatePaymentData): Promise<MutationResponse> {
  const response = await fetch(`${API_BASE}/payments/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update payment');
  }

  return response.json();
}

// Delete a payment
export async function deletePayment(id: string): Promise<MutationResponse> {
  const response = await fetch(`${API_BASE}/payments/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete payment');
  }

  return response.json();
}
