import { jsPDF } from 'jspdf'
import { ShiftData, ShiftType } from '@/types/shift'

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

export function generateShiftPDF(shifts: ShiftData, currentDate: Date) {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const startDate = new Date(year, month, 20)
    const endDate = new Date(year, month + 1, 20)
    
    pdf.setFontSize(20)
    pdf.setTextColor(40, 40, 40)
    pdf.text('Calendario de Turnos', 105, 20, { align: 'center' })
    
    pdf.setFontSize(14)
    pdf.setTextColor(80, 80, 80)
    pdf.text(
      `Período: 20 de ${MONTHS[startDate.getMonth()]} - 20 de ${MONTHS[endDate.getMonth()]} ${endDate.getFullYear()}`,
      105,
      30,
      { align: 'center' }
    )
    
    const stats = {
      morning: 0,
      night: 0,
      rest: 0,
      morningHours: 0,
      nightHours: 0,
      totalHours: 0,
    }
    
    const shiftList: Array<{ date: string; shift: ShiftType; note?: string }> = []
    
    const currentDateIter = new Date(startDate)
    
    while (currentDateIter <= endDate) {
      const dateStr = currentDateIter.toISOString().split('T')[0]
      const shift = shifts[dateStr]
      
      if (shift) {
        shiftList.push({
          date: currentDateIter.toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          }),
          shift: shift.type,
          note: shift.note,
        })
        
        if (shift.type === 'morning') {
          stats.morning++
          stats.morningHours += HOURS_PER_SHIFT.morning
        } else if (shift.type === 'night') {
          stats.night++
          stats.nightHours += HOURS_PER_SHIFT.night
        } else if (shift.type === 'rest') {
          stats.rest++
        }
      }
      
      currentDateIter.setDate(currentDateIter.getDate() + 1)
    }
    
    stats.totalHours = stats.morningHours + stats.nightHours
    
    pdf.setFontSize(12)
    pdf.setTextColor(60, 60, 60)
    
    let yPos = 50
    
    pdf.setFontSize(16)
    pdf.setTextColor(40, 40, 40)
    pdf.text('Resumen', 20, yPos)
    yPos += 10
    
    pdf.setFontSize(12)
    pdf.setTextColor(60, 60, 60)
    pdf.text(`Turnos Mañana (07:00 - 19:00): ${stats.morning}`, 20, yPos)
    yPos += 8
    pdf.text(`Turnos Noche (19:00 - 07:00): ${stats.night}`, 20, yPos)
    yPos += 8
    pdf.text(`Días de Descanso: ${stats.rest}`, 20, yPos)
    yPos += 8
    pdf.text(`Total: ${stats.morning + stats.night + stats.rest} días`, 20, yPos)
    yPos += 12
    
    pdf.setFontSize(14)
    pdf.setTextColor(40, 40, 40)
    pdf.text('Estadísticas de Horas', 20, yPos)
    yPos += 10
    
    pdf.setFontSize(12)
    pdf.setTextColor(60, 60, 60)
    pdf.text(`Horas Turno Mañana: ${stats.morningHours}h (${HOURS_PER_SHIFT.morning}h por turno)`, 20, yPos)
    yPos += 8
    pdf.text(`Horas Turno Noche: ${stats.nightHours}h (${HOURS_PER_SHIFT.night}h por turno)`, 20, yPos)
    yPos += 8
    pdf.setFontSize(13)
    pdf.setTextColor(40, 40, 40)
    pdf.text(`Total Horas Trabajadas: ${stats.totalHours}h`, 20, yPos)
    yPos += 15
    
    pdf.setFontSize(16)
    pdf.setTextColor(40, 40, 40)
    pdf.text('Detalle de Turnos', 20, yPos)
    yPos += 10
    
    pdf.setFontSize(11)
    
    shiftList.forEach((item, index) => {
      if (yPos > 270) {
        pdf.addPage()
        yPos = 20
      }
      
      const shiftLabel =
        item.shift === 'morning'
          ? 'Mañana'
          : item.shift === 'night'
          ? 'Noche'
          : 'Descanso'
      
      pdf.setTextColor(40, 40, 40)
      pdf.text(`${item.date}:`, 20, yPos)
      
      if (item.shift === 'morning') {
        pdf.setTextColor(200, 150, 50)
      } else if (item.shift === 'night') {
        pdf.setTextColor(80, 80, 150)
      } else {
        pdf.setTextColor(100, 180, 100)
      }
      
      pdf.text(shiftLabel, 70, yPos)
      
      if (item.note) {
        pdf.setTextColor(100, 100, 100)
        pdf.setFontSize(9)
        yPos += 5
        const noteLines = pdf.splitTextToSize(`Nota: ${item.note}`, 170)
        pdf.text(noteLines, 25, yPos)
        yPos += noteLines.length * 4
        pdf.setFontSize(11)
      }
      
      yPos += 7
    })
    
    const fileName = `turnos_${startDate.getFullYear()}_${String(startDate.getMonth() + 1).padStart(2, '0')}.pdf`
    
    pdf.save(fileName)
    
    console.log('PDF generado correctamente:', fileName)
  } catch (error) {
    console.error('Error al generar PDF:', error)
    throw error
  }
}
