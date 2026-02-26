export type ShiftType = 'morning' | 'night' | 'rest'

export interface Shift {
  date: string
  type: ShiftType
  note?: string
  customHours?: {
    hours: 8 | 12
    startTime?: string
    endTime?: string
  }
}

export interface ShiftData {
  [key: string]: Shift
}
