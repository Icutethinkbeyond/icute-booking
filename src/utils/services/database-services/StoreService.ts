import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { OpenTimeRes } from "@/app/api/store/public/open-time-settings/route";

dayjs.extend(customParseFormat);
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

    // Type assertions for JSON fields to fix TypeScript errors
    const bookingRule = store.bookingRule as any;
    const cancelRule = store.cancelRule as any;
    const employeeSetting = store.employeeSetting as any;

    return {
      // การจอง
      minAdvanceMinutes: bookingRule?.minAdvanceBookingHours ? bookingRule.minAdvanceBookingHours * 60 : 0,
      maxAdvanceMinutes: bookingRule?.maxAdvanceBookingDays ? bookingRule.maxAdvanceBookingDays * 24 * 60 : 30 * 24 * 60,
      maxQueuePerPhone: bookingRule?.maxQueuePerPhone || 3,

      // การยกเลิก
      allowCancel: cancelRule?.allowCustomerCancel ?? true,
      minCancelMinutes: cancelRule?.minCancelBeforeHours ? cancelRule.minCancelBeforeHours * 60 : 0,

      // พนักงาน
      staffSelection: employeeSetting || {}, // { allowCustomerSelectEmployee, autoAssignEmployee, maxQueuePerEmployeePerDay }
    };
  },

  async isClosedNow(storeId: string, targetDate: Date = new Date()): Promise<OpenTimeRes> {

    const dayMap: Record<number, string> = {
      0: "SUN",
      1: "MON",
      2: "TUE",
      3: "WED",
      4: "THU",
      5: "FRI",
      6: "SAT",
    };


    const now = dayjs(targetDate);
    const day = now.date();
    const month = now.month() + 1;
    const prefix = dayMap[now.day()]; // เช่น "MON"

    // 1. ตรวจสอบวันหยุด (Holidays)
    const holiday = await prisma.holiday.findFirst({
      where: {
        storeId,
        OR: [
          { date: now.startOf("day").toDate() }, // วันหยุดพิเศษระบุวันที่
        ]
      }
    });

    if (holiday) {
      return {
        isClosed: true,
        reason: `วันหยุด: ${holiday.holidayName}`,
      };
    }

    // 2. ตรวจสอบเวลาทำการปกติ (Default Operating Hours)
    const workingDay: any = await prisma.defaultOperatingHour.findFirst({
      where: { storeId }
    });

    const isOpen = workingDay[`${prefix}_openTime`];;
    const openTimeDate = workingDay[`${prefix}_openTime`];
    const closeTimeDate = workingDay[`${prefix}_closeTime`];

    // 3. ตรวจสอบว่าวันนั้นร้านเปิดหรือไม่
    if (!isOpen) {
      return {
        isClosed: true,
        reason: `ร้านปิดทำการในวัน${prefix}`,
      };
    }

    // 4. เปรียบเทียบเวลา (เช็คเฉพาะ HH:mm)
    // เนื่องจากใน DB เก็บเป็น Date object เราจะดึงเฉพาะเวลามาเทียบ
    const currentTime = now.format("HH:mm");
    const openTime = dayjs(openTimeDate).format("HH:mm");
    const closeTime = dayjs(closeTimeDate).format("HH:mm");

    // ตรรกะการเปรียบเทียบ String เวลา (เช่น "09:00" <= "10:30" <= "18:00")
    const isWithinHours = currentTime >= openTime && currentTime <= closeTime;

    if (!isWithinHours) {
      return {
        isClosed: true,
        reason: `อยู่นอกเวลาทำการ (เปิด ${openTime} - ${closeTime})`,
      };
    }

    return {
      isClosed: false,
      reason: "ร้านเปิดให้บริการ",
    };
  }
};