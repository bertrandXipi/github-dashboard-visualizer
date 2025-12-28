/**
 * Report Generation Utilities
 */

import { format, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Commit, Repository } from '@/types'

interface ReportData {
  commits: Commit[]
  repositories: Repository[]
  startDate: Date
  endDate: Date
}

/**
 * Generate a weekly report in Markdown format
 */
export function generateWeeklyReport(data: ReportData): string {
  const { commits, repositories, startDate, endDate } = data
  
  // Filter commits for the period
  const periodCommits = commits.filter(c => {
    const date = new Date(c.date)
    return isWithinInterval(date, { start: startDate, end: endDate })
  })
  
  // Group by project
  const byProject = new Map<string, Commit[]>()
  periodCommits.forEach(commit => {
    const existing = byProject.get(commit.repoName) || []
    existing.push(commit)
    byProject.set(commit.repoName, existing)
  })
  
  // Group by day
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  const byDay = days.map(day => ({
    date: day,
    commits: periodCommits.filter(c => 
      format(new Date(c.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    )
  }))
  
  // Build markdown
  let md = `# Rapport Hebdomadaire\n\n`
  md += `**Période:** ${format(startDate, 'd MMMM', { locale: fr })} - ${format(endDate, 'd MMMM yyyy', { locale: fr })}\n\n`
  
  // Overview
  md += `## 📊 Vue d'ensemble\n\n`
  md += `- **Total commits:** ${periodCommits.length}\n`
  md += `- **Projets actifs:** ${byProject.size}\n`
  md += `- **Jours actifs:** ${byDay.filter(d => d.commits.length > 0).length}/7\n\n`
  
  // Projects
  if (byProject.size > 0) {
    md += `## 📁 Projets\n\n`
    const sortedProjects = Array.from(byProject.entries())
      .sort((a, b) => b[1].length - a[1].length)
    
    for (const [projectName, projectCommits] of sortedProjects) {
      const repo = repositories.find(r => r.name === projectName)
      md += `### ${projectName}\n\n`
      if (repo?.description) {
        md += `> ${repo.description}\n\n`
      }
      md += `- ${projectCommits.length} commit${projectCommits.length > 1 ? 's' : ''}\n`
      md += `- Dernière activité: ${format(new Date(projectCommits[0].date), 'd MMM à HH:mm', { locale: fr })}\n\n`
      
      md += `**Commits:**\n`
      projectCommits.slice(0, 10).forEach(commit => {
        const firstLine = commit.message.split('\n')[0]
        md += `- ${firstLine}\n`
      })
      if (projectCommits.length > 10) {
        md += `- _+${projectCommits.length - 10} autres commits_\n`
      }
      md += `\n`
    }
  }
  
  // Daily breakdown
  md += `## 📅 Détail par jour\n\n`
  byDay.forEach(({ date, commits: dayCommits }) => {
    const dayName = format(date, 'EEEE d MMMM', { locale: fr })
    if (dayCommits.length > 0) {
      md += `### ${dayName}\n\n`
      md += `${dayCommits.length} commit${dayCommits.length > 1 ? 's' : ''}\n\n`
      dayCommits.forEach(commit => {
        const time = format(new Date(commit.date), 'HH:mm')
        const firstLine = commit.message.split('\n')[0]
        md += `- \`${time}\` **${commit.repoName}**: ${firstLine}\n`
      })
      md += `\n`
    } else {
      md += `### ${dayName}\n\n_Pas d'activité_\n\n`
    }
  })
  
  // Footer
  md += `---\n\n`
  md += `_Rapport généré le ${format(new Date(), 'd MMMM yyyy à HH:mm', { locale: fr })}_\n`
  
  return md
}

/**
 * Generate a monthly report in Markdown format
 */
export function generateMonthlyReport(data: ReportData): string {
  const { commits, repositories, startDate, endDate } = data
  
  // Filter commits for the period
  const periodCommits = commits.filter(c => {
    const date = new Date(c.date)
    return isWithinInterval(date, { start: startDate, end: endDate })
  })
  
  // Group by project
  const byProject = new Map<string, Commit[]>()
  periodCommits.forEach(commit => {
    const existing = byProject.get(commit.repoName) || []
    existing.push(commit)
    byProject.set(commit.repoName, existing)
  })
  
  // Group by week
  const weeks: { start: Date; end: Date; commits: Commit[] }[] = []
  let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 1 })
  
  while (currentWeekStart <= endDate) {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })
    const weekCommits = periodCommits.filter(c => {
      const date = new Date(c.date)
      return isWithinInterval(date, { start: currentWeekStart, end: weekEnd })
    })
    weeks.push({ start: currentWeekStart, end: weekEnd, commits: weekCommits })
    currentWeekStart = new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
  }
  
  // Build markdown
  let md = `# Rapport Mensuel\n\n`
  md += `**Période:** ${format(startDate, 'MMMM yyyy', { locale: fr })}\n\n`
  
  // Overview
  md += `## 📊 Vue d'ensemble\n\n`
  md += `- **Total commits:** ${periodCommits.length}\n`
  md += `- **Projets actifs:** ${byProject.size}\n`
  md += `- **Moyenne par semaine:** ${Math.round(periodCommits.length / weeks.length)}\n\n`
  
  // Top projects
  md += `## 🏆 Top Projets\n\n`
  const sortedProjects = Array.from(byProject.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5)
  
  sortedProjects.forEach(([name, projectCommits], index) => {
    const repo = repositories.find(r => r.name === name)
    const percentage = Math.round((projectCommits.length / periodCommits.length) * 100)
    md += `${index + 1}. **${name}** - ${projectCommits.length} commits (${percentage}%)\n`
  })
  md += `\n`
  
  // Weekly breakdown
  md += `## 📅 Par semaine\n\n`
  weeks.forEach(({ start, end, commits: weekCommits }) => {
    const weekLabel = `${format(start, 'd MMM', { locale: fr })} - ${format(end, 'd MMM', { locale: fr })}`
    md += `### ${weekLabel}\n\n`
    md += `${weekCommits.length} commit${weekCommits.length > 1 ? 's' : ''}\n\n`
    
    // Group by project for this week
    const weekByProject = new Map<string, number>()
    weekCommits.forEach(c => {
      weekByProject.set(c.repoName, (weekByProject.get(c.repoName) || 0) + 1)
    })
    
    Array.from(weekByProject.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        md += `- ${name}: ${count} commit${count > 1 ? 's' : ''}\n`
      })
    md += `\n`
  })
  
  // All projects
  md += `## 📁 Tous les projets\n\n`
  Array.from(byProject.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([name, projectCommits]) => {
      const repoInfo = repositories.find(r => r.name === name)
      md += `### ${name}\n\n`
      if (repoInfo?.description) {
        md += `> ${repoInfo.description}\n\n`
      }
      md += `- ${projectCommits.length} commits\n`
      if (repoInfo?.language) {
        md += `- Langage: ${repoInfo.language}\n`
      }
      md += `\n`
    })
  
  // Footer
  md += `---\n\n`
  md += `_Rapport généré le ${format(new Date(), 'd MMMM yyyy à HH:mm', { locale: fr })}_\n`
  
  return md
}

/**
 * Download a report as a markdown file
 */
export function downloadReport(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Copy report to clipboard
 */
export async function copyReportToClipboard(content: string): Promise<void> {
  await navigator.clipboard.writeText(content)
}
