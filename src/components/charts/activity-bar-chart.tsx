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

// Custom tooltip component
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null
  
  const commits = payload[0].value
  
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-white font-medium text-sm">{label}</p>
      <p className="text-emerald-400 text-lg font-bold">
        {commits} commit{commits !== 1 ? 's' : ''}
      </p>
    </div>
  )
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
            tick={{ fontSize: 11, fill: '#9ca3af' }}
          />
        )}
        <YAxis hide />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
        />
        <Bar 
          dataKey="commits" 
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        >
          {chartData.map((entry, index) => {
            // GitHub green colors based on intensity
            let fill = '#1e293b' // empty/dark slate
            if (entry.commits > 0) {
              const intensity = entry.commits / maxCommits
              if (intensity > 0.75) fill = '#22c55e' // bright green
              else if (intensity > 0.5) fill = '#16a34a' // green
              else if (intensity > 0.25) fill = '#15803d' // darker green
              else fill = '#166534' // dark green
            }
            return (
              <Cell 
                key={`cell-${index}`}
                fill={fill}
              />
            )
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
