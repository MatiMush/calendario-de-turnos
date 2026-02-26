import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChartLine, Plus, X, TrendUp, TrendDown, Minus } from '@phosphor-icons/react'
import { ShiftData } from '@/types/shift'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

interface PeriodComparisonProps {
  shifts: ShiftData
  currentDate: Date
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

interface PeriodStats {
  id: string
  label: string
  year: number
  month: number
  morning: number
  night: number
  rest: number
  morningHours: number
  nightHours: number
  nightHoursNocturnal: number
  totalHours: number
}

export function PeriodComparison({ shifts, currentDate }: PeriodComparisonProps) {
  const [open, setOpen] = useState(false)
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([])

  const availablePeriods = useMemo(() => {
    const periods: Array<{ id: string; label: string; year: number; month: number }> = []
    const shiftDates = Object.keys(shifts).map(dateStr => new Date(dateStr))
    
    if (shiftDates.length === 0) {
      const currentYear = new Date().getFullYear()
      for (let i = 0; i < 12; i++) {
        const month = i
        const id = `${currentYear}-${String(month).padStart(2, '0')}`
        periods.push({
          id,
          label: `${MONTHS[month]} ${currentYear}`,
          year: currentYear,
          month,
        })
      }
      return periods
    }

    const minDate = new Date(Math.min(...shiftDates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...shiftDates.map(d => d.getTime())))
    
    let currentPeriod = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    const endPeriod = new Date(maxDate.getFullYear(), maxDate.getMonth() + 2, 1)
    
    while (currentPeriod <= endPeriod) {
      const year = currentPeriod.getFullYear()
      const month = currentPeriod.getMonth()
      const id = `${year}-${String(month).padStart(2, '0')}`
      
      periods.push({
        id,
        label: `${MONTHS[month]} ${year}`,
        year,
        month,
      })
      
      currentPeriod.setMonth(currentPeriod.getMonth() + 1)
    }
    
    return periods.reverse()
  }, [shifts])

  const calculatePeriodStats = (year: number, month: number): PeriodStats => {
    const startDate = new Date(year, month, 20)
    const endDate = new Date(year, month + 1, 20)
    
    const stats: PeriodStats = {
      id: `${year}-${String(month).padStart(2, '0')}`,
      label: `${MONTHS[month]} ${year}`,
      year,
      month,
      morning: 0,
      night: 0,
      rest: 0,
      morningHours: 0,
      nightHours: 0,
      nightHoursNocturnal: 0,
      totalHours: 0,
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
        stats.nightHoursNocturnal += HOURS_PER_SHIFT.nightHoursNocturnal
      } else if (shift?.type === 'rest') {
        stats.rest++
      }
      
      currentDateIter.setDate(currentDateIter.getDate() + 1)
    }
    
    stats.totalHours = stats.morningHours + stats.nightHours
    
    return stats
  }

  const handleAddPeriod = (periodId: string) => {
    if (!selectedPeriods.includes(periodId) && selectedPeriods.length < 6) {
      setSelectedPeriods([...selectedPeriods, periodId])
    }
  }

  const handleRemovePeriod = (periodId: string) => {
    setSelectedPeriods(selectedPeriods.filter(id => id !== periodId))
  }

  const comparisonData = useMemo(() => {
    return selectedPeriods.map(periodId => {
      const period = availablePeriods.find(p => p.id === periodId)
      if (!period) return null
      return calculatePeriodStats(period.year, period.month)
    }).filter(Boolean) as PeriodStats[]
  }, [selectedPeriods, shifts, availablePeriods])

  const chartData = comparisonData.map(period => ({
    name: period.label.split(' ')[0],
    'Horas Totales': period.totalHours,
    'Turnos Mañana': period.morning,
    'Turnos Noche': period.night,
    'Días Descanso': period.rest,
  }))

  const calculateTrend = (data: PeriodStats[]) => {
    if (data.length < 2) return { direction: 'neutral' as const, percentage: 0 }
    
    const first = data[0].totalHours
    const last = data[data.length - 1].totalHours
    
    if (first === 0) return { direction: 'neutral' as const, percentage: 0 }
    
    const percentage = Math.round(((last - first) / first) * 100)
    
    return {
      direction: percentage > 0 ? 'up' as const : percentage < 0 ? 'down' as const : 'neutral' as const,
      percentage: Math.abs(percentage),
    }
  }

  const trend = calculateTrend(comparisonData)

