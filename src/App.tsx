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

function App() {
  const [shifts, setShifts] = useKV<ShiftData>('work-shifts', {})
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

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
      className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20"
      onClick={handleClearSelection}
    >
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            currentColor 2px,
            currentColor 4px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            currentColor 2px,
            currentColor 4px
          )`,
        }}
      />

      <div className="relative min-h-screen flex flex-col lg:flex-row">
        <div className="lg:w-1/2 p-4 md:p-8 flex flex-col justify-center">
          <div className="max-w-2xl mx-auto w-full">
            <div className="text-center mb-6 md:mb-8">
              <h1 
                className="text-4xl md:text-5xl font-bold text-primary mb-2"
                style={{ fontFamily: 'Bungee, sans-serif' }}
              >
                Mi Calendario
              </h1>
              <p className="text-muted-foreground text-lg">
                Organiza tus turnos de trabajo
              </p>
            </div>

            <Calendar
              currentDate={currentDate}
              shifts={shifts || {}}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
            />
          </div>
        </div>

        <div className="lg:w-1/2 p-4 md:p-8 bg-secondary/10 border-t lg:border-t-0 lg:border-l-4 border-primary/20 flex flex-col justify-center">
          <div className="max-w-2xl mx-auto w-full space-y-6">
            <div className="text-center lg:text-left">
              <h2 
                className="text-3xl md:text-4xl font-bold text-primary mb-2"
                style={{ fontFamily: 'Bungee, sans-serif' }}
              >
                Estadísticas
              </h2>
              <p className="text-muted-foreground text-base">
                Resumen y comparativa de períodos
              </p>
            </div>

            <div className="flex justify-center lg:justify-start">
              <PeriodComparison
                shifts={shifts || {}}
                currentDate={currentDate}
              />
            </div>

            <ShiftSummary
              shifts={shifts || {}}
              currentDate={currentDate}
              onExportPDF={handleExportPDF}
            />
          </div>
        </div>

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