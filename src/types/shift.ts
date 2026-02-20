export type ShiftType = 'morning' | 'night' | 'rest'

export interface Shift {
  date: string
  type: ShiftType
}

export interface ShiftData {
  [key: string]: ShiftType
}
