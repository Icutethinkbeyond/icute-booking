import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client"; // นำเข้า Prisma Client
import { DefaultOperatingHour, Store } from '@/interfaces/Store';
import { getCurrentUserAndStoreIdsByToken } from '@/utils/lib/auth';
import { checkBooleanValue, getTimeAsDateTime } from "@/utils/lib/utils"
import { OperatingHourRequest } from "@/interfaces/Store"

const prisma = new PrismaClient();


// --------------------------------------------------------------------------
// 2. GET METHOD: ดึงข้อมูล (สำหรับดึงข้อมูลมาแสดงในหน้าตั้งค่า)
// --------------------------------------------------------------------------
/**
 * GET /api/settings/operating-hours
 * สำหรับดึงเวลาทำการเริ่มต้นของร้านค้า
 */
export async function GET(request: NextRequest) {
    try {
        const { storeId } = await getCurrentUserAndStoreIdsByToken(request);

        const operatingHours = await prisma.defaultOperatingHour.findUnique({
            where: { storeId: storeId }
        });

        if (!operatingHours) {
            return new NextResponse(
                JSON.stringify({ message: 'ไม่พบข้อมูลเวลาทำการเริ่มต้นสำหรับร้านค้านี้' }),
                { status: 404 }
            );
        }

        return new NextResponse(
            JSON.stringify({
                message: 'ดึงข้อมูลเวลาทำการเริ่มต้นสำเร็จ',
                data: operatingHours
            }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }
        );
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return new NextResponse(
                JSON.stringify({ message: 'ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบ' }),
                { status: 401 }
            );
        }
        return new NextResponse(
            JSON.stringify({ message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ในการดึงข้อมูลเวลาทำการ' }),
            { status: 500 }
        );
    }
}

// --------------------------------------------------------------------------
// 1. PATCH METHOD: เพิ่ม/อัปเดตเวลาทำการ (ใช้ Upsert)
// --------------------------------------------------------------------------
/**
 * PATCH /api/settings/operating-hours
 * สำหรับสร้างหรืออัปเดตเวลาทำการเริ่มต้นของร้านค้า (ใช้ Upsert)
 */
export async function PATCH(request: NextRequest) {
    try {
        // 1. ตรวจสอบสิทธิ์และดึง Store ID
        const { storeId } = await getCurrentUserAndStoreIdsByToken(request);

        // 2. ดึงข้อมูลจาก request
        const {
            MON_isOpen,
            MON_openTime,
            MON_closeTime,
            TUE_isOpen,
            TUE_openTime,
            TUE_closeTime,
            WED_isOpen,
            WED_openTime,
            WED_closeTime,
            THU_isOpen,
            THU_openTime,
            THU_closeTime,
            FRI_isOpen,
            FRI_openTime,
            FRI_closeTime,
            SAT_isOpen,
            SAT_openTime,
            SAT_closeTime,
            SUN_isOpen,
            SUN_openTime,
            SUN_closeTime
        }: DefaultOperatingHour = await request.json();

        // const dataToUpdate = mapRequestToPrismaData(requestData);

        const dataToUpdate = {
            MON_isOpen: checkBooleanValue(MON_isOpen),
            MON_openTime: getTimeAsDateTime(MON_openTime),
            MON_closeTime: getTimeAsDateTime(MON_closeTime),
            TUE_isOpen: checkBooleanValue(TUE_isOpen),
            TUE_openTime: getTimeAsDateTime(TUE_openTime),
            TUE_closeTime: getTimeAsDateTime(TUE_closeTime),
            WED_isOpen: checkBooleanValue(WED_isOpen),
            WED_openTime: getTimeAsDateTime(WED_openTime),
            WED_closeTime: getTimeAsDateTime(WED_closeTime),
            THU_isOpen: checkBooleanValue(THU_isOpen),
            THU_openTime: getTimeAsDateTime(THU_openTime),
            THU_closeTime: getTimeAsDateTime(THU_closeTime),
            FRI_isOpen: checkBooleanValue(FRI_isOpen),
            FRI_openTime: getTimeAsDateTime(FRI_openTime),
            FRI_closeTime: getTimeAsDateTime(FRI_closeTime),
            SAT_isOpen: checkBooleanValue(SAT_isOpen),
            SAT_openTime: getTimeAsDateTime(SAT_openTime),
            SAT_closeTime: getTimeAsDateTime(SAT_closeTime),
            SUN_isOpen: checkBooleanValue(SUN_isOpen),
            SUN_openTime: getTimeAsDateTime(SUN_openTime),
            SUN_closeTime: getTimeAsDateTime(SUN_closeTime),
        }

        // console.log(dataToUpdate)

        // if (Object.keys(dataToUpdate).length === 0) {
        //     return new NextResponse(
        //         JSON.stringify({ message: 'ไม่พบข้อมูลที่ถูกต้องสำหรับอัปเดต' }),
        //         { status: 400 }
        //     );
        // }

        // 3. ใช้ Upsert: ค้นหาด้วย storeId หากไม่พบให้สร้าง, หากพบให้อัปเดต
        const updatedOperatingHour = await prisma.defaultOperatingHour.upsert({
            where: {
                storeId: storeId, // 🔑 ใช้ Unique Constraint ของ storeId ในการค้นหา
            },
            update: dataToUpdate, // หากพบ, อัปเดตข้อมูลที่ส่งมา
            create: {
                storeId: storeId,
                ...dataToUpdate, // หากไม่พบ, สร้าง Record ใหม่พร้อมข้อมูลที่ส่งมา
                // Note: Prisma จะใช้ @default(true) สำหรับ _isOpen fields ที่ขาดไป
            },
        });

        // 4. ตอบกลับสำเร็จ (200 OK)
        return new NextResponse(
            JSON.stringify({
                message: 'อัปเดตเวลาทำการเริ่มต้นสำเร็จ',
                data: updatedOperatingHour,
            }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }
        );

    } catch (error) {
        console.error('Error updating default operating hours:', error);

        if (error instanceof Error && error.message === 'Unauthorized') {
            return new NextResponse(
                JSON.stringify({ message: 'ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบ' }),
                { status: 401 }
            );
        }

        return new NextResponse(
            JSON.stringify({
                message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ในการอัปเดตเวลาทำการ'
            }), {
            status: 500
        }
        );
    }
}