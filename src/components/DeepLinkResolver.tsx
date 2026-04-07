import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useDeepLink } from '../hooks/useDeepLink';

interface DeepLinkResolverProps {
  children: ReactNode;
}

export default function DeepLinkResolver({ children }: DeepLinkResolverProps) {
  const location = useLocation();
  const { resolveDeepLink } = useDeepLink();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const deepLink = params.get('dl') || params.get('deeplink');

    if (deepLink) {
      resolveDeepLink(deepLink);
    }
  }, [location.search, resolveDeepLink]);

  return <>{children}</>;
}
