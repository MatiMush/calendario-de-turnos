import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CaretLeft, CaretRight, Sun, Moon, Leaf } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { ShiftType, ShiftData } from '@/types/shift'

interface CalendarProps {
  currentDate: Date
  shifts: ShiftData
  selectedDate: string | null
  onDateSelect: (date: string) => void
  onPreviousMonth: () => void
  onNextMonth: () => void
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function Calendar({ currentDate, shifts, selectedDate, onDateSelect, onPreviousMonth, onNextMonth }: CalendarProps) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const getShiftIcon = (type: ShiftType) => {
    switch (type) {
      case 'morning':
        return <Sun weight="fill" className="w-5 h-5" />
      case 'night':
        return <Moon weight="fill" className="w-5 h-5" />
      case 'rest':
        return <Leaf weight="fill" className="w-5 h-5" />
    }
  }

  const getShiftColor = (type: ShiftType) => {
    switch (type) {
      case 'morning':
        return 'bg-[var(--morning-shift)] text-foreground hover:bg-[var(--morning-shift)]/90'
      case 'night':
        return 'bg-[var(--night-shift)] text-[oklch(0.95_0.01_270)] hover:bg-[var(--night-shift)]/90'
      case 'rest':
        return 'bg-[var(--rest-day)] text-foreground hover:bg-[var(--rest-day)]/90'
    }
  }

  const calendarDays = []
  
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="aspect-square" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(day)
    const shift = shifts[dateStr]
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()
    const isSelected = selectedDate === dateStr

    calendarDays.push(
      <motion.button
        key={day}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation()
          onDateSelect(dateStr)
        }}
        className={`
          aspect-square rounded-xl relative flex flex-col items-center justify-center
          transition-all duration-300 border-2 font-semibold
          ${shift 
            ? `${getShiftColor(shift.type)} border-transparent shadow-lg hover:shadow-xl` 
            : 'bg-card hover:bg-gradient-to-br hover:from-secondary/20 hover:to-accent/10 border-border hover:border-primary/40'
          }
          ${isToday ? 'ring-4 ring-accent ring-offset-2 ring-offset-background' : ''}
          ${isSelected && !isToday ? 'ring-4 ring-primary ring-offset-2 ring-offset-background' : ''}
        `}
      >
        <span className={`text-base md:text-lg font-bold ${shift ? 'mb-1' : ''}`}>{day}</span>
        {shift && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center justify-center gap-1"
          >
            {getShiftIcon(shift.type)}
          </motion.div>
        )}
        {shift?.note && (
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent shadow-lg"
          />
        )}
      </motion.button>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl overflow-hidden bg-card/95 backdrop-blur-md border border-border/50">
      <div className="relative bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/10 border-b border-border/50 p-5 md:p-7">
        <div className="flex items-center justify-between relative z-10">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPreviousMonth}
              className="hover:bg-primary/25 rounded-full transition-all duration-300 h-12 w-12"
            >
              <CaretLeft className="w-7 h-7" weight="bold" />
            </Button>
          </motion.div>
          
          <h1 
            className="text-3xl md:text-4xl font-bold text-primary tracking-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {MONTHS[month]} {year}
          </h1>
          
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNextMonth}
              className="hover:bg-primary/25 rounded-full transition-all duration-300 h-12 w-12"
            >
              <CaretRight className="w-7 h-7" weight="bold" />
            </Button>
          </motion.div>
        </div>
        
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, currentColor 0%, transparent 60%)`,
          }}
        />
      </div>

      <div className="p-5 md:p-7">
        <div className="grid grid-cols-7 gap-3 mb-4">
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs md:text-sm font-bold text-muted-foreground/80 py-2 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3">
          {calendarDays}
        </div>
      </div>
    </Card>
  )
}
