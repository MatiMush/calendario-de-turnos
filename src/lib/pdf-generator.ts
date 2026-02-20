import jsPDF from 'jspdf'
import { ShiftData, ShiftType } from '@/types/shift'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function generateShiftPDF(shifts: ShiftData, currentDate: Date) {
  const pdf = new jsPDF()
  
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
  }
  
  const shiftList: Array<{ date: string; shift: ShiftType }> = []
  
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
        shift,
      })
      
      if (shift === 'morning') stats.morning++
      else if (shift === 'night') stats.night++
      else if (shift === 'rest') stats.rest++
    }
    
    currentDateIter.setDate(currentDateIter.getDate() + 1)
  }
  
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
    
    yPos += 7
  })
  
  const fileName = `turnos_${startDate.getFullYear()}_${String(startDate.getMonth() + 1).padStart(2, '0')}.pdf`
  pdf.save(fileName)
}
