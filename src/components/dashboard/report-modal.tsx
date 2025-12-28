'use client'

import { useState, useMemo } from 'react'
import { Copy, Download, FileText, Check } from 'lucide-react'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useActivityStore } from '@/lib/stores'
import { 
  generateWeeklyReport, 
  generateMonthlyReport, 
  downloadReport,
  copyReportToClipboard 
} from '@/lib/utils/reports'
import { toast } from 'sonner'

interface ReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportModal({ open, onOpenChange }: ReportModalProps) {
  const { commits, repositories } = useActivityStore()
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly')
  const [copied, setCopied] = useState(false)
  
  const report = useMemo(() => {
    const now = new Date()
    
    if (reportType === 'weekly') {
      const startDate = startOfWeek(now, { weekStartsOn: 1 })
      const endDate = endOfWeek(now, { weekStartsOn: 1 })
      return generateWeeklyReport({ commits, repositories, startDate, endDate })
    } else {
      const startDate = startOfMonth(now)
      const endDate = endOfMonth(now)
      return generateMonthlyReport({ commits, repositories, startDate, endDate })
    }
  }, [commits, repositories, reportType])
  
  const handleCopy = async () => {
    await copyReportToClipboard(report)
    setCopied(true)
    toast.success('Rapport copié !')
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleDownload = () => {
    const filename = reportType === 'weekly' 
      ? `rapport-semaine-${new Date().toISOString().split('T')[0]}.md`
      : `rapport-mois-${new Date().toISOString().split('T')[0]}.md`
    downloadReport(report, filename)
    toast.success('Rapport téléchargé !')
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Générer un rapport
          </DialogTitle>
          <DialogDescription>
            Exporte ton activité en format Markdown
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={reportType} onValueChange={(v) => setReportType(v as any)} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Cette semaine</TabsTrigger>
            <TabsTrigger value="monthly">Ce mois</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-[400px] border rounded-md">
              <pre className="p-4 text-sm whitespace-pre-wrap font-mono">
                {report}
              </pre>
            </ScrollArea>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? 'Copié !' : 'Copier'}
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger .md
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
