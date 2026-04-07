import { useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';
import {
  Button,
  Card,
  Input,
  Badge,
  LoadingState,
  EmptyState,
} from '../../components/ui';

/* ─── Types ─── */

interface ConfigSlider {
  key: string;
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
}

interface RecommendationConfig {
  sliders: ConfigSlider[];
}

interface RecommendedItem {
  id: string;
  title: string;
  type: string;
  score: number;
  matchReason: string;
  ageGroup: string;
  thumbnail: string | null;
}

interface PreviewResponse {
  profileId: string;
  items: RecommendedItem[];
  computeTimeMs: number;
}

interface SimulateResponse {
  totalEvaluated: number;
  avgScore: number;
  diversityIndex: number;
  coveragePercent: number;
}

/* ─── Constants ─── */

const DEFAULT_SLIDERS: ConfigSlider[] = [
  { key: 'freshness_weight', label: 'Freshness Weight', description: 'How much to favor newer content', value: 50, min: 0, max: 100 },
  { key: 'repeat_penalty', label: 'Repeat Penalty', description: 'Penalty for recently viewed content', value: 30, min: 0, max: 100 },
  { key: 'bedtime_bias', label: 'Bedtime Bias', description: 'Boost calm content during bedtime hours', value: 60, min: 0, max: 100 },
  { key: 'skill_boost', label: 'Skill Boost', description: 'Priority for skill-building content', value: 40, min: 0, max: 100 },
  { key: 'age_relevance', label: 'Age Relevance', description: 'How strictly to match age group', value: 70, min: 0, max: 100 },
  { key: 'diversity_factor', label: 'Diversity Factor', description: 'Variety across content types', value: 55, min: 0, max: 100 },
  { key: 'engagement_weight', label: 'Engagement Weight', description: 'Favor content with high engagement rates', value: 45, min: 0, max: 100 },
  { key: 'completion_boost', label: 'Completion Boost', description: 'Boost content likely to be completed', value: 35, min: 0, max: 100 },
];

const TYPE_VARIANTS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  story: 'primary',
  quiz: 'warning',
  alphabet: 'info',
  number: 'info',
  matching: 'success',
  coloring: 'success',
  tracing: 'success',
  song: 'primary',
  video: 'danger',
  game: 'warning',
};

/* ─── Component ─── */

