import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface BarChartDatum {
  name: string;
  value: number;
  fill?: string;
}

interface BarChartProps {
  data: BarChartDatum[];
  height?: number;
  color?: string;
}

export function BarChart({ data, height = 300, color = '#3B82F6' }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#57606A', fontSize: 12 }}
          axisLine={{ stroke: '#E1E4E8' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#8B949E', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFF',
            border: '1px solid #E1E4E8',
            borderRadius: 8,
            fontSize: 13,
          }}
        />
        <Bar
          dataKey="value"
          fill={color}
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      </RBarChart>
    </ResponsiveContainer>
  );
}
