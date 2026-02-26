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
  morning: 12,
  night: 12,
  nightHoursNocturnal: 9,
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
      nightHoursNocturnal: 0,
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
        const hours = shift.customHours?.hours || HOURS_PER_SHIFT.morning
        stats.morningHours += hours
      } else if (shift?.type === 'night') {
        stats.night++
        const hours = shift.customHours?.hours || HOURS_PER_SHIFT.night
        stats.nightHours += hours
        const nightHoursNocturnal = hours === 8 ? 6 : HOURS_PER_SHIFT.nightHoursNocturnal
        stats.nightHoursNocturnal += nightHoursNocturnal
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
    <Card className="w-full shadow-2xl overflow-hidden bg-card/95 backdrop-blur-md border border-border/50">
      <div className="relative bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/10 border-b border-border/50 p-5 md:p-6">
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-primary tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              Resumen del Período
            </h3>
            <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium">
              Del 20 de {stats.startMonth} al 20 de {stats.endMonth}
            </p>
          </div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onExportPDF}
              size="sm"
              className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <FilePdf weight="fill" className="w-5 h-5" />
              <span className="hidden sm:inline font-semibold">Exportar PDF</span>
              <span className="sm:hidden font-semibold">PDF</span>
            </Button>
          </motion.div>
        </div>
        
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 70% 50%, currentColor 0%, transparent 60%)`,
          }}
        />
      </div>

      <div className="p-5 md:p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {shiftItems.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className={`${item.bgColor} rounded-xl p-4 border border-border/50 shadow-md hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-center gap-4">
                  <div className={`${item.color} p-3 rounded-xl bg-background/60 shadow-md`}>
                    <Icon weight="fill" className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <p className="text-2xl md:text-3xl font-bold text-foreground">
                        {item.count}
                      </p>
                      {item.hours > 0 && (
                        <p className="text-sm font-semibold text-muted-foreground">
                          {item.hours}h
                        </p>
                      )}
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground font-semibold mt-0.5">
                      {item.label}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          className="p-5 bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/10 rounded-xl border border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/25 shadow-md">
              <Clock weight="fill" className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-4xl md:text-5xl font-bold text-foreground">
                {stats.totalHours}h
              </p>
              <p className="text-base md:text-lg text-muted-foreground font-semibold mt-0.5">
                Total de Horas Trabajadas
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 bg-accent/15 rounded-xl border border-accent/30 shadow-md"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock weight="bold" className="w-5 h-5 text-accent-foreground" />
            <p className="text-base font-bold text-accent-foreground">
              Desglose de Horas
            </p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Turnos Mañana:</span>
              <span className="font-bold text-foreground text-base">{stats.morningHours}h</span>
            </div>
            <div className="h-px bg-border/50" />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Turnos Noche:</span>
              <span className="font-bold text-foreground text-base">{stats.nightHours}h</span>
            </div>
            <div className="h-px bg-border/50" />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Horas Nocturnas:</span>
              <span className="font-bold text-foreground text-base">{stats.nightHoursNocturnal}h</span>
            </div>
          </div>
        </motion.div>
      </div>
    </Card>
  )
}
