import { RoleName } from "@prisma/client";
import { User } from "./User";
import { Booking } from "./Booking";
import { Dayjs } from "dayjs";


export interface StoreRegister {
  storeName: string;
  storeUsername: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean
}

export const initialStoreRegister: StoreRegister = {
  storeName: '',
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

export interface Employee {
  id: string;
  name: string; // "พี่แอน"
  role: string; // "ช่างทำผม"
  isActive: boolean; // สถานะพร้อมให้บริการ

  storeId: string;
  store?: Store;

  bookings?: Booking[];
  services?: Service[];
  serviceIds: string[];

  userId: string;

  createdAt: string; // ISO Date
  updatedAt: string; // ISO Date
}

export interface Store {
  id: string;
  storeName: string;
  storeUsername: string;
  lineOALink?: string

  lineNotifyToken?: string;
  lineChannelId?: string;
  lineChannelSecret?: string;

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
}

export interface EmployeeList {
  id: string;
  name: string; // เช่น "ตัดผม 30 นาที"
}


export interface Service {
  id: string;
  name: string; // เช่น "ตัดผม 30 นาที"
  durationMinutes: number;
  price?: number;
  discount?: number;

  // new column
  bufferTime?: number;
  detail?: string;
  displayNumber?: number;
  image?: string;
  colorOfService?: string;
  active: boolean | string

  storeId: string;
  store?: Store;

  employees?: Employee[];
  employeeIds: string[];
  bookings?: Booking[];

  createdAt: string;
  updatedAt: string;
}


export const initialEmployee: Employee = {
  id: '',
  name: '', // หรือ "พี่แอน"
  role: '', // หรือ "ช่างทำผม"
  isActive: true, // เริ่มต้นให้พร้อมให้บริการ
  storeId: '',
  store: undefined,
  bookings: undefined,
  services: undefined,
  serviceIds: [],
  userId: '',
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

  // 2. สถานะและเวลาทำการปกติ
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
  storeUsername: '',
  lineOALink: '',

  lineNotifyToken: undefined,
  lineChannelId: undefined,
  lineChannelSecret: undefined,

  newBooking: undefined,
  successBooking: undefined,
  cancelBooking: undefined,
  before24H: undefined,
  reSchedule: undefined,

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
  durationMinutes: 30, // กำหนดค่าเริ่มต้น
  price: undefined, // หรือ 0.00
    // new column
  bufferTime: undefined,
  detail: '',
  displayNumber: undefined,
  image: '',
  colorOfService: '',
  active: false,

  storeId: '',
  store: undefined,
  employees: undefined,
  employeeIds: [],
  bookings: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

