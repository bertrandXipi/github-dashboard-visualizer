'use client'

import { useState } from 'react'
import { RefreshCw, Menu, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useActivityStore, useAuthStore } from '@/lib/stores'
import { formatDate } from '@/lib/utils/date-helpers'
import { getInitials } from '@/lib/utils/formatters'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { MobileNav } from './mobile-nav'
import { ReportModal } from '@/components/dashboard'

interface HeaderProps {
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function Header({ onRefresh, isRefreshing }: HeaderProps) {
  const { userProfile, lastSync } = useActivityStore()
  const { username } = useAuthStore()
  const [reportOpen, setReportOpen] = useState(false)
  
  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <MobileNav />
            </SheetContent>
          </Sheet>
          
          {/* Last sync info */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            {lastSync && (
              <span>Dernière sync : {formatDate(lastSync, 'relative')}</span>
            )}
          </div>
          
          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Report button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReportOpen(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Rapport</span>
            </Button>
            
            {/* Refresh button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Rafraîchir</span>
            </Button>
            
            {/* User avatar */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userProfile?.avatarUrl} alt={username || ''} />
                <AvatarFallback>
                  {getInitials(username || 'U')}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium">
                {username}
              </span>
            </div>
          </div>
        </div>
      </header>
      
      <ReportModal open={reportOpen} onOpenChange={setReportOpen} />
    </>
  )
}
