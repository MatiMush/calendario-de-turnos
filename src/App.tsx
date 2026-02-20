import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Calendar } from '@/components/Calendar'
import { ShiftDialog } from '@/components/ShiftDialog'
import { ShiftSummary } from '@/components/ShiftSummary'
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

  const handleSelectShift = (type: ShiftType) => {
    if (!selectedDate) return

    setShifts((currentShifts) => ({
      ...currentShifts,
      [selectedDate]: type,
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
      className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-4 md:p-8 flex flex-col items-center justify-center"
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

      <div className="relative max-w-5xl mx-auto w-full">
        <div className="text-center mb-6 md:mb-8">
          <h1 
            className="text-4xl md:text-5xl font-bold text-primary mb-2"
            style={{ fontFamily: 'Bungee, sans-serif' }}
          >
            Mi Calendario de Turnos
          </h1>
          <p className="text-muted-foreground text-lg">
            Organiza tus días de trabajo y descanso
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

        <ShiftDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          selectedDate={selectedDate}
          currentShift={selectedDate && shifts ? shifts[selectedDate] || null : null}
          onSelectShift={handleSelectShift}
          onDeleteShift={handleDeleteShift}
        />

        <ShiftSummary
          shifts={shifts || {}}
          currentDate={currentDate}
          onExportPDF={handleExportPDF}
        />

        <Toaster position="bottom-center" />
      </div>
    </div>
  )
}

export default App