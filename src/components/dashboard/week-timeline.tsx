'use client'

import { useState } from 'react'
import { useActivityStore, useSettingsStore } from '@/lib/stores'
import { WeekCard } from './week-card'
import { WeekDetailModal } from './week-detail-modal'
import type { WeekActivity } from '@/types'

export function WeekTimeline() {
  const { weeksActivity } = useActivityStore()
  const { weeksToDisplay } = useSettingsStore()
  const [selectedWeek, setSelectedWeek] = useState<WeekActivity | null>(null)
  
  // Sort weeks by date descending
  const sortedWeeks = Object.values(weeksActivity)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, weeksToDisplay)
  
  if (sortedWeeks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Aucune activité à afficher
        </p>
      </div>
    )
  }
  
  return (
    <>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Timeline des semaines</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedWeeks.map((week) => (
            <WeekCard
              key={week.weekId}
              weekActivity={week}
              onDetailsClick={() => setSelectedWeek(week)}
            />
          ))}
        </div>
      </div>
      
      <WeekDetailModal
        week={selectedWeek}
        open={!!selectedWeek}
        onClose={() => setSelectedWeek(null)}
      />
    </>
  )
}
