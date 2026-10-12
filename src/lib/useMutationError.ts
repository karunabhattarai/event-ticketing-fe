import { useNavigate } from 'react-router-dom';
import { ApiError } from './apiClient';

// Shared error handling for an auth-scoped error, whether from a mutation or a
// query: a 401 mid-session (cookie expired after the page already mounted, past
// RequireOrganizer/RequireBuyer's one-time load-time probe) sends the user back
// to login; any other error (404 not-found, 500, network) surfaces the backend's
// own message instead of failing silently or redirecting for the wrong reason —
// a 404 on "event not found" isn't a session problem and shouldn't look like one.
function useErrorHandler(loginPath: string) {
  const navigate = useNavigate();

  return (error: unknown): string | null => {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        navigate(loginPath);
        return null;
      }
      return error.message;
    }
    return 'Something went wrong — try again';
  };
}

export function useOrganizerMutationError() {
  return useErrorHandler('/organizer/login');
}

export function useBuyerMutationError() {
  return useErrorHandler('/login');
}
