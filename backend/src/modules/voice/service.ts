import { prisma } from '../../lib/prisma.js';
import { aiQueue } from '../../lib/queue.js';
import { NotFoundError, ValidationError } from '../../lib/errors.js';
import { paginate, type PaginationParams, type PaginatedResult } from '../../types/index.js';
import type {
  CreateVoiceJobBody,
  UpdateVoiceJobBody,
  ListVoiceJobsQuery,
  VoiceProfile,
  PreviewVoiceBody,
} from './schemas.js';
import type { VoiceJob } from '@prisma/client';

// ── Voice Profile Definitions ───────────────────────────────

export interface VoiceProfileConfig {
  id: VoiceProfile;
  name: string;
  description: string;
  rate: number;     // Speech rate multiplier (0.5 - 2.0)
  pitch: number;    // Pitch multiplier (0.5 - 2.0)
  volume: number;   // Volume (0.0 - 1.0)
  lang: string;     // BCP-47 language tag
  style: string;    // Descriptive style tag for TTS engines
}

const voiceProfileConfigs: Record<VoiceProfile, VoiceProfileConfig> = {
  'narrator': {
    id: 'narrator',
    name: 'Narrator',
    description: 'Warm, clear narration for educational content',
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
    lang: 'en-US',
    style: 'narration-professional',
  },
  'mascot-host': {
    id: 'mascot-host',
    name: 'Mascot Host',
    description: 'Energetic, enthusiastic host voice for interactive content',
    rate: 1.1,
    pitch: 1.2,
    volume: 1.0,
    lang: 'en-US',
    style: 'cheerful',
  },
  'bedtime-narrator': {
    id: 'bedtime-narrator',
    name: 'Bedtime Narrator',
    description: 'Soft, slow narration for bedtime stories',
    rate: 0.75,
    pitch: 0.9,
    volume: 0.8,
    lang: 'en-US',
    style: 'gentle',
  },
  'song-leader': {
    id: 'song-leader',
    name: 'Song Leader',
    description: 'Rhythmic, musical voice for songs and chants',
    rate: 1.0,
    pitch: 1.1,
    volume: 1.0,
    lang: 'en-US',
    style: 'lyrical',
  },
  'parent-guide': {
    id: 'parent-guide',
    name: 'Parent Guide',
    description: 'Professional, informative voice for parent-facing content',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    lang: 'en-US',
    style: 'narration-professional',
  },
};

// ── SSML Preprocessing ──────────────────────────────────────

/**
 * Preprocesses a script by injecting SSML tags based on the voice profile.
 * Handles pause markers, emphasis, and profile-specific adjustments.
 */
function preprocessScript(script: string, profile: VoiceProfile): string {
  const config = voiceProfileConfigs[profile];
  let processed = script;

  // Replace [pause] markers with SSML break tags
  processed = processed.replace(/\[pause\]/gi, '<break time="500ms"/>');
  processed = processed.replace(/\[pause:(\d+)\]/gi, '<break time="$1ms"/>');

  // Replace [long-pause] markers with longer breaks
  processed = processed.replace(/\[long-pause\]/gi, '<break time="1500ms"/>');

  // Replace *emphasized text* with SSML emphasis
  processed = processed.replace(/\*([^*]+)\*/g, '<emphasis level="strong">$1</emphasis>');

  // Replace _soft text_ with reduced emphasis
  processed = processed.replace(/_([^_]+)_/g, '<emphasis level="reduced">$1</emphasis>');

  // Add sentence-level pauses for bedtime narrator (longer pauses between sentences)
  if (profile === 'bedtime-narrator') {
    processed = processed.replace(/\.\s+/g, '.<break time="800ms"/> ');
  }

  // Wrap in SSML speak tag with prosody
  const ssml = `<speak>
  <prosody rate="${Math.round(config.rate * 100)}%" pitch="${config.pitch > 1 ? '+' : ''}${Math.round((config.pitch - 1) * 100)}%" volume="${config.volume === 1 ? 'medium' : config.volume > 0.8 ? 'medium' : 'soft'}">
    ${processed}
  </prosody>
</speak>`;

  return ssml;
}

/**
 * Estimates audio duration in milliseconds from word count and speech rate.
 * Average speaking rate is ~150 words per minute.
 */
