import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sun, Moon, Leaf, Trash, NotePencil } from '@phosphor-icons/react'
import { ShiftType, Shift } from '@/types/shift'
import { motion, AnimatePresence } from 'framer-motion'

interface ShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: string | null
  currentShift: Shift | null
  onSelectShift: (type: ShiftType, note?: string) => void
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
  const [note, setNote] = useState('')
  const [selectedType, setSelectedType] = useState<ShiftType | null>(null)

  useEffect(() => {
    if (currentShift) {
      setNote(currentShift.note || '')
      setSelectedType(currentShift.type)
    } else {
      setNote('')
      setSelectedType(null)
    }
  }, [currentShift, open])

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

  const handleSaveShift = () => {
    if (selectedType) {
      onSelectShift(selectedType, note.trim() || undefined)
      onOpenChange(false)
    }
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
    <AnimatePresence>
      {open && selectedDate && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="w-full max-w-4xl mx-auto shadow-xl bg-card/95 backdrop-blur-sm border-2 border-border mt-6">
            <div className="p-4 md:p-6">
              <div className="mb-4">
                <h3 className="text-xl md:text-2xl font-semibold text-primary">
                  Seleccionar Turno
                </h3>
                <p className="text-sm md:text-base text-muted-foreground capitalize mt-1">
                  {formatDate(selectedDate)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {shiftOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = selectedType === option.type

                  return (
                    <motion.div
                      key={option.type}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => setSelectedType(option.type)}
                        className={`
                          w-full h-auto p-4 justify-start gap-3 md:flex-col md:items-center md:justify-center md:gap-2
                          ${option.color}
                          ${isSelected ? 'ring-2 ring-accent ring-offset-2' : ''}
                        `}
                        variant="secondary"
                      >
                        <Icon weight="fill" className="w-6 h-6 flex-shrink-0" />
                        <div className="flex flex-col items-start md:items-center gap-0.5">
                          <span className="font-semibold text-sm md:text-base">{option.label}</span>
                          <span className="text-xs md:text-sm opacity-90">{option.time}</span>
                        </div>
                      </Button>
                    </motion.div>
                  )
                })}
              </div>

              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center gap-2 text-primary">
                  <NotePencil className="w-5 h-5" />
                  <Label htmlFor="shift-note" className="text-base font-semibold">
                    Nota o Comentario (opcional)
                  </Label>
                </div>
                <Textarea
                  id="shift-note"
                  placeholder="Agrega una nota sobre este turno..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[80px] resize-none"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {note.length}/200 caracteres
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-2 mt-4 pt-4 border-t">
                <Button
                  onClick={handleSaveShift}
                  disabled={!selectedType}
                  className="flex-1"
                  size="lg"
                >
                  Guardar Turno
                </Button>

                {currentShift && (
                  <Button
                    onClick={() => {
                      onDeleteShift()
                      onOpenChange(false)
                    }}
                    variant="destructive"
                    className="gap-2"
                    size="lg"
                  >
                    <Trash className="w-4 h-4" />
                    Eliminar
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
