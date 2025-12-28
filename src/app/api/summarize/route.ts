import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { repoName, owner, readme, description, language } = await request.json()
    
    if (!repoName || !owner) {
      return NextResponse.json({ error: 'Missing repoName or owner' }, { status: 400 })
    }
    
    // Build context for Gemini
    const context = `
Projet GitHub: ${owner}/${repoName}
Langage principal: ${language || 'Non spécifié'}
Description GitHub: ${description || 'Aucune'}

README:
${readme || 'Pas de README disponible'}
`.trim()

    const prompt = `Analyse ce projet GitHub et génère un résumé concis en français (2-3 phrases max).
Le résumé doit expliquer:
- Ce que fait le projet (son but principal)
- Les technologies/frameworks utilisés si pertinent

Réponds UNIQUEMENT avec le résumé, sans introduction ni formatage markdown.

${context}`

    // Call gemini CLI
    const escapedPrompt = prompt.replace(/'/g, "'\\''")
    const { stdout, stderr } = await execAsync(`echo '${escapedPrompt}' | gemini`, {
      timeout: 30000,
      maxBuffer: 1024 * 1024,
    })
    
    if (stderr && !stdout) {
      console.error('Gemini CLI error:', stderr)
      return NextResponse.json({ error: 'Gemini CLI error' }, { status: 500 })
    }
    
    const summary = stdout.trim()
    
    return NextResponse.json({ summary })
  } catch (error: any) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
