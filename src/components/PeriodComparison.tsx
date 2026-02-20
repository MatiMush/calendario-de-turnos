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
        <Button
          variant="outline"
          className="gap-2 border-2 hover:bg-accent hover:text-accent-foreground shadow-md"
        >
          <ChartLine weight="bold" className="w-5 h-5" />
          Comparar Períodos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary" style={{ fontFamily: 'Bungee, sans-serif' }}>
            Comparativa de Períodos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select onValueChange={handleAddPeriod}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecciona un período para agregar" />
              </SelectTrigger>
              <SelectContent>
                {availablePeriods
                  .filter(p => !selectedPeriods.includes(p.id))
                  .map(period => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            {selectedPeriods.length < 6 && (
              <p className="text-sm text-muted-foreground self-center">
                {6 - selectedPeriods.length} períodos más disponibles
              </p>
            )}
          </div>

          <AnimatePresence>
            {selectedPeriods.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-wrap gap-2"
              >
                {selectedPeriods.map(periodId => {
                  const period = availablePeriods.find(p => p.id === periodId)
                  return (
                    <motion.div
                      key={periodId}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRemovePeriod(periodId)}
                        className="gap-2"
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
            <Card className="p-12 text-center border-2 border-dashed">
              <Plus className="w-16 h-16 mx-auto mb-4 text-muted-foreground" weight="light" />
              <p className="text-lg text-muted-foreground">
                Selecciona períodos para comenzar la comparación
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Puedes comparar hasta 6 períodos a la vez
              </p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30">
                  <p className="text-sm text-muted-foreground mb-1">Promedio de Horas</p>
                  <p className="text-4xl font-bold text-foreground">{averageHours}h</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Entre {comparisonData.length} período{comparisonData.length > 1 ? 's' : ''}
                  </p>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-accent/20 to-accent/5 border-2 border-accent/30">
                  <p className="text-sm text-muted-foreground mb-1">Tendencia</p>
                  <div className="flex items-center gap-2">
                    {trend.direction === 'up' && <TrendUp weight="bold" className="w-8 h-8 text-green-600" />}
                    {trend.direction === 'down' && <TrendDown weight="bold" className="w-8 h-8 text-red-600" />}
                    {trend.direction === 'neutral' && <Minus weight="bold" className="w-8 h-8 text-muted-foreground" />}
                    <p className="text-4xl font-bold text-foreground">
                      {trend.percentage}%
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {trend.direction === 'up' && 'Incremento en horas'}
                    {trend.direction === 'down' && 'Reducción en horas'}
                    {trend.direction === 'neutral' && 'Sin cambios'}
                  </p>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-secondary/40 to-secondary/10 border-2 border-border">
                  <p className="text-sm text-muted-foreground mb-1">Total Comparado</p>
                  <p className="text-4xl font-bold text-foreground">
                    {comparisonData.reduce((sum, p) => sum + p.totalHours, 0)}h
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Suma de todos los períodos
                  </p>
                </Card>
              </div>

              <Card className="p-6 border-2">
                <h3 className="text-lg font-bold text-foreground mb-4">Horas Trabajadas por Período</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                      label={{ value: 'Horas', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '2px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="Horas Totales" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 border-2">
                <h3 className="text-lg font-bold text-foreground mb-4">Distribución de Turnos</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                      label={{ value: 'Cantidad', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '2px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Turnos Mañana" 
                      stroke="oklch(0.75 0.15 85)" 
                      strokeWidth={3}
                      dot={{ fill: "oklch(0.75 0.15 85)", r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Turnos Noche" 
                      stroke="oklch(0.45 0.12 250)" 
                      strokeWidth={3}
                      dot={{ fill: "oklch(0.45 0.12 250)", r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Días Descanso" 
                      stroke="oklch(0.65 0.08 140)" 
                      strokeWidth={3}
                      dot={{ fill: "oklch(0.65 0.08 140)", r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparisonData.map((period, index) => (
                  <motion.div
                    key={period.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4 border-2 hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-foreground">{period.label}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePeriod(period.id)}
                        >
                          <X weight="bold" className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Horas:</span>
                          <span className="font-bold text-primary">{period.totalHours}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Turnos Mañana:</span>
                          <span className="font-semibold">{period.morning} ({period.morningHours}h)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Turnos Noche:</span>
                          <span className="font-semibold">{period.night} ({period.nightHours}h)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Días Descanso:</span>
                          <span className="font-semibold">{period.rest}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Horas Nocturnas:</span>
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
