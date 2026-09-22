import { useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listMyEvents } from '../api/events';
import { ApiError } from '../lib/apiClient';

export function RequireOrganizer({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ['my-events'], queryFn: listMyEvents, retry: false });

  useEffect(() => {
    if (query.error instanceof ApiError && query.error.status === 401) {
      navigate('/organizer/login');
    }
  }, [query.error, navigate]);

  if (query.isLoading) return null;
  if (query.error instanceof ApiError && query.error.status === 401) return null;

  return <>{children}</>;
}
