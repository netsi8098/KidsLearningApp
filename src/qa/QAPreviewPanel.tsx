// ── QA Preview Panel ─────────────────────────────────────────────
// Development/admin panel for reviewing content quality. Appears
// behind the parent gate. Shows content metadata, QA checklist with
// pass/fail toggles, review status, and export functionality.
//
// Access: PreviewPage, or overlay on any content page during dev mode.

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { contentRegistry } from '../registry/contentRegistry';
import { getTagsForContent } from '../registry/tagsConfig';
import { getSkillsForContent } from '../registry/skillsConfig';
import { getContentBadges } from '../registry/releaseConfig';
import { getAccessTier } from '../registry/accessConfig';
import {
  qaCheckItems,
  getChecksForContentType,
  calculateReviewStatus,
  createEmptyReview,
  getReviewStats,
  qaAreaMeta,
  type QAArea,
  type QACheckResult,
  type QAReview,
  type QASeverity,
  type ContentTypeForQA,
} from './qaChecklist';
import {
  reviewMatrix,
  getRequiredAreas,
  getOptionalAreas,
  getWeight,
  getMaxScore,
} from './qaMatrix';
import { parentModeConfig } from '../brand/parentMode';

// ── Props ──────────────────────────────────────────────────────

export interface QAPreviewPanelProps {
  /** Content item ID to review (e.g., 'lesson:l-2-abc-1') */
  contentId?: string;
  /** Whether the panel is visible */
  visible?: boolean;
  /** Close handler */
  onClose?: () => void;
}

// ── Severity Colors ─────────────────────────────────────────────

const severityColors: Record<QASeverity, { bg: string; text: string; border: string }> = {
  critical: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  major: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  minor: { bg: '#F0F9FF', text: '#2563EB', border: '#BFDBFE' },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  approved: { bg: '#D1FAE5', text: '#059669' },
  'needs-revision': { bg: '#FEF3C7', text: '#D97706' },
  rejected: { bg: '#FEE2E2', text: '#DC2626' },
};

// ── Main Component ──────────────────────────────────────────────

