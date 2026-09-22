import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { OrganizerSidebar } from '../../components/OrganizerSidebar';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { listMyEvents, getOrganizerStats } from '../../api/events';

export function DashboardPage() {
  const { data: events } = useQuery({ queryKey: ['my-events'], queryFn: listMyEvents });
  const { data: stats } = useQuery({ queryKey: ['organizer-stats'], queryFn: getOrganizerStats });

  return (
    <div className="flex">
      <OrganizerSidebar active="events" />
      <div className="flex-1 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-bold">My events</h1>
          <Link to="/organizer/events/new"><Button>+ New event</Button></Link>
        </div>
        {stats ? (
          <div className="mb-5 grid grid-cols-3 gap-3">
            <Card>
              <div className="text-xs text-muted">Tickets sold</div>
              <div className="mt-0.5 text-xl font-bold">{stats.ticketsSold}</div>
            </Card>
            <Card>
              <div className="text-xs text-muted">Revenue</div>
              <div className="mt-0.5 text-xl font-bold">Rs. {stats.revenue}</div>
            </Card>
            <Card>
              <div className="text-xs text-muted">Checked in</div>
              <div className="mt-0.5 text-xl font-bold">{stats.ticketsCheckedIn}</div>
            </Card>
          </div>
        ) : null}
        {(events ?? []).map((event) => {
          const sold = (event.tiers ?? []).reduce((sum, t) => sum + t.quantitySold, 0);
          const total = (event.tiers ?? []).reduce((sum, t) => sum + t.quantityTotal, 0);
          return (
            <Card key={event.id} className="mb-2.5 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">{event.title}</div>
                <div className="text-xs text-muted">
                  {new Date(event.startsAt).toLocaleDateString()} · {event.status === 'published' ? 'Published' : 'Draft'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">{sold} / {total} sold</span>
                <Link to={`/organizer/events/${event.id}/orders`}><Button variant="outline">Orders</Button></Link>
                <Link to={`/organizer/events/${event.id}/edit`}><Button variant="outline">Manage</Button></Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
