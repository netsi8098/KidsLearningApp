import { useSubscription } from './useSubscription';

const premiumFeatures = new Set([
  'offline_packs',
  'all_content',
  'multiple_profiles',
  'no_ads',
  'advanced_reports',
  'custom_routines',
  'export_data',
  'priority_support',
]);

const trialFeatures = new Set([
  'all_content',
  'multiple_profiles',
  'advanced_reports',
  'custom_routines',
]);

export function useEntitlement() {
  const { isPremium, isTrialing } = useSubscription();

  function hasEntitlement(feature: string): boolean {
    // Free features are always available
    if (!premiumFeatures.has(feature)) return true;

    // Premium users get everything
    if (isPremium) return true;

    // Trial users get a subset
    if (isTrialing && trialFeatures.has(feature)) return true;

    return false;
  }

  return { hasEntitlement };
}
