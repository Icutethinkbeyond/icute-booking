// services/notification-flex-service.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import { sendLinePushMessage } from '../lib/line-messaging';
import { buildBookingFlexPayload } from '@/utils/lib/line-flex-templates';

/**
 * ฟังก์ชันใหม่: ส่งการแจ้งเตือนแบบ Flex Message
 */
export async function notifyBookingFlexEvent(eventType: string, bookingId: string) {
//   // 1. ดึงข้อมูลการจอง
//   const booking = await prisma.booking.findUnique({
//     where: { id: bookingId },
//     include: { service: true, store: true, user: true }
//   });

//   if (!booking || !booking.user?.lineUserId) return;

//   // 2. กำหนด Title และสี ตาม Event Type
//   let title = "รายละเอียดการจอง";
//   let color = "#111111"; // สีดำเริ่มต้น

//   switch (eventType) {
//     case 'NEW_BOOKING':
//       title = "ได้รับการจองใหม่";
//       color = "#005cfc"; // น้ำเงิน
//       break;
//     case 'BOOKING_SUCCESS':
//       title = "ยืนยันการจองสำเร็จ";
//       color = "#00b900"; // เขียว
//       break;
//     case 'BOOKING_CANCELLED':
//       title = "การจองถูกยกเลิก";
//       color = "#ff4b4b"; // แดง
//       break;
//     case 'REMINDER_24H':
//       title = "แจ้งเตือนการนัดหมาย";
//       color = "#f5a623"; // ส้ม
//       break;
//   }

//   // 3. เตรียมข้อมูลสำหรับส่งเข้า Flex Template
//   const flexData = {
//     id: booking.id,
//     storeName: booking.store?.storeName || "ร้านค้าของเรา",
//     serviceName: booking.service?.name || "บริการ",
//     date: new Date(booking.bookingDate).toLocaleDateString('th-TH'),
//     time: booking.bookingTime.toString(),
//   };

//   // 4. สร้าง Payload
//   const flexPayload = buildBookingFlexPayload(title, color, flexData);

//   // 5. ส่งผ่าน API (เรียกใช้ฟังก์ชันเดิมที่เรามี)
//   return await sendLinePushMessage(booking.user.lineUserId, [flexPayload]);
}