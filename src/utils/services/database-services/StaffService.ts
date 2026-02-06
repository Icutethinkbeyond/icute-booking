import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";

const prisma = new PrismaClient();

export const StaffService = {
  // 1. ตรวจสอบพนักงานที่ไม่ว่าง (ติดลา หรือ ติดจอง)
  async getStaffAvailability(employeeId: string, date: Date) {
    const start = dayjs(date).startOf('day').toDate();
    const end = dayjs(date).endOf('day').toDate();

    const [leaves, bookings] = await Promise.all([
      prisma.employeeLeave.findMany({
        where: { employeeId, startDate: { lte: end }, endDate: { gte: start } }
      }),
      prisma.booking.findMany({
        where: { employeeId, bookingDate: { gte: start, lte: end }, status: 'CONFIRMED' }
      })
    ]);

    return { isOnLeave: leaves.length > 0, currentBookings: bookings };
  },

  // 2. ดึงพนักงานที่ทำบริการที่กำหนดได้ (ผ่าน relation services)
  async getStaffByService(serviceId: string) {
    return await prisma.employee.findMany({
      where: {
        services: {
          some: {
            id: serviceId
          }
        },
        isActive: true,
        isDelete: false
      }
    });
  }
};

export const CatalogService = {
  // ดึงรายการบริการที่พร้อม (active: true, isDelete: false)
  async getActiveServices(storeId: string) {
    return await prisma.service.findMany({
      where: { storeId, active: true, isDelete: false },
      orderBy: { displayNumber: 'asc' }
    });
  }
};