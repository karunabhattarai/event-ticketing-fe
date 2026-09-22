import { useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listMyEvents } from '../api/events';

export function RequireOrganizer({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ['my-events'], queryFn: listMyEvents, retry: false });

  // Any error here — a 401, a 500, a dropped network request — means the auth
  // probe didn't succeed, so this route can't be confirmed as authenticated.
  // Treating only 401 as "not authenticated" left every other failure mode
  // fail open, rendering the protected page with no confirmed session.
  useEffect(() => {
    if (query.error) {
      navigate('/organizer/login');
    }
  }, [query.error, navigate]);

  if (query.isLoading) return null;
  if (query.error) return null;

  return <>{children}</>;
}
