import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

const defaultFlags: Record<string, boolean> = {
  routines: true,
  inbox: true,
  billing: true,
  parent_tips: true,
  help_center: true,
  privacy_settings: true,
  deep_links: true,
  sync: false,
  performance_tracking: true,
  error_reporting: true,
};

export function useFeatureFlag() {
  const flags = useLiveQuery(() => db.featureFlags.toArray(), [], []);

  function isEnabled(key: string): boolean {
    const dbFlag = flags.find((f) => f.key === key);
    if (dbFlag !== undefined) return dbFlag.enabled;
    return defaultFlags[key] ?? false;
  }

  return { isEnabled };
}
