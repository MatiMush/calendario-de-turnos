import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Calendar } from '@/components/Calendar'
import { ShiftDialog } from '@/components/ShiftDialog'
import { ShiftSummary } from '@/components/ShiftSummary'
import { PeriodComparison } from '@/components/PeriodComparison'
import { ShiftType, ShiftData } from '@/types/shift'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { generateShiftPDF } from '@/lib/pdf-generator'
import { Button } from '@/components/ui/button'
import { ChartBar, CalendarBlank } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

type View = 'calendar' | 'stats'

function App() {
  const [shifts, setShifts] = useKV<ShiftData>('work-shifts', {})
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<View>('calendar')

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setDialogOpen(true)
  }

  const handleClearSelection = () => {
    setSelectedDate(null)
  }

  const handleSelectShift = (type: ShiftType, note?: string) => {
    if (!selectedDate) return

    setShifts((currentShifts) => ({
      ...currentShifts,
      [selectedDate]: {
        date: selectedDate,
        type,
        note,
      },
    }))

    const shiftNames = {
      morning: 'Turno Mañana',
      night: 'Turno Noche',
      rest: 'Día de Descanso',
    }

    toast.success(`${shiftNames[type]} agregado`)
  }

  const handleDeleteShift = () => {
    if (!selectedDate) return

    setShifts((currentShifts) => {
      const newShifts = { ...currentShifts }
      delete newShifts[selectedDate]
      return newShifts
    })

    toast.success('Turno eliminado')
  }

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleExportPDF = () => {
    try {
      generateShiftPDF(shifts || {}, currentDate)
      toast.success('PDF generado exitosamente')
    } catch (error) {
      console.error('Error al exportar PDF:', error)
      toast.error('Error al generar el PDF. Por favor, intenta de nuevo.')
    }
  }

  return (
    <div 
      className="min-h-screen bg-background relative overflow-hidden"
      onClick={handleClearSelection}
    >
      <div 
        className="fixed inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, oklch(0.72 0.18 320) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, oklch(0.45 0.26 285) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, oklch(0.68 0.24 35) 0%, transparent 50%)
          `,
        }}
      />

      <div 
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 40px,
            currentColor 40px,
            currentColor 41px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 40px,
            currentColor 40px,
            currentColor 41px
          )`,
        }}
      />

      <div className="relative min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {currentView === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: -50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ 
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="flex-1 p-4 md:p-8 flex flex-col justify-center"
            >
              <div className="max-w-3xl mx-auto w-full">
                <div className="text-center mb-8 md:mb-12">
                  <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-5xl md:text-7xl font-bold text-primary mb-3 tracking-tight"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    Mi Calendario
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-muted-foreground text-lg md:text-xl font-medium tracking-wide"
                  >
                    Organiza tus turnos de trabajo
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <Calendar
                    currentDate={currentDate}
                    shifts={shifts || {}}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    onPreviousMonth={handlePreviousMonth}
                    onNextMonth={handleNextMonth}
                  />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="flex justify-center mt-10"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentView('stats')
                      }}
                      size="lg"
                      className="gap-3 text-base font-semibold px-10 py-7 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgba(108,66,220,0.35)] transition-all duration-500 bg-gradient-to-br from-[oklch(0.55_0.28_285)] via-[oklch(0.60_0.22_300)] to-[oklch(0.48_0.30_270)] hover:from-[oklch(0.60_0.30_285)] hover:via-[oklch(0.65_0.24_300)] hover:to-[oklch(0.53_0.32_270)] text-white border-0 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <ChartBar size={26} weight="duotone" className="relative z-10" />
                      <span className="relative z-10">Ver Estadísticas</span>
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {currentView === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ 
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="flex-1 p-4 md:p-8 flex flex-col justify-center"
            >
              <div className="max-w-3xl mx-auto w-full space-y-8">
                <div className="text-center">
                  <motion.h2 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-4xl md:text-6xl font-bold text-primary mb-3 tracking-tight"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    Estadísticas
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-muted-foreground text-lg font-medium tracking-wide"
                  >
                    Resumen y comparativa de períodos
                  </motion.p>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="flex justify-center"
                >
                  <PeriodComparison
                    shifts={shifts || {}}
                    currentDate={currentDate}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <ShiftSummary
                    shifts={shifts || {}}
                    currentDate={currentDate}
                    onExportPDF={handleExportPDF}
                  />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="flex justify-center mt-10"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentView('calendar')
                      }}
                      size="lg"
                      variant="outline"
                      className="gap-2 text-base px-8 py-6 border-2 hover:bg-secondary/20 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <CalendarBlank size={24} weight="duotone" />
                      Volver al Calendario
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ShiftDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          selectedDate={selectedDate}
          currentShift={selectedDate && shifts ? shifts[selectedDate] || null : null}
          onSelectShift={handleSelectShift}
          onDeleteShift={handleDeleteShift}
        />

        <Toaster position="bottom-center" />
      </div>
    </div>
  )
}

export default App