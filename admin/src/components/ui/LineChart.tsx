import {
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface LineConfig {
  dataKey: string;
  color: string;
  label?: string;
}

interface LineChartProps {
  data: Record<string, number | string>[];
  lines: LineConfig[];
  height?: number;
}

export function LineChart({ data, lines, height = 300 }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RLineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
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
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#57606A' }}
        />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.label ?? line.dataKey}
            stroke={line.color}
            strokeWidth={2}
            dot={{ r: 3, fill: line.color }}
            activeDot={{ r: 5 }}
          />
        ))}
      </RLineChart>
    </ResponsiveContainer>
  );
}
