import { Link } from 'react-router-dom';

export function Nav({ variant = 'public' }: { variant?: 'public' | 'organizer' }) {
  return (
    <nav className="flex items-center justify-between border-b border-border bg-white px-5 py-3.5">
      <Link to="/" className="text-xl font-bold text-accent">tixly</Link>
      {variant === 'public' ? (
        <div className="flex gap-5 text-sm font-medium text-muted">
          <Link to="/">Events</Link>
          <Link to="/account/orders">My tickets</Link>
        </div>
      ) : null}
    </nav>
  );
}
