import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { organizerLogin } from '../../api/organizerAuth';
import { ApiError } from '../../lib/apiClient';

export function OrganizerLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => organizerLogin(email, password),
    onSuccess: () => navigate('/organizer'),
  });

  return (
    <div className="mx-auto max-w-sm p-8">
      <Card>
        <h1 className="mb-4 text-lg font-bold">Organizer log in</h1>
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-2.5" />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {mutation.isError ? (
          <p className="mt-2 text-xs text-red-600">
            {mutation.error instanceof ApiError ? mutation.error.message : 'Something went wrong'}
          </p>
        ) : null}
        <Button className="mt-4 w-full" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          Log in
        </Button>
      </Card>
    </div>
  );
}
