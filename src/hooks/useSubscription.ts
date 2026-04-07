import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Subscription } from '../db/database';
import { useApp } from '../context/AppContext';

export interface SubscriptionState {
  plan: 'free' | 'trial' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  trialDaysLeft: number;
  isPremium: boolean;
  isTrialing: boolean;
  subscription: Subscription | undefined;
}

export function useSubscription(): SubscriptionState {
  const { currentPlayer } = useApp();
  const playerId = currentPlayer?.id;

  const subscription = useLiveQuery(
    () => (playerId ? db.subscriptions.where('playerId').equals(playerId).first() : undefined),
    [playerId]
  );

  const plan = subscription?.plan ?? 'free';
  const status = subscription?.status ?? 'active';

  let trialDaysLeft = 0;
  if (plan === 'trial' && subscription?.trialEndsAt) {
    const now = new Date();
    const diff = new Date(subscription.trialEndsAt).getTime() - now.getTime();
    trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return {
    plan,
    status,
    trialDaysLeft,
    isPremium: plan === 'premium' && status === 'active',
    isTrialing: plan === 'trial' && trialDaysLeft > 0,
    subscription,
  };
}
