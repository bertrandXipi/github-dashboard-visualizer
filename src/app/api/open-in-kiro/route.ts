import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const PROJECTS_BASE_DIR = '/Users/bertrand/Sites'
const MAX_DEPTH = 3

// Recursively find a folder by name
function findProject(basePath: string, projectName: string, depth: number = 0): string | null {
  if (depth > MAX_DEPTH) return null
  
  try {
    const entries = readdirSync(basePath)
    
    for (const entry of entries) {
      // Skip hidden folders and node_modules
      if (entry.startsWith('.') || entry === 'node_modules') continue
      
      const fullPath = join(basePath, entry)
      
      try {
        const stat = statSync(fullPath)
        if (!stat.isDirectory()) continue
        
        // Found it!
        if (entry === projectName) {
          return fullPath
        }
        
        // Search deeper
        const found = findProject(fullPath, projectName, depth + 1)
        if (found) return found
      } catch {
        // Skip inaccessible folders
      }
    }
  } catch {
    // Skip inaccessible folders
  }
  
  return null
}

export async function POST(request: NextRequest) {
  try {
    const { projectName } = await request.json()
    
    if (!projectName) {
      return NextResponse.json({ error: 'Missing projectName' }, { status: 400 })
    }
    
    // First try direct path
    let projectPath = join(PROJECTS_BASE_DIR, projectName)
    
    if (!existsSync(projectPath)) {
      // Search recursively
      const found = findProject(PROJECTS_BASE_DIR, projectName)
      if (found) {
        projectPath = found
      } else {
        return NextResponse.json({ 
          error: 'Project not found',
          message: `Le projet "${projectName}" n'a pas été trouvé dans ${PROJECTS_BASE_DIR}`
        }, { status: 404 })
      }
    }
    
    console.log('Opening in Kiro:', projectPath)
    
    // Open in Kiro
    exec(`kiro "${projectPath}"`, (error) => {
      if (error) {
        console.error('Error opening Kiro:', error)
      }
    })
    
    return NextResponse.json({ success: true, path: projectPath })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
