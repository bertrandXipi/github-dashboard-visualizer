'use client'

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import { getDayName } from '@/lib/utils/date-helpers'

interface ActivityBarChartProps {
  data: number[] // 7 values for Mon-Sun
  height?: number
  showLabels?: boolean
}

export function ActivityBarChart({ 
  data, 
  height = 120,
  showLabels = true 
}: ActivityBarChartProps) {
  const chartData = data.map((commits, index) => ({
    day: getDayName(index, true),
    commits,
  }))
  
  const maxCommits = Math.max(...data, 1)
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        {showLabels && (
          <XAxis 
            dataKey="day" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          />
        )}
        <YAxis hide />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '12px',
          }}
          formatter={(value) => [`${value} commit${value !== 1 ? 's' : ''}`, '']}
          labelFormatter={(label) => label}
        />
        <Bar 
          dataKey="commits" 
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`}
              fill={entry.commits > 0 
                ? `hsl(var(--primary) / ${0.4 + (entry.commits / maxCommits) * 0.6})`
                : 'hsl(var(--muted))'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
