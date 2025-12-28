import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

const PROJECTS_BASE_DIR = '/Users/bertrand/Sites'

export async function POST(request: NextRequest) {
  try {
    const { projectName } = await request.json()
    
    if (!projectName) {
      return NextResponse.json({ error: 'Missing projectName' }, { status: 400 })
    }
    
    const projectPath = join(PROJECTS_BASE_DIR, projectName)
    
    if (!existsSync(projectPath)) {
      return NextResponse.json({ 
        error: 'Project not found',
        message: `Le projet "${projectName}" n'existe pas dans ${PROJECTS_BASE_DIR}`
      }, { status: 404 })
    }
    
    // Open in Kiro
    exec(`kiro "${projectPath}"`, (error) => {
      if (error) {
        console.error('Error opening Kiro:', error)
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
