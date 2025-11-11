import { NotificationType, SendMethod } from "@prisma/client";
import { Store } from "./Store";
import { Booking } from "./Booking";

export interface Notification {
  id: string;

  // ข้อมูลการแจ้งเตือน
  type: NotificationType;
  method: SendMethod;
  message: string;
  targetAddress: string;

  // สถานะการส่ง
  isSent: boolean;
  sentAt?: string | null;
  errorMessage?: string | null;

  // ความสัมพันธ์
  storeId: string;
  store?: Store;

  bookingId?: string | null;
  booking?: Booking | null;

  lineUserId?: string | null;
}