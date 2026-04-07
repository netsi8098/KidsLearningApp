import { useState } from 'react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Content',
    items: [
      { label: 'Content', path: '/content', icon: 'doc' },
      { label: 'Assets', path: '/assets', icon: 'img' },
      { label: 'Collections', path: '/collections', icon: 'folder' },
    ],
  },
  {
    title: 'Workflow',
    items: [
      { label: 'Reviews', path: '/reviews', icon: 'check' },
      { label: 'Releases', path: '/releases', icon: 'cal' },
      { label: 'Localization', path: '/localization', icon: 'globe' },
    ],
  },
  {
    title: 'Billing',
    items: [
      { label: 'Subscriptions', path: '/subscriptions', icon: 'card' },
    ],
  },
  {
    title: 'Parents',
    items: [
      { label: 'Households', path: '/households', icon: 'home' },
      { label: 'Help Articles', path: '/help-articles', icon: 'book' },
      { label: 'Support Tickets', path: '/support-tickets', icon: 'ticket' },
      { label: 'Messages', path: '/messages', icon: 'mail' },
      { label: 'Journeys', path: '/journeys', icon: 'route' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Dashboard', path: '/analytics', icon: 'chart' },
      { label: 'Experiments', path: '/experiments', icon: 'flask' },
      { label: 'Performance', path: '/performance', icon: 'speed' },
      { label: 'SLA Dashboard', path: '/sla', icon: 'timer' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Feature Flags', path: '/feature-flags', icon: 'flag' },
      { label: 'Recommendations', path: '/recommendations', icon: 'star' },
      { label: 'Content Lifecycle', path: '/content-lifecycle', icon: 'cycle' },
      { label: 'Merchandising', path: '/merchandising', icon: 'store' },
      { label: 'Policies', path: '/policies', icon: 'shield' },
      { label: 'Deep Links', path: '/deep-links', icon: 'link' },
      { label: 'Exports', path: '/exports', icon: 'download' },
      { label: 'Error Triage', path: '/errors', icon: 'bug' },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Permissions', path: '/permissions', icon: 'lock' },
      { label: 'Audit Log', path: '/audit', icon: 'list' },
      { label: 'Search Index', path: '/search', icon: 'search' },
      { label: 'System Health', path: '/system', icon: 'heart' },
      { label: 'Maintenance', path: '/maintenance', icon: 'tool' },
    ],
  },
];

const ICON_MAP: Record<string, string> = {
  doc: '\u{1F4C4}', img: '\u{1F5BC}', folder: '\u{1F4C1}',
  check: '\u{2705}', cal: '\u{1F4C5}', globe: '\u{1F310}',
  chart: '\u{1F4CA}', flask: '\u{1F9EA}', home: '\u{1F3E0}',
  lock: '\u{1F512}', list: '\u{1F4CB}', search: '\u{1F50D}',
  heart: '\u{1F49A}', tool: '\u{1F527}',
  card: '\u{1F4B3}', book: '\u{1F4D6}', ticket: '\u{1F3AB}',
  mail: '\u{1F4E8}', route: '\u{1F6E4}', speed: '\u{26A1}',
  timer: '\u{23F1}', flag: '\u{1F6A9}', star: '\u{2B50}',
  cycle: '\u{1F504}', store: '\u{1F6CD}', shield: '\u{1F6E1}',
  link: '\u{1F517}', download: '\u{1F4E5}', bug: '\u{1F41B}',
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-60'} min-h-screen bg-sidebar text-sidebar-text transition-all duration-200 flex flex-col`}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-hover">
        {!collapsed && <span className="text-lg font-bold text-white">KL Admin</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-text hover:text-white p-1"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '\u{25B6}' : '\u{25C0}'}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-2">
            {!collapsed && (
              <div className="px-4 py-1 text-xs font-semibold uppercase text-text-muted tracking-wider">
                {group.title}
              </div>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-sidebar-active text-sidebar-text-active'
                      : 'hover:bg-sidebar-hover'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <span className="text-base">{ICON_MAP[item.icon] ?? ''}</span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
