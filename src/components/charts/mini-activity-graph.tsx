'use client'

interface MiniActivityGraphProps {
  data: number[] // 7 values for Mon-Sun
  height?: number
}

export function MiniActivityGraph({ data, height = 32 }: MiniActivityGraphProps) {
  const maxValue = Math.max(...data, 1)
  
  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {data.map((value, index) => {
        const barHeight = value > 0 ? Math.max(4, (value / maxValue) * height) : 2
        return (
          <div
            key={index}
            className={`flex-1 rounded-sm transition-all ${
              value > 0 ? 'bg-primary' : 'bg-muted'
            }`}
            style={{ height: barHeight }}
            title={`${value} commit${value !== 1 ? 's' : ''}`}
          />
        )
      })}
    </div>
  )
}
