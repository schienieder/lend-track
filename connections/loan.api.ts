import { CreateLoanData, UpdateLoanData, Loan, LoanWithBalance, LoanQueryParams } from '@/schemas/loan';
import { supabase } from '@/lib/supabase';

const API_BASE = '/api/loans';

interface PaginatedResponse<T> {
  loans: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SingleLoanResponse {
  loan: LoanWithBalance;
}

interface MutationResponse {
  message: string;
  loan?: Loan;
}

// Helper to get auth headers
const getAuthHeaders = async (): Promise<HeadersInit> => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || '';

  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Fetch all loans with optional filters
export async function fetchLoans(params?: LoanQueryParams): Promise<PaginatedResponse<Loan>> {
  const searchParams = new URLSearchParams();

  if (params?.status) searchParams.set('status', params.status);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch loans');
  }

  return response.json();
}

// Fetch a single loan by ID
export async function fetchLoan(id: string): Promise<SingleLoanResponse> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch loan');
  }

  return response.json();
}

// Create a new loan
export async function createLoan(data: CreateLoanData): Promise<MutationResponse> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create loan');
  }

  return response.json();
}

// Update a loan
export async function updateLoan(id: string, data: UpdateLoanData): Promise<MutationResponse> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update loan');
  }

  return response.json();
}

// Delete a loan
export async function deleteLoan(id: string): Promise<MutationResponse> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete loan');
  }

  return response.json();
}
