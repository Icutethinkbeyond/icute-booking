import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const prisma = new PrismaClient();

export const StoreRuleService = {
  // 1. ตรวจสอบวันหยุด (Holiday Model)
  async checkIsHoliday(storeId: string, date: Date) {
    const targetDate = dayjs(date).startOf('day').toDate();
    const holiday = await prisma.holiday.findFirst({
      where: {
        storeId,
        date: targetDate,
        // isDelete: false // ถ้ามี field นี้ในอนาคต
      }
    });
    return !!holiday;
  },

  // 2. ตรวจสอบเวลาเปิด-ปิด (DefaultOperatingHour Model)
  // ใช้ dynamic access สำหรับ field เช่น MON_isOpen, MON_openTime
  async getStoreTiming(storeId: string, day: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN") {
    const hours = await prisma.defaultOperatingHour.findUnique({
      where: { storeId }
    });
    if (!hours) return null;

    return {
      isOpen: hours[`${day}_isOpen` as keyof typeof hours],
      openTime: hours[`${day}_openTime` as keyof typeof hours],
      closeTime: hours[`${day}_closeTime` as keyof typeof hours],
    };
  },

  // 3. ตรวจสอบเงื่อนไขการจองและการยกเลิก (แปลงเป็นนาที)
  async getBookingRules(storeId: string) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { bookingRule: true, cancelRule: true, employeeSetting: true }
    });
    if (!store) return null;

    return {
      // การจอง
      minAdvanceMinutes: store.bookingRule.minAdvanceBookingHours * 60,
      maxAdvanceMinutes: store.bookingRule.maxAdvanceBookingDays * 24 * 60,
      maxQueuePerPhone: store.bookingRule.maxQueuePerPhone,
      
      // การยกเลิก
      allowCancel: store.cancelRule.allowCustomerCancel,
      minCancelMinutes: store.cancelRule.minCancelBeforeHours * 60,

      // พนักงาน
      staffSelection: store.employeeSetting, // { allowCustomerSelectEmployee, autoAssignEmployee, maxQueuePerEmployeePerDay }
    };
  }

  async isClosedNow(storeId: string, targetDate: Date = new Date()) {
    const now = dayjs(targetDate);
    const day = now.date();
    const month = now.month() + 1;
    const dayOfWeek = now.day(); // 0 (อาทิตย์) - 6 (เสาร์)
    const currentTime = now.format("HH:mm");

    // 1. ตรวจสอบวันหยุด (Holidays)
    const holiday = await prisma.storeHoliday.findFirst({
      where: {
        storeId,
        OR: [
          { date: now.startOf("day").toDate() }, // วันหยุดพิเศษระบุวันที่
          { isAnnual: true, day, month }         // วันหยุดประจำปี (เช่น 1 ม.ค.)
        ]
      }
    });

    if (holiday) {
      return { 
        isClosed: true, 
        reason: `วันหยุด: ${holiday.name}`,
        type: "HOLIDAY" 
      };
    }

    // 2. ตรวจสอบเวลาทำการปกติ (Default Operating Hours)
    const workingDay = await prisma.defaultOperatingHour.findFirst({
      where: { storeId, dayOfWeek }
    });

    // ถ้าไม่มีการตั้งค่า หรือตั้งว่าปิด (isOpen: false)
    if (!workingDay || !workingDay.isOpen) {
      return { 
        isClosed: true, 
        reason: "ร้านปิดทำการในวันนี้",
        type: "OFF_DAY" 
      };
    }

    // 3. ตรวจสอบช่วงเวลา (Time Range)
    // เปรียบเทียบ String "HH:mm" ได้เลย เช่น "09:00" <= "10:30" <= "18:00"
    const isWithinOperatingHours = 
      currentTime >= workingDay.openTime && 
      currentTime <= workingDay.closeTime;

    if (!isWithinOperatingHours) {
      return { 
        isClosed: true, 
        reason: `อยู่นอกเวลาทำการ (เปิด ${workingDay.openTime} - ${workingDay.closeTime})`,
        type: "OUT_OF_HOURS" 
      };
    }

    // ถ้าผ่านทุกเงื่อนไข แปลว่าร้านเปิดอยู่
    return { 
      isClosed: false, 
      reason: "ร้านเปิดให้บริการ",
      type: "OPEN" 
    };
  }
};