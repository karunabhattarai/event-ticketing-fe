import { apiRequest } from '../lib/apiClient';

export type CheckinResult = { result: 'valid'; holderName: string; tierName: string };

export function checkinTicket(code: string): Promise<CheckinResult> {
  return apiRequest<CheckinResult>(`/tickets/${encodeURIComponent(code)}/check-in`, { method: 'POST' });
}
