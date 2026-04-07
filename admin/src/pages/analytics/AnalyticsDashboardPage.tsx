import { useMemo, useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { api } from '../../lib/api';
import {
  Button,
  Select,
  StatsCard,
  Card,
  DataTable,
  LineChart,
  PieChart,
  LoadingState,
} from '../../components/ui';

/* ─── Types ─── */

interface DashboardStats {
  totalViews: number;
  totalCompletions: number;
  totalFavorites: number;
  avgEngagement: number;
  viewsChange: number;
  completionsChange: number;
  favoritesChange: number;
  engagementChange: number;
}

interface TrendPoint {
  [key: string]: string | number;
  name: string;
  views: number;
  completions: number;
}

interface TopContentItem {
  id: string;
  title: string;
  type: string;
  views: number;
  completions: number;
  engagementRate: number;
}

interface TypeDistribution {
  name: string;
  value: number;
}

interface SkillCoverage {
  skill: string;
  [ageGroup: string]: string | number;
}

interface DashboardResponse {
  stats: DashboardStats;
  trend: TrendPoint[];
  typeDistribution: TypeDistribution[];
  skillCoverage: SkillCoverage[];
}

interface TopContentResponse {
  data: TopContentItem[];
}

/* ─── Fallback mock data ─── */

const MOCK_STATS: DashboardStats = {
  totalViews: 24_531,
  totalCompletions: 12_847,
  totalFavorites: 3_219,
  avgEngagement: 72,
  viewsChange: 12.4,
  completionsChange: 8.1,
  favoritesChange: -2.3,
  engagementChange: 5.7,
};

const MOCK_TREND: TrendPoint[] = [
  { name: 'Mon', views: 3200, completions: 1800 },
  { name: 'Tue', views: 3800, completions: 2100 },
  { name: 'Wed', views: 3500, completions: 1950 },
  { name: 'Thu', views: 4100, completions: 2400 },
  { name: 'Fri', views: 3900, completions: 2200 },
  { name: 'Sat', views: 2800, completions: 1500 },
  { name: 'Sun', views: 3231, completions: 1897 },
];

const MOCK_TOP: TopContentItem[] = [
  { id: '1', title: 'ABC Song Adventure', type: 'song', views: 4521, completions: 3102, engagementRate: 68.6 },
  { id: '2', title: 'Counting to 10', type: 'number', views: 3890, completions: 2945, engagementRate: 75.7 },
  { id: '3', title: 'Animal Match Game', type: 'matching', views: 3654, completions: 2687, engagementRate: 73.5 },
  { id: '4', title: 'Color Splash', type: 'coloring', views: 3201, completions: 2510, engagementRate: 78.4 },
  { id: '5', title: 'Bedtime Stories', type: 'story', views: 2987, completions: 2341, engagementRate: 78.4 },
  { id: '6', title: 'Shape Tracing', type: 'tracing', views: 2760, completions: 1980, engagementRate: 71.7 },
  { id: '7', title: 'Phonics Fun', type: 'alphabet', views: 2543, completions: 1876, engagementRate: 73.8 },
  { id: '8', title: 'Math Puzzle', type: 'quiz', views: 2310, completions: 1654, engagementRate: 71.6 },
  { id: '9', title: 'Dance Along', type: 'video', views: 2105, completions: 1430, engagementRate: 67.9 },
  { id: '10', title: 'Memory Game', type: 'game', views: 1987, completions: 1321, engagementRate: 66.5 },
];

const MOCK_TYPE_DIST: TypeDistribution[] = [
  { name: 'Story', value: 45 },
  { name: 'Quiz', value: 32 },
  { name: 'Song', value: 28 },
  { name: 'Game', value: 24 },
  { name: 'Video', value: 18 },
  { name: 'Tracing', value: 15 },
  { name: 'Coloring', value: 12 },
];

const MOCK_SKILLS: SkillCoverage[] = [
  { skill: 'Letter Recognition', '2-3': 8, '3-4': 14, '4-5': 12, '5-6': 6 },
  { skill: 'Number Sense', '2-3': 6, '3-4': 10, '4-5': 15, '5-6': 9 },
  { skill: 'Fine Motor', '2-3': 12, '3-4': 8, '4-5': 6, '5-6': 3 },
  { skill: 'Listening', '2-3': 10, '3-4': 12, '4-5': 8, '5-6': 5 },
  { skill: 'Creativity', '2-3': 5, '3-4': 9, '4-5': 11, '5-6': 7 },
  { skill: 'Problem Solving', '2-3': 3, '3-4': 7, '4-5': 13, '5-6': 10 },
];

const AGE_GROUPS = ['2-3', '3-4', '4-5', '5-6'];

/* ─── Constants ─── */

const DATE_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

/* ─── Component ─── */

export function AnalyticsDashboardPage() {
  const [range, setRange] = useState('7d');

  const { data: dashboard, loading } = useQuery<DashboardResponse>(
    () => api.get('/analytics/dashboard', { range }),
    [range],
  );

  const { data: topData } = useQuery<TopContentResponse>(
    () => api.get('/analytics/top', { range }),
    [range],
  );

  const stats = dashboard?.stats ?? MOCK_STATS;
  const trend = dashboard?.trend ?? MOCK_TREND;
  const typeDist = dashboard?.typeDistribution ?? MOCK_TYPE_DIST;
  const skills = dashboard?.skillCoverage ?? MOCK_SKILLS;
  const topContent = topData?.data ?? MOCK_TOP;

  const columns = useMemo(
    () => [
      {
        key: 'title',
        header: 'Title',
        render: (item: TopContentItem) => (
          <span className="font-medium text-text">{item.title}</span>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        render: (item: TopContentItem) => (
          <span className="text-sm text-text-secondary capitalize">{item.type}</span>
        ),
      },
      {
        key: 'views',
        header: 'Views',
        render: (item: TopContentItem) => (
          <span className="text-sm text-text">{item.views.toLocaleString()}</span>
        ),
      },
      {
        key: 'completions',
        header: 'Completions',
        render: (item: TopContentItem) => (
          <span className="text-sm text-text">{item.completions.toLocaleString()}</span>
        ),
      },
      {
        key: 'engagementRate',
        header: 'Engagement',
        render: (item: TopContentItem) => (
          <span className="text-sm text-text">{item.engagementRate}%</span>
        ),
      },
    ],
    [],
  );

  if (loading && !dashboard) {
    return <LoadingState message="Loading analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Analytics</h1>
          <p className="text-text-secondary mt-1">Content performance metrics and engagement data.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={DATE_RANGE_OPTIONS}
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="w-44"
          />
          <Button variant="secondary" onClick={() => window.open(`/api/analytics/export?range=${range}`)}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Views" value={stats.totalViews.toLocaleString()} change={stats.viewsChange} />
        <StatsCard title="Completions" value={stats.totalCompletions.toLocaleString()} change={stats.completionsChange} />
        <StatsCard title="Favorites" value={stats.totalFavorites.toLocaleString()} change={stats.favoritesChange} />
        <StatsCard title="Avg Engagement" value={`${stats.avgEngagement}%`} change={stats.engagementChange} />
      </div>

      {/* Trend Chart */}
      <Card title="Views & Completions Trend">
        <LineChart
          data={trend}
          lines={[
            { dataKey: 'views', color: '#3B82F6', label: 'Views' },
            { dataKey: 'completions', color: '#22C55E', label: 'Completions' },
          ]}
          height={320}
        />
      </Card>

      {/* Top Content + Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Top Content by Views" padding={false}>
            <DataTable
              columns={columns}
              data={topContent}
              emptyMessage="No content data available."
            />
          </Card>
        </div>
        <Card title="Content Type Distribution">
          <PieChart data={typeDist} height={280} />
        </Card>
      </div>

      {/* Educational Coverage */}
      <Card title="Educational Coverage">
        <p className="text-sm text-text-secondary mb-4">
          Content items per skill and age group. Darker shading indicates higher coverage.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Skill</th>
                {AGE_GROUPS.map((ag) => (
                  <th key={ag} className="px-4 py-3 text-center font-medium text-text-secondary">
                    {ag} yrs
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {skills.map((row) => (
                <tr key={row.skill}>
                  <td className="px-4 py-3 font-medium text-text">{row.skill}</td>
                  {AGE_GROUPS.map((ag) => {
                    const count = Number(row[ag] ?? 0);
                    const intensity = Math.min(count / 15, 1);
                    return (
                      <td key={ag} className="px-4 py-3 text-center">
                        <span
                          className="inline-flex items-center justify-center w-10 h-8 rounded text-xs font-semibold"
                          style={{
                            backgroundColor: `rgba(59, 130, 246, ${0.1 + intensity * 0.5})`,
                            color: intensity > 0.5 ? '#FFF' : '#3B82F6',
                          }}
                        >
                          {count}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
