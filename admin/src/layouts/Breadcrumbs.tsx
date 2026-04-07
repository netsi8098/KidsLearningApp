import { Link, useLocation } from 'react-router-dom';

const LABEL_MAP: Record<string, string> = {
  content: 'Content',
  assets: 'Assets',
  collections: 'Collections',
  reviews: 'Reviews',
  releases: 'Releases',
  localization: 'Localization',
  analytics: 'Analytics',
  experiments: 'Experiments',
  households: 'Households',
  permissions: 'Permissions',
  audit: 'Audit Log',
  search: 'Search Index',
  system: 'System Health',
  maintenance: 'Maintenance',
  new: 'New',
  edit: 'Edit',
};

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-text-secondary">
      <Link to="/" className="hover:text-primary">Dashboard</Link>
      {segments.map((segment, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/');
        const label = LABEL_MAP[segment] ?? segment;
        const isLast = i === segments.length - 1;

        return (
          <span key={path} className="flex items-center gap-1">
            <span className="text-text-muted">/</span>
            {isLast ? (
              <span className="text-text font-medium">{label}</span>
            ) : (
              <Link to={path} className="hover:text-primary">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