export function RecommendationLabPage() {
  const toast = useToast();
  const [profileId, setProfileId] = useState('');
  const [localSliders, setLocalSliders] = useState<ConfigSlider[]>(DEFAULT_SLIDERS);
  const [simulateResult, setSimulateResult] = useState<SimulateResponse | null>(null);

  // Load config
  const { loading: configLoading } = useQuery<RecommendationConfig>(
    () => api.get('/recommendations/config'),
    [],
    {
      onSuccess: (data) => {
        if (data.sliders?.length) {
          setLocalSliders(data.sliders);
        }
      },
    },
  );

  // Preview query - only when profile is entered and button clicked
  const [previewTriggered, setPreviewTriggered] = useState(false);
  const { data: previewData, loading: previewLoading } = useQuery<PreviewResponse>(
    () => api.get(`/recommendations/preview/${profileId}`),
    [profileId, previewTriggered],
    { enabled: !!profileId && previewTriggered },
  );

  // Save individual config value
  const { mutate: saveConfig } = useMutation<void, { key: string; value: number }>(
    (vars) => api.put(`/recommendations/config/${vars.key}`, { value: vars.value }),
    {
      onSuccess: () => toast.success('Configuration saved.'),
      onError: (err) => toast.error(err.message),
    },
  );

  // Simulate
  const { mutate: simulate, loading: simulating } = useMutation<SimulateResponse, void>(
    () =>
      api.post('/recommendations/simulate', {
        config: localSliders.reduce(
          (acc, s) => ({ ...acc, [s.key]: s.value }),
          {} as Record<string, number>,
        ),
      }),
    {
      onSuccess: (data) => {
        if (data) setSimulateResult(data);
        toast.success('Simulation complete.');
      },
      onError: (err) => toast.error(err.message),
    },
  );

  function handleSliderChange(key: string, value: number) {
    setLocalSliders((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s)),
    );
  }

  function handleSliderCommit(key: string, value: number) {
    saveConfig({ key, value });
  }

  function handlePreview() {
    if (!profileId.trim()) {
      toast.warning('Enter a profile ID to preview.');
      return;
    }
    setPreviewTriggered((t) => !t);
  }

  const previewItems = previewData?.items ?? [];

  if (configLoading) return <LoadingState message="Loading recommendation config..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Recommendation Lab</h1>
          <p className="text-text-secondary mt-1">
            Tune recommendation weights and preview personalized results.
          </p>
        </div>
        <Button
          variant="secondary"
          loading={simulating}
          onClick={() => simulate()}
        >
          Simulate
        </Button>
      </div>

      {/* Simulation Results */}
      {simulateResult && (
        <Card title="Simulation Results">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-text-secondary">Total Evaluated</p>
              <p className="text-lg font-semibold text-text">{simulateResult.totalEvaluated}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Avg Score</p>
              <p className="text-lg font-semibold text-text">{simulateResult.avgScore.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Diversity Index</p>
              <p className="text-lg font-semibold text-text">{simulateResult.diversityIndex.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Coverage</p>
              <p className="text-lg font-semibold text-text">{simulateResult.coveragePercent}%</p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Config Sliders */}
        <div className="space-y-4">
          <Card title="Recommendation Weights">
            <div className="space-y-5">
              {localSliders.map((slider) => (
                <div key={slider.key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-text">
                      {slider.label}
                    </label>
                    <span className="text-sm font-semibold text-primary tabular-nums">
                      {slider.value}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mb-2">{slider.description}</p>
                  <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    value={slider.value}
                    onChange={(e) => handleSliderChange(slider.key, Number(e.target.value))}
                    onMouseUp={() => handleSliderCommit(slider.key, slider.value)}
                    onTouchEnd={() => handleSliderCommit(slider.key, slider.value)}
                    className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-text-muted mt-0.5">
                    <span>{slider.min}</span>
                    <span>{slider.max}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Panel: Preview */}
        <div className="space-y-4">
          <Card title="Preview Recommendations">
            <div className="space-y-4">
              <div className="flex items-end gap-3">
                <Input
                  label="Profile ID"
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value)}
                  placeholder="Enter a child profile ID..."
                  className="flex-1"
                />
                <Button
                  onClick={handlePreview}
                  loading={previewLoading}
                  disabled={!profileId.trim()}
                >
                  Preview
                </Button>
              </div>

              {previewData && (
                <p className="text-xs text-text-secondary">
                  {previewItems.length} results in {previewData.computeTimeMs}ms
                </p>
              )}
            </div>
          </Card>

          {/* Preview Results Grid */}
          {previewLoading && <LoadingState message="Generating recommendations..." />}

          {!previewLoading && previewItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {previewItems.map((item) => (
                <Card key={item.id}>
                  <div className="space-y-2">
                    {/* Thumbnail placeholder */}
                    <div className="w-full h-24 bg-bg rounded-lg flex items-center justify-center">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-2xl text-text-muted">
                          {item.type === 'story' ? '📖' : item.type === 'song' ? '🎵' : item.type === 'game' ? '🎮' : '⭐'}
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-text truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={TYPE_VARIANTS[item.type] ?? 'default'}>
                          {item.type}
                        </Badge>
                        <span className="text-xs text-text-secondary">{item.ageGroup}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <span className="text-xs text-text-secondary">{item.matchReason}</span>
                      <span className="text-xs font-semibold text-primary">{item.score.toFixed(1)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!previewLoading && previewItems.length === 0 && profileId && previewTriggered && (
            <EmptyState
              title="No recommendations"
              description="No content matched for this profile with the current configuration."
            />
          )}
        </div>
      </div>
    </div>
  );
}
