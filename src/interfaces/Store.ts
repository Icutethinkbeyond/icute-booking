import { RoleName } from "@prisma/client";
import { User } from "./User";
import { Booking } from "./Booking";

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
  weeklyHolidays: number[]; // เช่น [1, 7]
  defaultOpenTime: string; // "09:00"
  defaultCloseTime: string; // "18:00"

  lineNotifyToken?: string;
  lineChannelId?: string;
  lineChannelSecret?: string;

  userId: string;
  user?: User;

  employees?: Employee[];
  services?: Service[];
  bookings?: Booking[];
  operatingHours?: OperatingHour[];
  notifications?: Notification[];

  createdAt: string;
  updatedAt: string;
}

export interface OperatingHour {
  id: string;
  date: string; // DateTime
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;

  storeId: string;
  store?: Store;

  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string; // เช่น "ตัดผม 30 นาที"
  durationMinutes: number;
  price?: number;

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

export const initialStore: Store = {
  id: '',
  storeName: '',
  storeUsername: '',
  weeklyHolidays: [], // ไม่มีวันหยุดประจำสัปดาห์เริ่มต้น
  defaultOpenTime: '09:00',
  defaultCloseTime: '18:00',
  lineNotifyToken: undefined,
  lineChannelId: undefined,
  lineChannelSecret: undefined,
  userId: '',
  user: undefined,
  employees: undefined,
  services: undefined,
  bookings: undefined,
  operatingHours: undefined,
  notifications: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const initialOperatingHour: OperatingHour = {
  id: '',
  date: new Date().toISOString(), // วันที่ปัจจุบัน
  isOpen: true,
  openTime: '09:00',
  closeTime: '18:00',
  storeId: '',
  store: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const initialService: Service = {
  id: '',
  name: '', // เช่น "ตัดผม 30 นาที"
  durationMinutes: 30, // กำหนดค่าเริ่มต้น
  price: undefined, // หรือ 0.00
  storeId: '',
  store: undefined,
  employees: undefined,
  employeeIds: [],
  bookings: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

