import { supabase, type RepoSummary } from './client'

export async function getSummary(repoId: number): Promise<string | null> {
  const { data, error } = await supabase
    .from('repo_summaries')
    .select('summary')
    .eq('repo_id', repoId)
    .single()

  if (error || !data) return null
  return data.summary
}

export async function getAllSummaries(owner: string): Promise<Record<number, string>> {
  const { data, error } = await supabase
    .from('repo_summaries')
    .select('repo_id, summary')
    .eq('owner', owner)

  if (error || !data) return {}
  
  return data.reduce((acc, row) => {
    acc[row.repo_id] = row.summary
    return acc
  }, {} as Record<number, string>)
}

export async function saveSummary(
  repoId: number, 
  repoName: string, 
  owner: string, 
  summary: string
): Promise<boolean> {
  const { error } = await supabase
    .from('repo_summaries')
    .upsert({
      repo_id: repoId,
      repo_name: repoName,
      owner,
      summary,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'repo_id'
    })

  return !error
}

export async function deleteSummary(repoId: number): Promise<boolean> {
  const { error } = await supabase
    .from('repo_summaries')
    .delete()
    .eq('repo_id', repoId)

  return !error
}
