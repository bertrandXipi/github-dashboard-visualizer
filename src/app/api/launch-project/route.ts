import { NextRequest, NextResponse } from 'next/server'
import { spawn, exec } from 'child_process'
import { promisify } from 'util'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const execAsync = promisify(exec)

// Base directory where all projects are located
const PROJECTS_BASE_DIR = '/Users/bertrand/Sites'

// Track running projects
const runningProjects: Map<string, { port: number; pid: number }> = new Map()

async function findAvailablePort(startPort: number = 3001): Promise<number> {
  for (let port = startPort; port < startPort + 100; port++) {
    try {
      const { stdout } = await execAsync(`lsof -i :${port}`)
      // Port is in use, try next
    } catch {
      // Port is available
      return port
    }
  }
  throw new Error('No available port found')
}

function detectProjectType(projectPath: string): { type: string; command: string; port?: number } {
  // Check for package.json (Node.js project)
  const packageJsonPath = join(projectPath, 'package.json')
  if (existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      const scripts = pkg.scripts || {}
      
      // Next.js
      if (pkg.dependencies?.next || pkg.devDependencies?.next) {
        return { type: 'nextjs', command: 'npm run dev' }
      }
      
      // Vite
      if (pkg.dependencies?.vite || pkg.devDependencies?.vite) {
        return { type: 'vite', command: 'npm run dev' }
      }
      
      // React (CRA)
      if (scripts.start && (pkg.dependencies?.['react-scripts'] || pkg.devDependencies?.['react-scripts'])) {
        return { type: 'cra', command: 'npm start', port: 3000 }
      }
      
      // Generic npm project with dev script
      if (scripts.dev) {
        return { type: 'npm', command: 'npm run dev' }
      }
      
      // Generic npm project with start script
      if (scripts.start) {
        return { type: 'npm', command: 'npm start' }
      }
    } catch {}
  }
  
  // Check for composer.json (PHP project)
  if (existsSync(join(projectPath, 'composer.json'))) {
    // Laravel
    if (existsSync(join(projectPath, 'artisan'))) {
      return { type: 'laravel', command: 'php artisan serve' }
    }
    return { type: 'php', command: 'php -S localhost:8000 -t public' }
  }
  
  // Check for Python
  if (existsSync(join(projectPath, 'manage.py'))) {
    return { type: 'django', command: 'python manage.py runserver' }
  }
  
  if (existsSync(join(projectPath, 'requirements.txt')) || existsSync(join(projectPath, 'app.py'))) {
    return { type: 'flask', command: 'python app.py' }
  }
  
  // Static HTML
  if (existsSync(join(projectPath, 'index.html'))) {
    return { type: 'static', command: 'npx serve' }
  }
  
  return { type: 'unknown', command: '' }
}

export async function POST(request: NextRequest) {
  try {
    const { projectName, action } = await request.json()
    
    if (!projectName) {
      return NextResponse.json({ error: 'Missing projectName' }, { status: 400 })
    }
    
    const projectPath = join(PROJECTS_BASE_DIR, projectName)
    
    // Check if project exists locally
    if (!existsSync(projectPath)) {
      return NextResponse.json({ 
        error: 'Project not found locally',
        message: `Le projet "${projectName}" n'existe pas dans ${PROJECTS_BASE_DIR}`
      }, { status: 404 })
    }
    
    // Stop project
    if (action === 'stop') {
      const running = runningProjects.get(projectName)
      if (running) {
        try {
          process.kill(running.pid)
        } catch {}
        runningProjects.delete(projectName)
        return NextResponse.json({ success: true, message: 'Project stopped' })
      }
      return NextResponse.json({ success: true, message: 'Project was not running' })
    }
    
    // Check if already running
    const existing = runningProjects.get(projectName)
    if (existing) {
      return NextResponse.json({ 
        success: true, 
        port: existing.port,
        url: `http://localhost:${existing.port}`,
        alreadyRunning: true
      })
    }
    
    // Detect project type
    const { type, command } = detectProjectType(projectPath)
    
    if (!command) {
      return NextResponse.json({ 
        error: 'Unknown project type',
        message: 'Impossible de déterminer comment lancer ce projet'
      }, { status: 400 })
    }
    
    // Find available port
    const port = await findAvailablePort(3001)
    
    // Build command with port
    let finalCommand = command
    if (type === 'nextjs' || type === 'vite') {
      finalCommand = `PORT=${port} ${command}`
    } else if (type === 'laravel') {
      finalCommand = `${command} --port=${port}`
    } else if (type === 'django') {
      finalCommand = `${command} ${port}`
    } else if (type === 'static') {
      finalCommand = `npx serve -p ${port}`
    }
    
    console.log(`Launching ${projectName} (${type}) on port ${port}: ${finalCommand}`)
    
    // Launch the project
    const child = spawn('sh', ['-c', finalCommand], {
      cwd: projectPath,
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, PORT: String(port) }
    })
    
    child.unref()
    
    runningProjects.set(projectName, { port, pid: child.pid! })
    
    // Wait a bit for the server to start
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return NextResponse.json({ 
      success: true, 
      port,
      url: `http://localhost:${port}`,
      type,
      command: finalCommand
    })
    
  } catch (error: any) {
    console.error('Error launching project:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to launch project' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return list of running projects
  const running = Array.from(runningProjects.entries()).map(([name, info]) => ({
    name,
    ...info,
    url: `http://localhost:${info.port}`
  }))
  
  return NextResponse.json({ running })
}
