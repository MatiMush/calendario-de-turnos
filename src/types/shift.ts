export type ShiftType = 'morning' | 'night' | 'rest'

export interface Shift {
  date: string
  type: ShiftType
  note?: string
}

export interface ShiftData {
  [key: string]: Shift
}
