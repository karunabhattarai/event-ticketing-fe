import { Link } from 'react-router-dom';

export function OrganizerSidebar({ active }: { active: 'events' | 'checkin' }) {
  const item = (key: typeof active, label: string, to: string) => (
    <Link
      to={to}
      className={`mb-0.5 block rounded-lg px-2.5 py-2 text-sm font-semibold ${active === key ? 'bg-accent-light text-accent' : 'text-muted'}`}
    >
      {label}
    </Link>
  );

  // No separate "Account" page/route exists anywhere in this plan or the
  // spec (only login/register) — a sidebar link to one was dead by
  // construction. Removed rather than adding a page nothing else needs.
  return (
    <div className="w-44 shrink-0 border-r border-border bg-white p-3">
      <div className="mb-5 px-2 text-lg font-bold text-accent">tixly</div>
      {item('events', 'My events', '/organizer')}
      {item('checkin', 'Check-in scanner', '/organizer/checkin')}
    </div>
  );
}
