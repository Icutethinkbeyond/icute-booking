import { BookingStatus } from "@prisma/client";
import { Employee, Service, Store } from "./Store";
import { Customer } from "./User";

export interface Booking {
  id: string;

  customerName: string;
  customerPhone: string;

  startTime: string; // ใช้ string เพราะจาก API มักส่ง ISO Date เช่น "2025-10-14T10:00:00Z"
  endTime: string;

  status: BookingStatus;
  isWalkIn: boolean;

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