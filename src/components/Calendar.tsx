import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CaretLeft, CaretRight, Sun, Moon, Leaf } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { ShiftType } from '@/types/shift'

interface CalendarProps {
  currentDate: Date
  shifts: { [key: string]: ShiftType }
  onDateSelect: (date: string) => void
  onPreviousMonth: () => void
  onNextMonth: () => void
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function Calendar({ currentDate, shifts, onDateSelect, onPreviousMonth, onNextMonth }: CalendarProps) {
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
        return 'bg-[var(--morning-shift)] text-foreground'
      case 'night':
        return 'bg-[var(--night-shift)] text-white'
      case 'rest':
        return 'bg-[var(--rest-day)] text-foreground'
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

    calendarDays.push(
      <motion.button
        key={day}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onDateSelect(dateStr)}
        className={`
          aspect-square rounded-lg relative flex flex-col items-center justify-center
          transition-all duration-200 border-2
          ${shift 
            ? `${getShiftColor(shift)} border-transparent shadow-md` 
            : 'bg-card hover:bg-secondary border-border hover:border-primary/30'
          }
          ${isToday ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''}
        `}
      >
        <span className={`text-sm font-medium ${shift ? 'mb-1' : ''}`}>{day}</span>
        {shift && (
          <div className="flex items-center justify-center">
            {getShiftIcon(shift)}
          </div>
        )}
      </motion.button>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl overflow-hidden bg-card/80 backdrop-blur-sm border-2 border-border">
      <div className="bg-primary/10 border-b-2 border-border p-4 md:p-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousMonth}
            className="hover:bg-primary/20 rounded-full"
          >
            <CaretLeft className="w-6 h-6" />
          </Button>
          
          <h1 className="text-2xl md:text-3xl font-bold text-primary" style={{ fontFamily: 'Bungee, sans-serif' }}>
            {MONTHS[month]} {year}
          </h1>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            className="hover:bg-primary/20 rounded-full"
          >
            <CaretRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-7 gap-2 mb-3">
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs md:text-sm font-semibold text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays}
        </div>
      </div>
    </Card>
  )
}
