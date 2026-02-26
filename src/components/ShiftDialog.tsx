import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Sun, Moon, Leaf, Trash, NotePencil, FloppyDisk, Check, Clock } from '@phosphor-icons/react'
import { ShiftType, Shift } from '@/types/shift'
import { motion, AnimatePresence } from 'framer-motion'

interface ShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: string | null
  currentShift: Shift | null
  onSelectShift: (type: ShiftType, note?: string, customHours?: { hours: 8 | 12; startTime?: string; endTime?: string }) => void
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
  const [hours, setHours] = useState<8 | 12>(12)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  useEffect(() => {
    if (currentShift) {
      setNote(currentShift.note || '')
      setSelectedType(currentShift.type)
      setHours(currentShift.customHours?.hours || 12)
      setStartTime(currentShift.customHours?.startTime || '')
      setEndTime(currentShift.customHours?.endTime || '')
    } else {
      setNote('')
      setSelectedType(null)
      setHours(12)
      setStartTime('')
      setEndTime('')
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
      const customHours = (selectedType !== 'rest' && hours === 8) ? {
        hours,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
      } : undefined

      onSelectShift(selectedType, note.trim() || undefined, customHours)
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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="w-full max-w-4xl mx-auto shadow-2xl bg-card/95 backdrop-blur-md border border-border/50 mt-8">
            <div className="relative bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/10 border-b border-border/50 p-5 md:p-6">
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold text-primary tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Seleccionar Turno
                </h3>
                <p className="text-sm md:text-base text-muted-foreground capitalize mt-1 font-medium">
                  {formatDate(selectedDate)}
                </p>
              </div>
              
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 50%, currentColor 0%, transparent 60%)`,
                }}
              />
            </div>

            <div className="p-5 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {shiftOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = selectedType === option.type

                  return (
                    <motion.div
                      key={option.type}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        onClick={() => setSelectedType(option.type)}
                        className={`
                          w-full h-auto p-5 justify-start gap-4 md:flex-col md:items-center md:justify-center md:gap-3
                          ${option.color}
                          ${isSelected ? 'ring-4 ring-accent ring-offset-2 shadow-xl' : 'shadow-md'}
                          transition-all duration-300
                        `}
                        variant="secondary"
                      >
                        <Icon weight="fill" className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0" />
                        <div className="flex flex-col items-start md:items-center gap-1">
                          <span className="font-bold text-base md:text-lg">{option.label}</span>
                          <span className="text-xs md:text-sm opacity-90 font-medium">{option.time}</span>
                        </div>
                      </Button>
                    </motion.div>
                  )
                })}
              </div>

              {selectedType && selectedType !== 'rest' && (
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3 text-primary">
                    <Clock className="w-6 h-6" weight="bold" />
                    <Label className="text-lg font-bold">
                      Horas trabajadas
                    </Label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="button"
                        onClick={() => {
                          setHours(12)
                          setStartTime('')
                          setEndTime('')
                        }}
                        variant={hours === 12 ? 'default' : 'outline'}
                        className={`w-full h-14 text-base font-bold transition-all duration-300 ${
                          hours === 12 
                            ? 'ring-2 ring-primary ring-offset-2 shadow-lg' 
                            : 'hover:border-primary/50'
                        }`}
                      >
                        12 Horas
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="button"
                        onClick={() => setHours(8)}
                        variant={hours === 8 ? 'default' : 'outline'}
                        className={`w-full h-14 text-base font-bold transition-all duration-300 ${
                          hours === 8 
                            ? 'ring-2 ring-primary ring-offset-2 shadow-lg' 
                            : 'hover:border-primary/50'
                        }`}
                      >
                        8 Horas
                      </Button>
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {hours === 8 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 pt-3"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="start-time" className="text-sm font-semibold text-muted-foreground">
                              Hora de inicio
                            </Label>
                            <Input
                              id="start-time"
                              type="time"
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                              className="h-12 text-base border-2 focus:border-primary/50"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="end-time" className="text-sm font-semibold text-muted-foreground">
                              Hora de fin
                            </Label>
                            <Input
                              id="end-time"
                              type="time"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              className="h-12 text-base border-2 focus:border-primary/50"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-3 text-primary">
                  <NotePencil className="w-6 h-6" weight="bold" />
                  <Label htmlFor="shift-note" className="text-lg font-bold">
                    Nota o Comentario (opcional)
                  </Label>
                </div>
                <Textarea
                  id="shift-note"
                  placeholder="Agrega una nota sobre este turno..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[100px] resize-none text-base border-2 focus:border-primary/50 rounded-xl"
                  maxLength={200}
                />
                <p className="text-sm text-muted-foreground text-right font-medium">
                  {note.length}/200 caracteres
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-3 mt-6 pt-5 border-t border-border/50">
                <motion.div
                  className="flex-1"
                  whileHover={selectedType ? { scale: 1.02 } : {}}
                  whileTap={selectedType ? { scale: 0.97 } : {}}
                >
                  <Button
                    onClick={handleSaveShift}
                    disabled={!selectedType}
                    className="w-full relative overflow-hidden h-14 text-lg font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {selectedType ? (
                        <>
                          <Check weight="bold" className="w-6 h-6" />
                          Guardar Turno
                        </>
                      ) : (
                        <>
                          <FloppyDisk weight="fill" className="w-6 h-6" />
                          Selecciona un turno
                        </>
                      )}
                    </span>
                    {selectedType && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          ease: 'linear',
                        }}
                      />
                    )}
                  </Button>
                </motion.div>

                {currentShift && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      onClick={() => {
                        onDeleteShift()
                        onOpenChange(false)
                      }}
                      variant="destructive"
                      className="gap-3 h-14 px-6 shadow-lg hover:shadow-2xl hover:shadow-destructive/40 transition-all duration-300 font-bold text-base"
                      size="lg"
                    >
                      <Trash className="w-5 h-5" weight="bold" />
                      Eliminar
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
