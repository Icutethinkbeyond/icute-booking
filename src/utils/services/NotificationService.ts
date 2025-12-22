// services/notification-service.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
import { sendLinePushMessage } from '../lib/line-messaging';
import { formatTemplate } from '../lib/utils'

export async function notifyBookingEvent(eventType: string, bookingId: string) {
//   // 1. ดึงข้อมูลการจองและ User
//   const booking = await prisma.booking.findUnique({
//     where: { id: bookingId },
//     include: { user: true, service: true, store: true }
//   });

//   if (!booking || !booking.user?.lineUserId) return;

//   // 2. ดึง Template ข้อความจาก DB ตาม Event Type
//   const setting = await prisma.lineNotificationSetting.findFirst({
//     where: { 
//         storeId: booking.storeId,
//         eventType: eventType 
//     }
//   });

//   if (!setting || !setting.isActive) return;

//   // 3. เตรียมข้อมูลสำหรับแทนที่ใน Template
//   const templateData = {
//     customerName: booking.customerName,
//     serviceName: booking.service?.name || 'บริการ',
//     date: new Date(booking.bookingDate).toLocaleDateString('th-TH'),
//     time: booking.bookingTime.toString(),
//     storeName: booking.store?.storeName || '',
//   };

//   const formattedText = formatTemplate(setting.messageTemplate, templateData);

//   // 4. ส่งข้อความ (ตัวอย่างแบบ Text ธรรมดา)
//   return await sendLinePushMessage(booking.user.lineUserId, [
//     {
//       type: 'text',
//       text: formattedText,
//     },
//   ]);
}