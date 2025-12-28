'use client'

import { useMemo } from 'react'
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  getDay,
  subMonths,
  isSameDay
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { Commit } from '@/types'

interface HeatmapCalendarProps {
  commits: Commit[]
  months?: number
}

export function HeatmapCalendar({ commits, months = 3 }: HeatmapCalendarProps) {
  const { days, maxCommits } = useMemo(() => {
    const today = new Date()
    const startDate = startOfMonth(subMonths(today, months - 1))
    const endDate = endOfMonth(today)
    
    const allDays = eachDayOfInterval({ start: startDate, end: endDate })
    
    // Count commits per day
    const commitCounts = new Map<string, number>()
    commits.forEach(commit => {
      const dateKey = format(new Date(commit.date), 'yyyy-MM-dd')
      commitCounts.set(dateKey, (commitCounts.get(dateKey) || 0) + 1)
    })
    
    const days = allDays.map(date => ({
      date,
      count: commitCounts.get(format(date, 'yyyy-MM-dd')) || 0,
      isToday: isSameDay(date, today),
    }))
    
    const maxCommits = Math.max(...days.map(d => d.count), 1)
    
    return { days, maxCommits }
  }, [commits, months])
  
  const getIntensity = (count: number): string => {
    if (count === 0) return 'bg-muted'
    const ratio = count / maxCommits
    if (ratio <= 0.25) return 'bg-green-200 dark:bg-green-900'
    if (ratio <= 0.5) return 'bg-green-400 dark:bg-green-700'
    if (ratio <= 0.75) return 'bg-green-500 dark:bg-green-600'
    return 'bg-green-600 dark:bg-green-500'
  }
  
  // Group days by week
  const weeks = useMemo(() => {
    const result: typeof days[] = []
    let currentWeek: typeof days = []
    
    // Add empty cells for the first week
    const firstDayOfWeek = getDay(days[0].date)
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: new Date(0), count: -1, isToday: false })
    }
    
    days.forEach(day => {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        result.push(currentWeek)
        currentWeek = []
      }
    })
    
    // Add remaining days
    if (currentWeek.length > 0) {
      result.push(currentWeek)
    }
    
    return result
  }, [days])
  
  return (
    <div className="space-y-2">
      <div className="flex gap-0.5">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
          <div key={i} className="w-3 h-3 text-[8px] text-muted-foreground flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-0.5">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex gap-0.5">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={cn(
                  'w-3 h-3 rounded-sm',
                  day.count === -1 ? 'bg-transparent' : getIntensity(day.count),
                  day.isToday && 'ring-1 ring-primary'
                )}
                title={day.count >= 0 ? `${format(day.date, 'd MMM', { locale: fr })}: ${day.count} commit${day.count !== 1 ? 's' : ''}` : ''}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <span>Moins</span>
        <div className="w-2 h-2 rounded-sm bg-muted" />
        <div className="w-2 h-2 rounded-sm bg-green-200 dark:bg-green-900" />
        <div className="w-2 h-2 rounded-sm bg-green-400 dark:bg-green-700" />
        <div className="w-2 h-2 rounded-sm bg-green-600 dark:bg-green-500" />
        <span>Plus</span>
      </div>
    </div>
  )
}
