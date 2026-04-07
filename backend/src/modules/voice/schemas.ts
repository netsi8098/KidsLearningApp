import { z } from 'zod';

// ── Voice Profiles ──────────────────────────────────────────

export const voiceProfiles = [
  'narrator',
  'mascot-host',
  'bedtime-narrator',
  'song-leader',
  'parent-guide',
] as const;

export type VoiceProfile = (typeof voiceProfiles)[number];

export const voiceJobStatuses = [
  'pending',
  'rendering',
  'review',
  'approved',
  'rejected',
] as const;

export type VoiceJobStatus = (typeof voiceJobStatuses)[number];

// ── List Voice Jobs ─────────────────────────────────────────

export const listVoiceJobsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(voiceJobStatuses).optional(),
    contentId: z.string().uuid().optional(),
    voiceProfile: z.enum(voiceProfiles).optional(),
    sortBy: z.enum(['createdAt', 'updatedAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export type ListVoiceJobsQuery = z.infer<typeof listVoiceJobsSchema>['query'];

// ── Get Voice Job ───────────────────────────────────────────

export const getVoiceJobSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Create Voice Job ────────────────────────────────────────

export const createVoiceJobSchema = z.object({
  body: z.object({
    contentId: z.string().uuid(),
    script: z.string().min(1).max(50_000),
    voiceProfile: z.enum(voiceProfiles).default('narrator'),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export type CreateVoiceJobBody = z.infer<typeof createVoiceJobSchema>['body'];

// ── Render Voice Job ────────────────────────────────────────

export const renderVoiceJobSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Update Voice Job (approve/reject) ───────────────────────

export const updateVoiceJobSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['approved', 'rejected']).optional(),
    feedback: z.string().max(5000).optional(),
    script: z.string().min(1).max(50_000).optional(),
    voiceProfile: z.enum(voiceProfiles).optional(),
    metadata: z.record(z.unknown()).optional(),
  }).refine(
    (data) => {
      if (data.status === 'rejected' && !data.feedback) {
        return false;
      }
      return true;
    },
    { message: 'Feedback is required when rejecting a voice job', path: ['feedback'] }
  ),
});

export type UpdateVoiceJobBody = z.infer<typeof updateVoiceJobSchema>['body'];

// ── Preview TTS ─────────────────────────────────────────────

export const previewVoiceSchema = z.object({
  body: z.object({
    text: z.string().min(1).max(500),
    voiceProfile: z.enum(voiceProfiles).default('narrator'),
  }),
});

export type PreviewVoiceBody = z.infer<typeof previewVoiceSchema>['body'];