function estimateDurationMs(script: string, profile: VoiceProfile): number {
  const config = voiceProfileConfigs[profile];
  const wordCount = script.split(/\s+/).filter((w) => w.length > 0).length;
  const wordsPerMinute = 150 * config.rate;
  const baseMinutes = wordCount / wordsPerMinute;

  // Account for pause markers
  const pauseCount = (script.match(/\[pause\]/gi) || []).length;
  const longPauseCount = (script.match(/\[long-pause\]/gi) || []).length;
  const customPauses = script.match(/\[pause:(\d+)\]/gi) || [];
  const customPauseMs = customPauses.reduce((sum, p) => {
    const match = p.match(/\[pause:(\d+)\]/i);
    return sum + (match ? parseInt(match[1], 10) : 0);
  }, 0);

  const pauseMs = pauseCount * 500 + longPauseCount * 1500 + customPauseMs;
  const totalMs = Math.round(baseMinutes * 60 * 1000) + pauseMs;

  return totalMs;
}

// ── Service Functions ───────────────────────────────────────

export async function listVoiceJobs(
  query: ListVoiceJobsQuery
): Promise<PaginatedResult<VoiceJob>> {
  const { page, limit, status, contentId, voiceProfile, sortBy, sortOrder } = query;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (contentId) where.contentId = contentId;
  if (voiceProfile) where.voiceProfile = voiceProfile;

  const [data, total] = await Promise.all([
    prisma.voiceJob.findMany({
      where,
      include: { content: { select: { id: true, title: true, slug: true, type: true } } },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.voiceJob.count({ where }),
  ]);

  return paginate(data, total, { page, limit, sortBy, sortOrder });
}

export async function getVoiceJob(id: string): Promise<VoiceJob> {
  const job = await prisma.voiceJob.findUnique({
    where: { id },
    include: {
      content: {
        select: { id: true, title: true, slug: true, type: true, status: true },
      },
    },
  });

  if (!job) {
    throw new NotFoundError('VoiceJob', id);
  }

  return job;
}

export async function createVoiceJob(data: CreateVoiceJobBody): Promise<VoiceJob> {
  // Verify content exists
  const content = await prisma.content.findUnique({
    where: { id: data.contentId },
    select: { id: true },
  });

  if (!content) {
    throw new NotFoundError('Content', data.contentId);
  }

  const durationMs = estimateDurationMs(data.script, data.voiceProfile);

  const job = await prisma.voiceJob.create({
    data: {
      contentId: data.contentId,
      script: data.script,
      voiceProfile: data.voiceProfile,
      status: 'pending',
      durationMs,
      metadata: {
        ...(data.metadata || {}),
        estimatedDurationMs: durationMs,
        wordCount: data.script.split(/\s+/).filter((w) => w.length > 0).length,
      },
    },
    include: {
      content: { select: { id: true, title: true, slug: true, type: true } },
    },
  });

  return job;
}

export async function renderVoice(id: string): Promise<VoiceJob> {
  const job = await prisma.voiceJob.findUnique({ where: { id } });

  if (!job) {
    throw new NotFoundError('VoiceJob', id);
  }

  if (job.status !== 'pending' && job.status !== 'rejected') {
    throw new ValidationError(
      `Cannot render voice job in '${job.status}' status. Must be 'pending' or 'rejected'.`
    );
  }

  // Preprocess the script with SSML
  const ssmlScript = preprocessScript(job.script, job.voiceProfile as VoiceProfile);

  // Update status to rendering
  const updated = await prisma.voiceJob.update({
    where: { id },
    data: {
      status: 'rendering',
      metadata: {
        ...(job.metadata as Record<string, unknown>),
        ssmlScript,
        renderStartedAt: new Date().toISOString(),
      },
    },
    include: {
      content: { select: { id: true, title: true, slug: true, type: true } },
    },
  });

  // Queue the rendering job
  await aiQueue.add('voice-render', {
    voiceJobId: id,
    script: ssmlScript,
    voiceProfile: job.voiceProfile,
    config: voiceProfileConfigs[job.voiceProfile as VoiceProfile],
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });

  return updated;
}

export async function approveVoice(id: string): Promise<VoiceJob> {
  const job = await prisma.voiceJob.findUnique({ where: { id } });

  if (!job) {
    throw new NotFoundError('VoiceJob', id);
  }

  if (job.status !== 'review') {
    throw new ValidationError(
      `Cannot approve voice job in '${job.status}' status. Must be in 'review'.`
    );
  }

  if (!job.audioUrl) {
    throw new ValidationError('Cannot approve a voice job without a rendered audio URL.');
  }

  // Create an Asset record linked to the audio
  const asset = await prisma.asset.create({
    data: {
      contentId: job.contentId,
      filename: `voice-${job.id}.wav`,
      storageKey: job.audioUrl,
      mimeType: 'audio/wav',
      sizeBytes: 0, // Will be updated by processing pipeline
      metadata: {
        voiceJobId: job.id,
        voiceProfile: job.voiceProfile,
        durationMs: job.durationMs,
      },
    },
  });

  const updated = await prisma.voiceJob.update({
    where: { id },
    data: {
      status: 'approved',
      metadata: {
        ...(job.metadata as Record<string, unknown>),
        approvedAt: new Date().toISOString(),
        assetId: asset.id,
      },
    },
    include: {
      content: { select: { id: true, title: true, slug: true, type: true } },
    },
  });

  return updated;
}

export async function rejectVoice(id: string, feedback: string): Promise<VoiceJob> {
  const job = await prisma.voiceJob.findUnique({ where: { id } });

  if (!job) {
    throw new NotFoundError('VoiceJob', id);
  }

  if (job.status !== 'review') {
    throw new ValidationError(
      `Cannot reject voice job in '${job.status}' status. Must be in 'review'.`
    );
  }

  const updated = await prisma.voiceJob.update({
    where: { id },
    data: {
      status: 'rejected',
      metadata: {
        ...(job.metadata as Record<string, unknown>),
        rejectedAt: new Date().toISOString(),
        rejectionFeedback: feedback,
      },
    },
    include: {
      content: { select: { id: true, title: true, slug: true, type: true } },
    },
  });

  return updated;
}

export async function updateVoiceJob(
  id: string,
  data: UpdateVoiceJobBody
): Promise<VoiceJob> {
  const job = await prisma.voiceJob.findUnique({ where: { id } });

  if (!job) {
    throw new NotFoundError('VoiceJob', id);
  }

  // Handle approve/reject via status
  if (data.status === 'approved') {
    return approveVoice(id);
  }
  if (data.status === 'rejected') {
    if (!data.feedback) {
      throw new ValidationError('Feedback is required when rejecting a voice job.');
    }
    return rejectVoice(id, data.feedback);
  }

  // Regular field updates (only when pending or rejected)
  if (job.status !== 'pending' && job.status !== 'rejected') {
    throw new ValidationError(
      `Cannot update voice job in '${job.status}' status. Must be 'pending' or 'rejected'.`
    );
  }

  const updateData: Record<string, unknown> = {};

  if (data.script !== undefined) {
    updateData.script = data.script;
    const profile = (data.voiceProfile || job.voiceProfile) as VoiceProfile;
    updateData.durationMs = estimateDurationMs(data.script, profile);
  }

  if (data.voiceProfile !== undefined) {
    updateData.voiceProfile = data.voiceProfile;
    const script = data.script || job.script;
    updateData.durationMs = estimateDurationMs(script, data.voiceProfile);
  }

  if (data.metadata !== undefined) {
    updateData.metadata = {
      ...(job.metadata as Record<string, unknown>),
      ...data.metadata,
    };
  }

  const updated = await prisma.voiceJob.update({
    where: { id },
    data: updateData,
    include: {
      content: { select: { id: true, title: true, slug: true, type: true } },
    },
  });

  return updated;
}

export function getVoiceProfiles(): VoiceProfileConfig[] {
  return Object.values(voiceProfileConfigs);
}

export function previewVoice(data: PreviewVoiceBody): {
  ssml: string;
  estimatedDurationMs: number;
  profile: VoiceProfileConfig;
} {
  const profile = voiceProfileConfigs[data.voiceProfile];
  const ssml = preprocessScript(data.text, data.voiceProfile);
  const estimatedDurationMs = estimateDurationMs(data.text, data.voiceProfile);

  return {
    ssml,
    estimatedDurationMs,
    profile,
  };
}
