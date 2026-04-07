import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ConsentRecord, type DataRequest } from '../db/database';
import { useApp } from '../context/AppContext';

export interface ConsentItem {
  type: string;
  label: string;
  description: string;
  required: boolean;
  version: string;
}

const consentDefinitions: ConsentItem[] = [
  {
    type: 'privacy_policy',
    label: 'Privacy Policy',
    description: 'Required to use the app. We collect minimal data to provide the learning experience.',
    required: true,
    version: '2.0',
  },
  {
    type: 'data_collection',
    label: 'Data Collection',
    description: 'Allow us to collect usage data to improve content recommendations.',
    required: false,
    version: '1.0',
  },
  {
    type: 'marketing',
    label: 'Marketing Communications',
    description: 'Receive updates about new content, features, and tips via inbox messages.',
    required: false,
    version: '1.0',
  },
  {
    type: 'analytics',
    label: 'Analytics',
    description: 'Help us understand how the app is used to improve the experience for all children.',
    required: false,
    version: '1.1',
  },
];

export function usePrivacy() {
  const { currentPlayer } = useApp();
  const playerId = currentPlayer?.id;

  const consentRecords = useLiveQuery(
    () => (playerId ? db.consents.where('playerId').equals(playerId).toArray() : []),
    [playerId],
    [] as ConsentRecord[]
  );

  const pendingRequests = useLiveQuery(
    () =>
      playerId
        ? db.dataRequests
            .where('playerId')
            .equals(playerId)
            .filter((r) => r.status !== 'completed')
            .toArray()
        : [],
    [playerId],
    [] as DataRequest[]
  );

  const consents = consentDefinitions.map((def) => {
    const record = consentRecords.find((r) => r.consentType === def.type);
    return {
      ...def,
      granted: record?.granted ?? def.required,
      grantedAt: record?.grantedAt ?? null,
      currentVersion: def.version,
    };
  });

  const updateConsent = useCallback(
    async (consentType: string, granted: boolean) => {
      if (!playerId) return;
      const def = consentDefinitions.find((d) => d.type === consentType);
      if (!def) return;
      // Cannot revoke required consents
      if (def.required && !granted) return;

      const existing = await db.consents
        .where('[playerId+consentType]')
        .equals([playerId, consentType])
        .first();

      if (existing) {
        await db.consents.update(existing.id!, {
          granted,
          version: def.version,
          grantedAt: new Date(),
        });
      } else {
        await db.consents.add({
          playerId,
          consentType,
          granted,
          version: def.version,
          grantedAt: new Date(),
        });
      }
    },
    [playerId]
  );

  const requestExport = useCallback(async () => {
    if (!playerId) return;
    await db.dataRequests.add({
      playerId,
      type: 'export',
      status: 'pending',
      requestedAt: new Date(),
    });
  }, [playerId]);

  const requestDeletion = useCallback(async () => {
    if (!playerId) return;
    await db.dataRequests.add({
      playerId,
      type: 'deletion',
      status: 'pending',
      requestedAt: new Date(),
    });
  }, [playerId]);

  return {
    consents,
    consentDefinitions,
    updateConsent,
    requestExport,
    requestDeletion,
    pendingRequests,
  };
}
