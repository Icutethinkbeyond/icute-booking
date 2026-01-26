import { DayOfWeek, HolidayType, LeaveType, RoleName } from "@prisma/client";
import { User } from "./User";
import { Booking } from "./Booking";
import { Dayjs } from "dayjs";

export const LEAVE_TYPE_OPTIONS = [
  { value: "SICK", label: "ลาป่วย" },
  { value: "VACATION", label: "ลาพักร้อน" },
  { value: "PERSONAL", label: "ลากิจ" },
  { value: "OTHER", label: "อื่น ๆ" },
];

export const LEAVE_TYPE_MAP: Record<LeaveType, string> = {
  SICK: "ลาป่วย",
  VACATION: "ลาพักร้อน",
  PERSONAL: "ลากิจ",
  OTHER: "อื่น ๆ",
};


export interface StoreRegister {
  storeName: string;
  storeNameTH: string;
  storeUsername: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean
}

export const initialStoreRegister: StoreRegister = {
  storeName: '',
  storeNameTH: '',
  storeUsername: '',
  email: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false
}

export interface Role {
  roleId: string;
  name: RoleName;
  description?: string;
  userIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeWorkingTime {
  id?: string;

  startTime: string; // "09:00"
  endTime: string;   // "18:00"
}

export interface EmployeeBreakTime {
  id?: string;

  dayOfWeek: DayOfWeek;
  startTime: string; // "12:00"
  endTime: string;   // "13:00"
}

export interface EmployeeLeave {
  id?: string;
  employeeId?: string | null;

  startDate: Dayjs | null | string;
  endDate: Dayjs | null | string;

  leaveType: LeaveType;
  note?: string;
}

export interface EmployeeWorkingDay {
  id?: string;

  dayOfWeek: DayOfWeek;
  isWorking: boolean;

  timeSlots: EmployeeWorkingTime[];
}

export interface Employee {
  id: string;
  name: string; // "พี่แอน"
  isActive: boolean; // สถานะพร้อมให้บริการ

  surname: string;
  nickname?: string
  image?: string;
  imageId?: string;
  imageUrl?: string;
  position?: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  note?: string;
  startDate?: Dayjs | null | string;

  roleId: undefined,
  role: undefined,

  storeId: string;
  store?: Store;

  isDelete: boolean;

  bookings?: Booking[];
  services?: Service[];
  serviceIds: string[];

  workingDays: EmployeeWorkingDay[];
  leaves: EmployeeLeave[];

  createdAt: string; // ISO Date
  updatedAt: string; // ISO Date
}

export interface Holiday {
  id: string;
  date: string | null | string; // "พี่แอน"
  startTime?: Dayjs | null | string; // "ช่างทำผม"
  fullDay: boolean; // สถานะพร้อมให้บริการ
  endTime?: Dayjs | null | string;
  holidayName: string
  holidayType: HolidayType

  storeId: string;
  store?: Store;

  createdAt: string; // ISO Date
  updatedAt: string; // ISO Date
}

export interface Store {
  id: string;
  storeName: string;
  storeNameTH: string;
  storeUsername: string;
  lineOALink?: string;
  detail?: string;
  tel?: string;
  mapUrl?: string;

  location: {
    latitude?: number | null
    longitude?: number | null
  }

  logoUrl?: string;
  logoId?: string;
  coverUrl?: string;
  coverId?: string;

  addressCustom?: string;

  isDelete: boolean;

  lineNotifyToken?: string;
  lineChannelId?: string;
  lineChannelSecret?: string;

  employeeSetting: EmployeeSetting;
  bookingRule: BookingRule;
  cancelRule: CancelRule;

  newBooking?: string; //เเจ้งเตือนเมื่อได้รับการจองใหม่
  successBooking?: string;  //เเจ้งเตือนลูกค้าเมื่อจองสำเร็จ
  cancelBooking?: string;  //ข้อความเเจ้งเตือนลูกค้าเมื่อถูกยกเลิกการจอง
  before24H?: string;  //ข้อความเเจ้งเตือนลูกค้าเมื่อใกล้ถึงเวลานัด 24 ชั่วโมง
  reSchedule?: string;  //ข้อความเเจ้งเตือนลูกค้าเมื่อถูกเลื่อนการจอง

  userId: string;
  user?: User;

  employees?: Employee[];
  services?: Service[];
  bookings?: Booking[];
  operatingHours?: DefaultOperatingHour;
  notifications?: Notification[];
  Holiday?: Holiday[]

  createdAt: string;
  updatedAt: string;
}

export interface DefaultOperatingHour {
  id: string;

  // 2. สถานะและเวลาทำการปกติ
  MON_isOpen: string | boolean;
  MON_openTime?: Dayjs | null | string;
  MON_closeTime?: Dayjs | null | string;

  TUE_isOpen: string | boolean;
  TUE_openTime?: Dayjs | null | string;
  TUE_closeTime?: Dayjs | null | string;

