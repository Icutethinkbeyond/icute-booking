import { BookingStatus, CustomerType } from "@prisma/client";
import { Employee, Service, Store } from "./Store";
import { Customer } from "./User";
import { Dayjs } from "dayjs";


export interface Booking {
  id: string;

  customerName: string;
  customerPhone: string;
  customerEmail?: string

  bookingDate: Dayjs | null | string; // ใช้ string เพราะจาก API มักส่ง ISO Date เช่น "2025-10-14T10:00:00Z"
  bookingTime: Dayjs | null | string;

  needSelectEmployee: AllowSelectEmpType | null | undefined;

  status: BookingStatus;
  customerType: CustomerType;

  storeId: string;
  store?: Store;

  serviceId: string;
  service?: Service;

  employeeId: string;
  employee?: Employee;

  customerId: string;
  customer?: Customer;

  notifications?: Notification[];

  createdAt: string;
  updatedAt: string;
}

export enum AllowSelectEmpType {
  withstaff = "with-staff",
  withoutstaff = "without-staff"
}

export const initialBooking: Booking = {
  id: '',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  needSelectEmployee: null,
  // กำหนดค่าเริ่มต้นเป็นเวลาปัจจุบัน (หรือเวลาที่คุณต้องการให้ฟอร์มเริ่มต้น)
  bookingDate: null,
  // endTime สามารถคำนวณจาก startTime + duration ของ service
  bookingTime: null, // ตัวอย่าง: +30 นาที
  status: 'PENDING' as BookingStatus, // กำหนดสถานะเริ่มต้น
  customerType: CustomerType.LINE,
  storeId: '',
  store: undefined,
  serviceId: '',
  service: undefined,
  employeeId: '',
  employee: undefined,
  customerId: '',
  customer: undefined,
  notifications: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};