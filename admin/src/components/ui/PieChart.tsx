import {
  PieChart as RPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface PieChartDatum {
  name: string;
  value: number;
  fill?: string;
}

interface PieChartProps {
  data: PieChartDatum[];
  height?: number;
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#3B82F6',
  '#22C55E',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#6366F1',
  '#EC4899',
];

export function PieChart({ data, height = 300, colors = DEFAULT_COLORS }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          strokeWidth={0}
        >
          {data.map((entry, i) => (
            <Cell
              key={entry.name}
              fill={entry.fill ?? colors[i % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFF',
            border: '1px solid #E1E4E8',
            borderRadius: 8,
            fontSize: 13,
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#57606A' }}
        />
      </RPieChart>
    </ResponsiveContainer>
  );
}
