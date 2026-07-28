import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  Tooltip,
  Legend,
} from 'recharts'
import type { ChartPoint } from '../data/useChartData'
import './TrendLineChart.css'

interface TrendLineChartProps {
  data: ChartPoint[]
}

function TrendLineChart({ data }: TrendLineChartProps) {
  return (
    <div className="trend-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 24, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="var(--gridline)" vertical={false} />
          <XAxis dataKey="label" stroke="var(--muted)" tick={{ fill: 'var(--text-secondary)' }} />
          <YAxis stroke="var(--muted)" tick={{ fill: 'var(--text-secondary)' }} />
          <Tooltip contentStyle={{ background: 'var(--surface-1)', borderColor: 'var(--gridline)' }} />
          <Legend />
          <Line
            type="monotone"
            dataKey="seriesA"
            name="Metric A"
            stroke="var(--series-a)"
            strokeWidth={2}
            strokeLinecap="round"
            dot={{ r: 4 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="seriesB"
            name="Metric B"
            stroke="var(--series-b)"
            strokeWidth={2}
            strokeLinecap="round"
            dot={{ r: 4 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TrendLineChart
