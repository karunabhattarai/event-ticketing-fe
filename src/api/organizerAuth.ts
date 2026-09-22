import { apiRequest } from '../lib/apiClient';

type AuthedUser = { id: string; email: string; name: string };

export function organizerLogin(email: string, password: string): Promise<AuthedUser> {
  return apiRequest<AuthedUser>('/organizer/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function organizerRegister(email: string, password: string, name: string): Promise<AuthedUser> {
  return apiRequest<AuthedUser>('/organizer/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) });
}