  const averageHours = comparisonData.length > 0
    ? Math.round(comparisonData.reduce((sum, p) => sum + p.totalHours, 0) / comparisonData.length)
    : 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            className="gap-3 border-2 hover:bg-accent hover:text-accent-foreground shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-6 text-base font-bold"
          >
            <ChartLine weight="bold" className="w-6 h-6" />
            Comparar Períodos
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-primary tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            Comparativa de Períodos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select onValueChange={handleAddPeriod}>
              <SelectTrigger className="flex-1 h-12 border-2 text-base font-medium">
                <SelectValue placeholder="Selecciona un período para agregar" />
              </SelectTrigger>
              <SelectContent>
                {availablePeriods
                  .filter(p => !selectedPeriods.includes(p.id))
                  .map(period => (
                    <SelectItem key={period.id} value={period.id} className="text-base">
                      {period.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            {selectedPeriods.length < 6 && (
              <p className="text-sm text-muted-foreground self-center font-medium">
                {6 - selectedPeriods.length} período{6 - selectedPeriods.length !== 1 ? 's' : ''} más disponible{6 - selectedPeriods.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <AnimatePresence>
            {selectedPeriods.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-wrap gap-3"
              >
                {selectedPeriods.map(periodId => {
                  const period = availablePeriods.find(p => p.id === periodId)
                  return (
                    <motion.div
                      key={periodId}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRemovePeriod(periodId)}
                        className="gap-2 px-4 py-2 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        {period?.label}
                        <X weight="bold" className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {comparisonData.length === 0 ? (
            <Card className="p-16 text-center border-2 border-dashed border-border/50">
              <Plus className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" weight="light" />
              <p className="text-xl text-muted-foreground font-semibold mb-2">
                Selecciona períodos para comenzar la comparación
              </p>
              <p className="text-base text-muted-foreground">
                Puedes comparar hasta 6 períodos a la vez
              </p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 shadow-lg">
                    <p className="text-sm text-muted-foreground mb-2 font-semibold">Promedio de Horas</p>
                    <p className="text-5xl font-bold text-foreground">{averageHours}h</p>
                    <p className="text-sm text-muted-foreground mt-2 font-medium">
                      Entre {comparisonData.length} período{comparisonData.length > 1 ? 's' : ''}
                    </p>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="p-6 bg-gradient-to-br from-accent/20 to-accent/5 border-2 border-accent/30 shadow-lg">
                    <p className="text-sm text-muted-foreground mb-2 font-semibold">Tendencia</p>
                    <div className="flex items-center gap-3">
                      {trend.direction === 'up' && <TrendUp weight="bold" className="w-10 h-10 text-green-600" />}
                      {trend.direction === 'down' && <TrendDown weight="bold" className="w-10 h-10 text-red-600" />}
                      {trend.direction === 'neutral' && <Minus weight="bold" className="w-10 h-10 text-muted-foreground" />}
                      <p className="text-5xl font-bold text-foreground">
                        {trend.percentage}%
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 font-medium">
                      {trend.direction === 'up' && 'Incremento en horas'}
                      {trend.direction === 'down' && 'Reducción en horas'}
                      {trend.direction === 'neutral' && 'Sin cambios'}
                    </p>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/10 border-2 border-border shadow-lg">
                    <p className="text-sm text-muted-foreground mb-2 font-semibold">Total Comparado</p>
                    <p className="text-5xl font-bold text-foreground">
                      {comparisonData.reduce((sum, p) => sum + p.totalHours, 0)}h
                    </p>
                    <p className="text-sm text-muted-foreground mt-2 font-medium">
                      Suma de todos los períodos
                    </p>
                  </Card>
                </motion.div>
              </div>

              <Card className="p-7 border-2 shadow-lg">
                <h3 className="text-xl font-bold text-foreground mb-6">Horas Trabajadas por Período</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 600 }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 600 }}
                      label={{ value: 'Horas', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))', fontWeight: 700 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '2px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontWeight: 600,
                      }}
                    />
                    <Bar dataKey="Horas Totales" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-7 border-2 shadow-lg">
                <h3 className="text-xl font-bold text-foreground mb-6">Distribución de Turnos</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 600 }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 600 }}
                      label={{ value: 'Cantidad', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))', fontWeight: 700 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '2px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontWeight: 600,
                      }}
                    />
                    <Legend wrapperStyle={{ fontWeight: 600 }} />
                    <Line 
                      type="monotone" 
                      dataKey="Turnos Mañana" 
                      stroke="oklch(0.75 0.15 85)" 
                      strokeWidth={4}
                      dot={{ fill: "oklch(0.75 0.15 85)", r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Turnos Noche" 
                      stroke="oklch(0.45 0.12 250)" 
                      strokeWidth={4}
                      dot={{ fill: "oklch(0.45 0.12 250)", r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Días Descanso" 
                      stroke="oklch(0.65 0.08 140)" 
                      strokeWidth={4}
                      dot={{ fill: "oklch(0.65 0.08 140)", r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {comparisonData.map((period, index) => (
                  <motion.div
                    key={period.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-5 border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-foreground text-lg">{period.label}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePeriod(period.id)}
                          className="hover:bg-destructive/20"
                        >
                          <X weight="bold" className="w-5 h-5" />
                        </Button>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-muted-foreground font-semibold">Total Horas:</span>
                          <span className="font-bold text-primary text-lg">{period.totalHours}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">Turnos Mañana:</span>
                          <span className="font-semibold">{period.morning} ({period.morningHours}h)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">Turnos Noche:</span>
                          <span className="font-semibold">{period.night} ({period.nightHours}h)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">Días Descanso:</span>
                          <span className="font-semibold">{period.rest}</span>
                        </div>
                        <div className="pt-2 border-t border-border/50">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground font-medium">Horas Nocturnas:</span>
                            <span className="font-semibold">{period.nightHoursNocturnal}h</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