export default function QAPreviewPanel({
  contentId,
  visible = true,
  onClose,
}: QAPreviewPanelProps) {
  // ── State ──────────────────────────────────────────────────

  const [activeTab, setActiveTab] = useState<'metadata' | 'checklist' | 'matrix'>('metadata');
  const [showGrid, setShowGrid] = useState(false);
  const [simulateReducedMotion, setSimulateReducedMotion] = useState(false);
  const [simulateBedtime, setSimulateBedtime] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  // Find content item in registry
  const contentItem = useMemo(
    () => contentRegistry.find((item) => item.id === contentId),
    [contentId],
  );

  // Determine content type for QA mapping
  const contentType: ContentTypeForQA | null = useMemo(() => {
    if (!contentItem) return null;
    const type = contentItem.type;
    // Map registry content types to QA content types
    const mapping: Record<string, ContentTypeForQA> = {
      story: 'story',
      lesson: 'lesson',
      game: 'game',
      video: 'video',
      audio: 'audio',
      quiz: 'quiz',
      coloring: 'coloring',
      cooking: 'cooking',
      movement: 'movement',
      explorer: 'explorer',
      emotion: 'emotion',
      homeactivity: 'homeactivity',
    };
    return mapping[type] ?? 'lesson';
  }, [contentItem]);

  // Build review state
  const [checkResults, setCheckResults] = useState<Map<string, QACheckResult>>(new Map());

  const applicableChecks = useMemo(
    () => (contentType ? getChecksForContentType(contentType) : []),
    [contentType],
  );

  // Group checks by area
  const checksByArea = useMemo(() => {
    const grouped = new Map<QAArea, typeof applicableChecks>();
    for (const check of applicableChecks) {
      const existing = grouped.get(check.area) ?? [];
      existing.push(check);
      grouped.set(check.area, existing);
    }
    return grouped;
  }, [applicableChecks]);

  // Content metadata
  const tags = useMemo(() => (contentId ? getTagsForContent(contentId) : []), [contentId]);
  const skills = useMemo(() => (contentId ? getSkillsForContent(contentId) : []), [contentId]);
  const badges = useMemo(() => (contentId ? getContentBadges(contentId) : []), [contentId]);
  const accessTier = useMemo(() => (contentId ? getAccessTier(contentId) : 'free'), [contentId]);

  // Review status
  const reviewStatus = useMemo(() => {
    if (!contentType) return 'needs-revision' as const;
    const results = Array.from(checkResults.values());
    return calculateReviewStatus(results, contentType);
  }, [checkResults, contentType]);

  const reviewStats = useMemo(() => {
    const review: QAReview = {
      contentId: contentId ?? '',
      contentType: contentType ?? 'lesson',
      reviewerId: 'dev',
      date: new Date().toISOString().split('T')[0],
      checks: Array.from(checkResults.values()),
      overallStatus: reviewStatus,
      notes: reviewNotes,
    };
    return getReviewStats(review);
  }, [checkResults, contentId, contentType, reviewStatus, reviewNotes]);

  // ── Handlers ───────────────────────────────────────────────

  const toggleCheck = useCallback((checkId: string) => {
    setCheckResults((prev) => {
      const next = new Map(prev);
      const existing = next.get(checkId);
      if (existing) {
        next.set(checkId, { ...existing, passed: !existing.passed });
      } else {
        next.set(checkId, { checkId, passed: true });
      }
      return next;
    });
  }, []);

  const addCheckNote = useCallback((checkId: string, note: string) => {
    setCheckResults((prev) => {
      const next = new Map(prev);
      const existing = next.get(checkId);
      if (existing) {
        next.set(checkId, { ...existing, note });
      } else {
        next.set(checkId, { checkId, passed: false, note });
      }
      return next;
    });
  }, []);

  const handleApprove = useCallback(() => {
    // Mark all checks as passed
    const allPassed = new Map<string, QACheckResult>();
    for (const check of applicableChecks) {
      allPassed.set(check.id, { checkId: check.id, passed: true });
    }
    setCheckResults(allPassed);
  }, [applicableChecks]);

  const handleNeedsRevision = useCallback(() => {
    // Keep current state but ensure status reflects needs-revision
    // (status is computed from check results)
  }, []);

  const handleExportJSON = useCallback(() => {
    const review: QAReview = {
      contentId: contentId ?? '',
      contentType: contentType ?? 'lesson',
      reviewerId: 'dev',
      date: new Date().toISOString().split('T')[0],
      checks: Array.from(checkResults.values()),
      overallStatus: reviewStatus,
      notes: reviewNotes,
    };

    const json = JSON.stringify(review, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qa-review-${contentId ?? 'unknown'}-${review.date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [contentId, contentType, checkResults, reviewStatus, reviewNotes]);

  // ── Render ─────────────────────────────────────────────────

  if (!visible) return null;

  const pm = parentModeConfig;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col"
          style={{
            backgroundColor: pm.colors.background,
            color: pm.colors.text.primary,
            fontSize: pm.typography.bodySize,
          }}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'tween', duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: pm.colors.border }}
          >
            <div>
              <h2
                className="font-semibold"
                style={{ fontSize: pm.typography.headingSize }}
              >
                QA Preview
              </h2>
              {contentItem && (
                <p
                  className="mt-0.5"
                  style={{ fontSize: pm.typography.smallSize, color: pm.colors.text.muted }}
                >
                  {contentItem.emoji} {contentItem.title} ({contentItem.type})
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Status Badge */}
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: statusColors[reviewStatus].bg,
                  color: statusColors[reviewStatus].text,
                }}
              >
                {reviewStatus === 'needs-revision' ? 'Needs Revision' : reviewStatus === 'approved' ? 'Approved' : 'Rejected'}
              </span>
              {onClose && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  style={{ color: pm.colors.text.muted }}
                >
                  X
                </button>
              )}
            </div>
          </div>

          {/* Tab Bar */}
          <div
            className="flex border-b px-5"
            style={{ borderColor: pm.colors.border }}
          >
            {(['metadata', 'checklist', 'matrix'] as const).map((tab) => (
              <button
                key={tab}
                className="px-4 py-3 text-sm font-medium transition-colors cursor-pointer capitalize"
                style={{
                  color: activeTab === tab ? pm.colors.accent : pm.colors.text.muted,
                  borderBottom: activeTab === tab ? `2px solid ${pm.colors.accent}` : '2px solid transparent',
                }}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content Area (scrollable) */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* ── Metadata Tab ─────────────────────────────── */}
            {activeTab === 'metadata' && (
              <>
                {/* Content Info */}
                {contentItem ? (
                  <div
                    className="rounded-xl border p-4 space-y-3"
                    style={{ backgroundColor: '#FFFFFF', borderColor: pm.colors.border }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{contentItem.emoji}</span>
                      <div>
                        <p className="font-semibold">{contentItem.title}</p>
                        <p style={{ fontSize: pm.typography.smallSize, color: pm.colors.text.muted }}>
                          {contentItem.id} | {contentItem.type} | {contentItem.ageGroup ?? 'all ages'}
                          {contentItem.durationMinutes ? ` | ${contentItem.durationMinutes}min` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Badges */}
                    {badges.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {badges.map((badge) => (
                          <span
                            key={badge}
                            className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                            style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                          >
                            {badge}
                          </span>
                        ))}
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: accessTier === 'premium' ? '#FEF3C7' : '#D1FAE5',
                            color: accessTier === 'premium' ? '#92400E' : '#059669',
                          }}
                        >
                          {accessTier}
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div>
                        <p
                          className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                          style={{ color: pm.colors.text.muted }}
                        >
                          Tags
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded text-xs"
                              style={{ backgroundColor: '#F3F4F6', color: '#4B5563' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                      <div>
                        <p
                          className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                          style={{ color: pm.colors.text.muted }}
                        >
                          Skills
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded text-xs"
                              style={{ backgroundColor: '#ECFDF5', color: '#059669' }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="rounded-xl border p-4 text-center"
                    style={{ backgroundColor: '#FFFFFF', borderColor: pm.colors.border, color: pm.colors.text.muted }}
                  >
                    {contentId ? `Content "${contentId}" not found in registry` : 'No content selected'}
                  </div>
                )}

                {/* Preview Controls */}
                <div
                  className="rounded-xl border p-4 space-y-3"
                  style={{ backgroundColor: '#FFFFFF', borderColor: pm.colors.border }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: pm.colors.text.muted }}
                  >
                    Preview Controls
                  </p>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm">Grid Overlay (alignment check)</span>
                    <TogglePill active={showGrid} onToggle={() => setShowGrid(!showGrid)} />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm">Simulate Reduced Motion</span>
                    <TogglePill
                      active={simulateReducedMotion}
                      onToggle={() => setSimulateReducedMotion(!simulateReducedMotion)}
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm">Simulate Bedtime Mode</span>
                    <TogglePill
                      active={simulateBedtime}
                      onToggle={() => setSimulateBedtime(!simulateBedtime)}
                    />
                  </label>
                </div>

                {/* Review Stats Summary */}
                <div
                  className="rounded-xl border p-4"
                  style={{ backgroundColor: '#FFFFFF', borderColor: pm.colors.border }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: pm.colors.text.muted }}
                  >
                    Review Progress
                  </p>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <StatBox label="Total" value={reviewStats.total} color={pm.colors.text.primary} />
                    <StatBox label="Passed" value={reviewStats.passed} color={pm.colors.success} />
                    <StatBox label="Failed" value={reviewStats.failed} color={pm.colors.error} />
                    <StatBox label="Critical" value={reviewStats.critical_failed} color={pm.colors.error} />
                  </div>
                  {reviewStats.total > 0 && (
                    <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.round((reviewStats.passed / reviewStats.total) * 100)}%`,
                          backgroundColor: reviewStats.critical_failed > 0 ? pm.colors.error : pm.colors.success,
                        }}
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── Checklist Tab ────────────────────────────── */}
            {activeTab === 'checklist' && (
              <>
                {Array.from(checksByArea.entries()).map(([area, checks]) => (
                  <div key={area}>
                    <div className="flex items-center gap-2 mb-2">
                      <p
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: pm.colors.text.muted }}
                      >
                        {qaAreaMeta[area].label}
                      </p>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                      >
                        {checks.length}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {checks.map((check) => {
                        const result = checkResults.get(check.id);
                        const passed = result?.passed ?? false;
                        const sc = severityColors[check.severity];

                        return (
                          <div
                            key={check.id}
                            className="rounded-lg border p-3"
                            style={{
                              backgroundColor: passed ? '#F0FDF4' : '#FFFFFF',
                              borderColor: passed ? '#BBF7D0' : pm.colors.border,
                            }}
                          >
                            <div className="flex items-start gap-3">
                              {/* Pass/Fail Toggle */}
                              <button
                                className="mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors"
                                style={{
                                  borderColor: passed ? '#059669' : '#D1D5DB',
                                  backgroundColor: passed ? '#059669' : 'transparent',
                                  color: passed ? '#FFFFFF' : 'transparent',
                                }}
                                onClick={() => toggleCheck(check.id)}
                              >
                                {passed && (
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className="text-xs px-1.5 py-0.5 rounded font-medium"
                                    style={{ backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
                                  >
                                    {check.severity}
                                  </span>
                                  <span className="text-xs" style={{ color: pm.colors.text.muted }}>
                                    {check.id}
                                  </span>
                                </div>
                                <p className="text-sm leading-relaxed">{check.question}</p>

                                {/* Guidance (collapsible) */}
                                <details className="mt-1.5">
                                  <summary
                                    className="text-xs cursor-pointer"
                                    style={{ color: pm.colors.accent }}
                                  >
                                    Guidance
                                  </summary>
                                  <p
                                    className="text-xs mt-1 leading-relaxed"
                                    style={{ color: pm.colors.text.secondary }}
                                  >
                                    {check.guidance}
                                  </p>
                                </details>

                                {/* Note Input */}
                                <input
                                  type="text"
                                  placeholder="Add note..."
                                  value={result?.note ?? ''}
                                  onChange={(e) => addCheckNote(check.id, e.target.value)}
                                  className="mt-2 w-full text-xs px-2 py-1.5 rounded border outline-none focus:ring-1"
                                  style={{
                                    borderColor: pm.colors.border,
                                    backgroundColor: '#F9FAFB',
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ── Matrix Tab ───────────────────────────────── */}
            {activeTab === 'matrix' && contentType && (
              <>
                <div
                  className="rounded-xl border p-4"
                  style={{ backgroundColor: '#FFFFFF', borderColor: pm.colors.border }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: pm.colors.text.muted }}
                  >
                    Required Areas for: {contentType}
                  </p>
                  <div className="space-y-2">
                    {getRequiredAreas(contentType).map((area) => (
                      <div key={area} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{qaAreaMeta[area].label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: pm.colors.text.muted }}>
                            weight: {getWeight(contentType, area)}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{ backgroundColor: '#D1FAE5', color: '#059669' }}
                          >
                            Required
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {getOptionalAreas(contentType).length > 0 && (
                  <div
                    className="rounded-xl border p-4"
                    style={{ backgroundColor: '#FFFFFF', borderColor: pm.colors.border }}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-3"
                      style={{ color: pm.colors.text.muted }}
                    >
                      Optional Areas
                    </p>
                    <div className="space-y-2">
                      {getOptionalAreas(contentType).map((area) => (
                        <div key={area} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{qaAreaMeta[area].label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: pm.colors.text.muted }}>
                              weight: {getWeight(contentType, area)}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded text-xs font-medium"
                              style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                            >
                              Optional
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className="rounded-xl border p-4"
                  style={{ backgroundColor: '#FFFFFF', borderColor: pm.colors.border }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: pm.colors.text.muted }}
                  >
                    Max Possible Score
                  </p>
                  <p
                    className="text-2xl font-semibold"
                    style={{ fontFeatureSettings: pm.typography.fontFeatures }}
                  >
                    {getMaxScore(contentType)}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div
            className="flex items-center justify-between gap-3 px-5 py-4 border-t"
            style={{ borderColor: pm.colors.border, backgroundColor: '#FFFFFF' }}
          >
            {/* Review Notes */}
            <input
              type="text"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Review notes..."
              className="flex-1 text-sm px-3 py-2 rounded-lg border outline-none focus:ring-1"
              style={{ borderColor: pm.colors.border }}
            />

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJSON}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                style={{
                  backgroundColor: '#F3F4F6',
                  color: pm.colors.text.secondary,
                }}
              >
                Export
              </button>

              <button
                onClick={handleNeedsRevision}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                style={{
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                }}
              >
                Needs Revision
              </button>

              <button
                onClick={handleApprove}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                style={{
                  backgroundColor: '#D1FAE5',
                  color: '#059669',
                }}
              >
                Approve All
              </button>
            </div>
          </div>
        </motion.div>

        {/* Grid Overlay (applied to viewport) */}
        {showGrid && (
          <div
            className="fixed inset-0 pointer-events-none z-[60]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(74, 109, 140, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(74, 109, 140, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '8px 8px',
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Sub-Components ──────────────────────────────────────────────

function TogglePill({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      className="w-10 h-6 rounded-full flex items-center px-0.5 transition-colors cursor-pointer"
      style={{
        backgroundColor: active ? '#059669' : '#D1D5DB',
        justifyContent: active ? 'flex-end' : 'flex-start',
      }}
      onClick={onToggle}
    >
      <motion.div
        className="w-5 h-5 bg-white rounded-full shadow-sm"
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <p
        className="text-xl font-semibold"
        style={{ color, fontFeatureSettings: "'tnum' on" }}
      >
        {value}
      </p>
      <p className="text-xs" style={{ color: '#9CA3AF' }}>{label}</p>
    </div>
  );
}
