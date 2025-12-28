import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'

const GITHUB_API = 'https://api.github.com'

async function callGemini(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const gemini = spawn('gemini', [], {
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    
    let stdout = ''
    let stderr = ''
    
    gemini.stdout.on('data', (data) => {
      stdout += data.toString()
    })
    
    gemini.stderr.on('data', (data) => {
      stderr += data.toString()
    })
    
    gemini.on('close', (code) => {
      if (code === 0) {
        const lines = stdout.split('\n')
        const cleanOutput = lines
          .filter(line => !line.startsWith('[STARTUP]') && !line.startsWith('Loaded cached'))
          .join('\n')
          .trim()
        resolve(cleanOutput)
      } else {
        reject(new Error(stderr || `Gemini exited with code ${code}`))
      }
    })
    
    gemini.on('error', reject)
    
    gemini.stdin.write(prompt)
    gemini.stdin.end()
    
    setTimeout(() => {
      gemini.kill()
      reject(new Error('Gemini timeout'))
    }, 60000)
  })
}

async function fetchGitHub(endpoint: string, token?: string): Promise<any> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${GITHUB_API}${endpoint}`, { headers })
  if (!response.ok) return null
  return response.json()
}

async function fetchRawFile(owner: string, repo: string, path: string, token?: string): Promise<string | null> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.raw+json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, { headers })
  if (!response.ok) return null
  return response.text()
}

export async function POST(request: NextRequest) {
  try {
    const { repoName, owner, description, language, token } = await request.json()
    
    if (!repoName || !owner) {
      return NextResponse.json({ error: 'Missing repoName or owner' }, { status: 400 })
    }
    
    console.log('Fetching info for:', `${owner}/${repoName}`)
    
    // Fetch repo contents (file list)
    const contents = await fetchGitHub(`/repos/${owner}/${repoName}/contents`, token)
    const fileList = contents 
      ? contents.map((f: any) => `${f.type === 'dir' ? '📁' : '📄'} ${f.name}`).join('\n')
      : 'Impossible de récupérer la liste des fichiers'
    
    // Try to get README
    let readme = ''
    const readmeFile = contents?.find((f: any) => 
      f.name.toLowerCase().startsWith('readme')
    )
    if (readmeFile) {
      readme = await fetchRawFile(owner, repoName, readmeFile.name, token) || ''
    }
    
    // Try to get package.json for JS/TS projects
    let packageJson = ''
    if (contents?.some((f: any) => f.name === 'package.json')) {
      const pkg = await fetchRawFile(owner, repoName, 'package.json', token)
      if (pkg) {
        try {
          const parsed = JSON.parse(pkg)
          packageJson = `
Nom: ${parsed.name || 'N/A'}
Description: ${parsed.description || 'N/A'}
Scripts: ${Object.keys(parsed.scripts || {}).join(', ') || 'N/A'}
Dépendances principales: ${Object.keys(parsed.dependencies || {}).slice(0, 10).join(', ') || 'N/A'}`
        } catch {}
      }
    }
    
    // Try to get composer.json for PHP projects
    let composerJson = ''
    if (contents?.some((f: any) => f.name === 'composer.json')) {
      const composer = await fetchRawFile(owner, repoName, 'composer.json', token)
      if (composer) {
        try {
          const parsed = JSON.parse(composer)
          composerJson = `
Nom: ${parsed.name || 'N/A'}
Description: ${parsed.description || 'N/A'}
Dépendances: ${Object.keys(parsed.require || {}).slice(0, 10).join(', ') || 'N/A'}`
        } catch {}
      }
    }
    
    // Try to get pyproject.toml or setup.py info for Python
    let pythonInfo = ''
    if (contents?.some((f: any) => f.name === 'requirements.txt')) {
      const reqs = await fetchRawFile(owner, repoName, 'requirements.txt', token)
      if (reqs) {
        const deps = reqs.split('\n').filter(l => l.trim() && !l.startsWith('#')).slice(0, 10)
        pythonInfo = `Dépendances Python: ${deps.join(', ')}`
      }
    }

    const prompt = `Tu es un assistant qui analyse des projets GitHub pour en faire un résumé.

PROJET: ${owner}/${repoName}
LANGAGE: ${language || 'Non spécifié'}
DESCRIPTION GITHUB: ${description || 'Aucune'}

FICHIERS À LA RACINE:
${fileList}
${packageJson ? `\nPACKAGE.JSON:${packageJson}` : ''}
${composerJson ? `\nCOMPOSER.JSON:${composerJson}` : ''}
${pythonInfo ? `\n${pythonInfo}` : ''}
${readme ? `\nREADME (extrait):\n${readme.slice(0, 2500)}` : '\n(Pas de README)'}

TÂCHE: Génère un résumé en français (2-3 phrases) expliquant:
1. Ce que fait ce projet concrètement
2. Les technologies/frameworks utilisés

RÈGLES:
- Réponds UNIQUEMENT avec le résumé, sans introduction
- Si tu ne peux pas déterminer le but, décris ce que tu vois (type de projet, stack technique)
- Sois précis et concret`

    console.log('Calling Gemini for:', repoName)
    
    const summary = await callGemini(prompt)
    
    console.log('Gemini response for', repoName, ':', summary.slice(0, 100))
    
    return NextResponse.json({ summary })
  } catch (error: any) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
