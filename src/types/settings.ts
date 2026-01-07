export interface Holiday {
  id: string
  date: Date
  name: string
  type: "annual" | "special"
  fullDay: boolean
  startTime?: string
  endTime?: string
}

export interface BlockedTimeSlot {
  id: string
  date: Date
  startTime: string
  endTime: string
  reason: string
}

export interface BookingRule {
  minAdvanceHours: number
  maxAdvanceDays: number
  minCancelHours: number
  allowCustomerCancel: boolean
  maxBookingsPerPhone: number
}

export interface ShopInfo {
  name: string
  nameEn?: string
  phone: string
  address: string
  googleMapLink?: string
  logo?: string
  coverImage?: string
}

export interface StaffSettings {
  allowCustomerSelectStaff: boolean
  autoAssignStaff: boolean
  maxBookingsPerStaffPerDay?: number
}
