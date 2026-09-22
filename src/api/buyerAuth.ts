import { apiRequest } from '../lib/apiClient';

type AuthedUser = { id: string; email: string; name: string };

export function buyerLogin(email: string, password: string): Promise<AuthedUser> {
  return apiRequest<AuthedUser>('/buyer/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function buyerRegister(email: string, password: string, name: string): Promise<AuthedUser> {
  return apiRequest<AuthedUser>('/buyer/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) });
}
