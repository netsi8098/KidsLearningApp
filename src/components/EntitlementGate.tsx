import type { ReactNode } from 'react';
import { useEntitlement } from '../hooks/useEntitlement';
import UpgradePrompt from './UpgradePrompt';

interface EntitlementGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function EntitlementGate({ feature, children, fallback }: EntitlementGateProps) {
  const { hasEntitlement } = useEntitlement();

  if (hasEntitlement(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <UpgradePrompt feature={feature} />;
}