  WED_isOpen: string | boolean;
  WED_openTime?: Dayjs | null | string;
  WED_closeTime?: Dayjs | null | string;

  THU_isOpen: string | boolean;
  THU_openTime?: Dayjs | null | string;
  THU_closeTime?: Dayjs | null | string;

  FRI_isOpen: string | boolean;
  FRI_openTime?: Dayjs | null | string;
  FRI_closeTime?: Dayjs | null | string;

  SAT_isOpen: string | boolean;
  SAT_openTime?: Dayjs | null | string;
  SAT_closeTime?: Dayjs | null | string;

  SUN_isOpen: string | boolean;
  SUN_openTime?: Dayjs | null | string;
  SUN_closeTime?: Dayjs | null | string;

  storeId: string;
  store?: Store;

  createdAt: string;
  updatedAt: string;
}

export interface ServiceList {
  id: string;
  name: string; // เช่น "ตัดผม 30 นาที"
  durationMinutes: number;
  price: number
}

export interface EmployeeList {
  id: string;
  name: string; // เช่น "ตัดผม 30 นาที"
}

export interface EmployeeSetting {
  allowCustomerSelectEmployee: boolean;
  autoAssignEmployee: boolean;

  maxQueuePerEmployeePerDay?: number | null // null หรือ 0 = ไม่จำกัด
}

export interface BookingRule {
  minAdvanceBookingHours: number // จองล่วงหน้าขั้นต่ำ (ชั่วโมง) 
  maxAdvanceBookingDays: number // จองล่วงหน้าสูงสุด (วัน)
  maxQueuePerPhone: number // จำนวนคิวสูงสุดต่อบริการ
}

export interface CancelRule {
  minCancelBeforeHours: number  // ต้องยกเลิกล่วงหน้ากี่ชั่วโมง
  allowCustomerCancel: boolean;
}


export interface Service {
  id: string;
  name: string; // เช่น "ตัดผม 30 นาที"
  durationMinutes: number;
  price: number;
  discount: number;

  // new column
  bufferTime: number;
  detail?: string;
  displayNumber?: number;
  image?: string;
  imageId?: string;
  imageUrl?: string;
  colorOfService?: string;
  active: boolean | string

  isDelete: boolean;

  storeId: string;
  store?: Store;

  employees?: Employee[];
  employeeIds: string[];
  bookings?: Booking[];

