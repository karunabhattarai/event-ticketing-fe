import { useNavigate } from 'react-router-dom';
import { ApiError } from './apiClient';

// Shared error-handling for organizer-facing mutations: a 401 mid-session
// (cookie expired after the page already mounted, past RequireOrganizer's
// one-time load-time probe) sends the organizer back to login; any other
// error surfaces the backend's own message instead of failing silently.
export function useOrganizerMutationError() {
  const navigate = useNavigate();

  return (error: unknown): string | null => {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        navigate('/organizer/login');
        return null;
      }
      return error.message;
    }
    return 'Something went wrong — try again';
  };
}
