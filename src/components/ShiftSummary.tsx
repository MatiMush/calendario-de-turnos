import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Leaf, FilePdf, Clock } from '@phosphor-icons/react'
import { ShiftType, ShiftData } from '@/types/shift'
import { motion } from 'framer-motion'

interface ShiftSummaryProps {
  shifts: ShiftData
  currentDate: Date
  onExportPDF: () => void
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const HOURS_PER_SHIFT = {
  morning: 8,
  night: 9,
  rest: 0,
}

export function ShiftSummary({ shifts, currentDate, onExportPDF }: ShiftSummaryProps) {
  const calculatePeriodStats = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const startDate = new Date(year, month, 20)
    const endDate = new Date(year, month + 1, 20)
    
    const stats = {
      morning: 0,
      night: 0,
      rest: 0,
      morningHours: 0,
      nightHours: 0,
      totalHours: 0,
      startMonth: MONTHS[startDate.getMonth()],
      endMonth: MONTHS[endDate.getMonth()],
      startYear: startDate.getFullYear(),
      endYear: endDate.getFullYear(),
    }

    const currentDateIter = new Date(startDate)
    
    while (currentDateIter <= endDate) {
      const dateStr = currentDateIter.toISOString().split('T')[0]
      const shift = shifts[dateStr]
      
      if (shift?.type === 'morning') {
        stats.morning++
        stats.morningHours += HOURS_PER_SHIFT.morning
      } else if (shift?.type === 'night') {
        stats.night++
        stats.nightHours += HOURS_PER_SHIFT.night
      } else if (shift?.type === 'rest') {
        stats.rest++
      }
      
      currentDateIter.setDate(currentDateIter.getDate() + 1)
    }
    
    stats.totalHours = stats.morningHours + stats.nightHours
    
    return stats
  }

  const stats = calculatePeriodStats()

  const shiftItems = [
    {
      type: 'morning',
      label: 'Turnos Mañana',
      count: stats.morning,
      hours: stats.morningHours,
      icon: Sun,
      color: 'text-[var(--morning-shift)]',
      bgColor: 'bg-[var(--morning-shift)]/20',
    },
    {
      type: 'night',
      label: 'Turnos Noche',
      count: stats.night,
      hours: stats.nightHours,
      icon: Moon,
      color: 'text-[var(--night-shift)]',
      bgColor: 'bg-[var(--night-shift)]/20',
    },
    {
      type: 'rest',
      label: 'Días de Descanso',
      count: stats.rest,
      hours: 0,
      icon: Leaf,
      color: 'text-[var(--rest-day)]',
      bgColor: 'bg-[var(--rest-day)]/20',
    },
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl overflow-hidden bg-card/80 backdrop-blur-sm border-2 border-border mt-6">
      <div className="bg-primary/10 border-b-2 border-border p-4 md:p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-primary" style={{ fontFamily: 'Bungee, sans-serif' }}>
              Resumen del Período
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Del 20 de {stats.startMonth} al 20 de {stats.endMonth}
            </p>
          </div>
          
          <Button
            onClick={onExportPDF}
            className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-md"
          >
            <FilePdf weight="fill" className="w-5 h-5" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shiftItems.map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.type}
                whileHover={{ scale: 1.02 }}
                className={`${item.bgColor} rounded-lg p-4 border-2 border-border`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${item.color} p-3 rounded-lg bg-background/50`}>
                    <Icon weight="fill" className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-foreground">
                      {item.count}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground font-medium">
                      {item.label}
                    </p>
                    {item.hours > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.hours} horas
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg border-2 border-primary/30"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/20">
                <Clock weight="fill" className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-foreground">
                  {stats.totalHours}
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  Total de Horas Trabajadas
                </p>
              </div>
            </div>
          </motion.div>

          <div className="p-5 bg-secondary/30 rounded-lg border-2 border-border flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Total de días en el período
              </p>
              <p className="text-3xl md:text-4xl font-bold text-foreground">
                {stats.morning + stats.night + stats.rest}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock weight="bold" className="w-4 h-4 text-accent-foreground" />
            <p className="text-sm font-semibold text-accent-foreground">
              Desglose de Horas
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Turnos Mañana:</span>
              <span className="font-semibold text-foreground">{stats.morningHours}h ({HOURS_PER_SHIFT.morning}h/turno)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Turnos Noche:</span>
              <span className="font-semibold text-foreground">{stats.nightHours}h ({HOURS_PER_SHIFT.night}h/turno)</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
