'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FolderGit2, 
  Search, 
  Settings, 
  LogOut,
  Github
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SheetClose } from '@/components/ui/sheet'
import { useAuthStore } from '@/lib/stores'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Mes Projets', icon: FolderGit2 },
  { href: '/search', label: 'Recherche', icon: Search },
  { href: '/settings', label: 'Paramètres', icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()
  const { clearCredentials } = useAuthStore()
  
  const handleLogout = () => {
    clearCredentials()
    window.location.href = '/auth'
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Github className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold">Activity Tracker</span>
        </Link>
      </div>
      
      <Separator />
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <SheetClose asChild key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </SheetClose>
          )
        })}
      </nav>
      
      {/* Logout */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Se déconnecter
        </Button>
      </div>
    </div>
  )
}
