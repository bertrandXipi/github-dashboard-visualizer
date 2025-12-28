import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { join } from 'path'

const execAsync = promisify(exec)
const PROJECTS_BASE_DIR = '/Users/bertrand/Sites'

export async function POST(request: NextRequest) {
  try {
    const { projectName, githubUrl } = await request.json()
    
    if (!projectName || !githubUrl) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }
    
    const projectPath = join(PROJECTS_BASE_DIR, projectName)
    
    console.log('Cloning:', githubUrl, 'to', projectPath)
    
    // Clone the repository
    await execAsync(`git clone "${githubUrl}" "${projectPath}"`, {
      timeout: 120000, // 2 minutes timeout
    })
    
    console.log('Clone complete, opening in Kiro')
    
    // Open in Kiro
    exec(`kiro "${projectPath}"`)
    
    return NextResponse.json({ success: true, path: projectPath })
  } catch (error: any) {
    console.error('Error cloning:', error)
    return NextResponse.json(
      { error: 'Clone failed', message: error.message },
      { status: 500 }
    )
  }
}