  createdAt: string;
  updatedAt: string;
}

export const initialHoliday: Holiday = {
  id: '',
  date: '',
  startTime: null,
  fullDay: true,
  endTime: null,
  holidayName: '',
  holidayType: HolidayType.ANNUAL,

  storeId: '',
  store: undefined,

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const initialEmployeeLeave: EmployeeLeave = {
  id: '',
  employeeId: '',
  startDate: null,
  endDate: null,
  leaveType: LeaveType.VACATION,
  note: "",
};

export interface BlockedTime {
  id: string;
  date: Dayjs | null | string;
  startTime: string;
  endTime: string;
  reason: string;
  type: LeaveType;
}

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
];

export const createInitialBreakTimes = (): EmployeeBreakTime[] =>
  DAYS_OF_WEEK.filter((day) => !["SAT", "SUN"].includes(day)).map(
    (day) => ({
      dayOfWeek: day,
      startTime: "12:00",
      endTime: "13:00",
    })
  );

// export const createInitialWorkingDay = (
//   day: DayOfWeek
// ): EmployeeWorkingDay => {
//   const isWorking = !["SAT", "SUN"].includes(day);

//   return {
//     dayOfWeek: day,
//     isWorking,
//     timeSlots: isWorking
//       ? [
//         {
//           startTime: "09:00",
//           endTime: "18:00",
//         },
//       ]
//       : [],
//   };
// };

export const DAY_LABEL: Record<DayOfWeek, string> = {
  MON: "จันทร์",
  TUE: "อังคาร",
  WED: "พุธ",
  THU: "พฤหัส",
  FRI: "ศุกร์",
  SAT: "เสาร์",
  SUN: "อาทิตย์",
};

export const initialWorkingDays: EmployeeWorkingDay[] =
  Object.values(DayOfWeek).map((day) => ({
    dayOfWeek: day,
    isWorking: false,
    timeSlots: [],
  }));


export const initialEmployee: Employee = {
  id: '',
  name: '', // หรือ "พี่แอน"
  isActive: true, // เริ่มต้นให้พร้อมให้บริการ

  surname: '',
  nickname: '',
  image: '',
  imageId: '',
  imageUrl: '',
  position: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  note: '',
  startDate: null,

  isDelete: false,

  roleId: undefined,
  role: undefined,

  storeId: '',
  store: undefined,
  bookings: undefined,
  services: undefined,

  serviceIds: [],

  workingDays: [
    {
      "dayOfWeek": "MON",
      "isWorking": true,
      "timeSlots": [
        {
          "startTime": "09:00",
          "endTime": "12:00"
        },
        {
          "startTime": "13:00",
          "endTime": "18:00"
        }
      ]
    },
    {
      "dayOfWeek": "TUE",
      "isWorking": true,
      "timeSlots": [
        {
          "startTime": "09:00",
          "endTime": "12:00"
        },
        {
          "startTime": "13:00",
          "endTime": "18:00"
        }
      ]
    },
    {
      "dayOfWeek": "WED",
      "isWorking": true,
      "timeSlots": [
        {
          "startTime": "09:00",
          "endTime": "12:00"
        },
        {
          "startTime": "13:00",
          "endTime": "18:00"
        }
      ]
    },
    {
      "dayOfWeek": "THU",
      "isWorking": true,
      "timeSlots": [
        {
          "startTime": "09:00",
          "endTime": "12:00"
        },
        {
          "startTime": "13:00",
          "endTime": "18:00"
        }
      ]
    },
    {
      "dayOfWeek": "FRI",
      "isWorking": true,
      "timeSlots": [
        {
          "startTime": "09:00",
          "endTime": "12:00"
        },
        {
          "startTime": "13:00",
          "endTime": "18:00"
        }
      ]
    },
    {
      "dayOfWeek": "SAT",
      "isWorking": true,
      "timeSlots": [
        {
          "startTime": "09:00",
          "endTime": "12:00"
        },
        {
          "startTime": "13:00",
          "endTime": "18:00"
        }
      ]
    },
    {
      "dayOfWeek": "SUN",
      "isWorking": false,
      "timeSlots": []
    }
  ],
  // breakTimes: createInitialBreakTimes(),
  leaves: [],

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Interface mirroring the expected body structure (ใช้โครงสร้างแบบ Nested เพื่อความยืดหยุ่น)
interface DayHours {
  isOpen?: boolean;
  openTime?: string | null; // "HH:MM"
  closeTime?: string | null; // "HH:MM"
}

export interface OperatingHourRequest {
  MON?: DayHours;
  TUE?: DayHours;
  WED?: DayHours;
  THU?: DayHours;
  FRI?: DayHours;
  SAT?: DayHours;
  SUN?: DayHours;
}

export const initialOperatingHour: DefaultOperatingHour = {

  id: '',

  MON_isOpen: "true",
  MON_openTime: null,
  MON_closeTime: null,

  TUE_isOpen: true,
  TUE_openTime: null,
  TUE_closeTime: null,

  WED_isOpen: true,
  WED_openTime: null,
  WED_closeTime: null,

  THU_isOpen: true,
  THU_openTime: null,
  THU_closeTime: null,

  FRI_isOpen: true,
  FRI_openTime: null,
  FRI_closeTime: null,

  SAT_isOpen: true,
  SAT_openTime: null,
  SAT_closeTime: null,

  SUN_isOpen: true,
  SUN_openTime: null,
  SUN_closeTime: null,

  storeId: '',
  store: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};


export const initialStore: Store = {
  id: '',
  storeName: '',
  storeNameTH: '',
  storeUsername: '',
  lineOALink: '',
  detail: '',
  tel: '',
  addressCustom: '',
  mapUrl: '',

  isDelete: false,

  location: {
    latitude: null,
    longitude: null,
  },

  lineNotifyToken: undefined,
  lineChannelId: undefined,
  lineChannelSecret: undefined,

  newBooking: undefined,
  successBooking: undefined,
  cancelBooking: undefined,
  before24H: undefined,
  reSchedule: undefined,

  employeeSetting: {
    allowCustomerSelectEmployee: true,
    autoAssignEmployee: false,
    maxQueuePerEmployeePerDay: null // null หรือ 0 = ไม่จำกัด
  },
  bookingRule: {
    minAdvanceBookingHours: 3, // จองล่วงหน้าขั้นต่ำ (ชั่วโมง) 
    maxAdvanceBookingDays: 1, // จองล่วงหน้าสูงสุด (วัน)
    maxQueuePerPhone: 3 // จำนวนคิวสูงสุดต่อบริการ
  },
  cancelRule: {
    minCancelBeforeHours: 3,  // ต้องยกเลิกล่วงหน้ากี่ชั่วโมง (ชั่วโมง) 
    allowCustomerCancel: true,
  },

  userId: '',
  user: undefined,
  employees: undefined,
  services: undefined,
  bookings: undefined,

  operatingHours: initialOperatingHour,
  notifications: undefined,

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const initialService: Service = {
  id: '',
  name: '', // เช่น "ตัดผม 30 นาที"
  durationMinutes: 0, // กำหนดค่าเริ่มต้น
  price: 0.00, // หรือ 0.00
  discount: 0.00,
  // new column
  bufferTime: 0,
  detail: '',
  displayNumber: undefined,
  imageUrl: '',
  colorOfService: '',
  active: true,

  isDelete: false,

  storeId: '',
  store: undefined,
  employees: undefined,
  employeeIds: [],
  bookings: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

