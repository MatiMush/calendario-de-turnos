import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Leaf, Trash } from '@phosphor-icons/react'
import { ShiftType } from '@/types/shift'
import { motion } from 'framer-motion'

interface ShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: string | null
  currentShift: ShiftType | null
  onSelectShift: (type: ShiftType) => void
  onDeleteShift: () => void
}

export function ShiftDialog({
  open,
  onOpenChange,
  selectedDate,
  currentShift,
  onSelectShift,
  onDeleteShift,
}: ShiftDialogProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const shiftOptions = [
    {
      type: 'morning' as ShiftType,
      label: 'Turno Mañana',
      time: '07:00 AM - 07:00 PM',
      icon: Sun,
      color: 'bg-[var(--morning-shift)] hover:bg-[var(--morning-shift)]/80 text-foreground',
    },
    {
      type: 'night' as ShiftType,
      label: 'Turno Noche',
      time: '07:00 PM - 07:00 AM',
      icon: Moon,
      color: 'bg-[var(--night-shift)] hover:bg-[var(--night-shift)]/80 text-[oklch(0.95_0.01_270)]',
    },
    {
      type: 'rest' as ShiftType,
      label: 'Día de Descanso',
      time: 'Sin trabajo',
      icon: Leaf,
      color: 'bg-[var(--rest-day)] hover:bg-[var(--rest-day)]/80 text-foreground',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-primary">
            Seleccionar Turno
          </DialogTitle>
          <DialogDescription className="text-base capitalize">
            {formatDate(selectedDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {shiftOptions.map((option) => {
            const Icon = option.icon
            const isSelected = currentShift === option.type

            return (
              <motion.div
                key={option.type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => {
                    onSelectShift(option.type)
                    onOpenChange(false)
                  }}
                  className={`
                    w-full h-auto p-4 justify-start gap-4 
                    ${option.color}
                    ${isSelected ? 'ring-2 ring-accent ring-offset-2' : ''}
                  `}
                  variant="secondary"
                >
                  <Icon weight="fill" className="w-6 h-6 flex-shrink-0" />
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="font-semibold text-base">{option.label}</span>
                    <span className="text-sm opacity-90">{option.time}</span>
                  </div>
                </Button>
              </motion.div>
            )
          })}
        </div>

        {currentShift && (
          <div className="pt-2 border-t">
            <Button
              onClick={() => {
                onDeleteShift()
                onOpenChange(false)
              }}
              variant="destructive"
              className="w-full gap-2"
            >
              <Trash className="w-4 h-4" />
              Eliminar Turno
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
