import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const configPath = join(process.cwd(), '.github-config.json')
    const content = await readFile(configPath, 'utf-8')
    const config = JSON.parse(content)
    return NextResponse.json(config)
  } catch {
    return NextResponse.json({ error: 'Config not found' }, { status: 404 })
  }
}
