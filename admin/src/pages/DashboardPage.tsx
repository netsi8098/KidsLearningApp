import { useAuth } from '../hooks/useAuth';

/* Mock data — replace with real API calls via useQuery */
const stats = [
  {
    label: 'Total Content',
    value: '316',
    change: '+12 this week',
    color: 'bg-primary-light text-primary',
  },
  {
    label: 'Pending Reviews',
    value: '8',
    change: '3 urgent',
    color: 'bg-warning-light text-warning',
  },
  {
    label: 'Active Experiments',
    value: '4',
    change: '2 concluding soon',
    color: 'bg-info-light text-info',
  },
  {
    label: 'System Health',
    value: '99.9%',
    change: 'All services up',
    color: 'bg-success-light text-success',
  },
];

const recentActivity = [
  { action: 'Content updated', item: 'ABC Tracing Letters', user: 'Sarah M.', time: '10 min ago' },
  { action: 'Review approved', item: 'Number Counting 1-20', user: 'James K.', time: '25 min ago' },
  { action: 'Release scheduled', item: 'v6.2 Spring Update', user: 'Admin', time: '1 hour ago' },
  { action: 'Experiment started', item: 'New onboarding flow', user: 'Lisa R.', time: '2 hours ago' },
  { action: 'Asset uploaded', item: 'background-forest.svg', user: 'Sarah M.', time: '3 hours ago' },
];

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-text">
          Welcome back, {user?.name?.split(' ')[0] ?? 'Admin'}
        </h1>
        <p className="text-text-secondary mt-1">
          Here is what is happening with Kids Learning Fun today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface rounded-lg border border-border p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-text">{stat.value}</p>
            <span
              className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${stat.color}`}
            >
              {stat.change}
            </span>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-surface rounded-lg border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text">Recent Activity</h2>
        </div>
        <ul className="divide-y divide-border">
          {recentActivity.map((entry, i) => (
            <li key={i} className="px-5 py-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-text">{entry.action}</span>
                <span className="text-sm text-text-secondary"> &mdash; {entry.item}</span>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-sm text-text-secondary">{entry.user}</p>
                <p className="text-xs text-text-muted">{entry.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="bg-surface rounded-lg border border-border shadow-sm p-5">
        <h2 className="text-lg font-semibold text-text mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <QuickAction label="New Content" href="/content/new" />
          <QuickAction label="Review Queue" href="/reviews" />
          <QuickAction label="Release Calendar" href="/releases" />
          <QuickAction label="System Health" href="/system" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center rounded-md border border-border bg-bg px-4 py-2 text-sm font-medium text-text hover:bg-surface hover:border-primary hover:text-primary transition-colors"
    >
      {label}
    </a>
  );
}
