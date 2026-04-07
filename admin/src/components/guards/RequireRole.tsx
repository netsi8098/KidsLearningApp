import { useAuth } from '../../hooks/useAuth';
import type { AuthUser } from '../../lib/auth';

interface RequireRoleProps {
  allowedRoles: AuthUser['role'][];
  children: React.ReactNode;
}

export function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-5xl font-bold text-danger mb-2">403</div>
          <h1 className="text-xl font-semibold text-text mb-2">Access Denied</h1>
          <p className="text-text-secondary">
            You do not have permission to view this page. Contact an administrator
            if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
