import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserAndStoreIdsByToken } from '@/utils/lib/auth';
import { prisma } from "@/../lib/prisma";

/**
 * GET /api/employees/simple
 * สำหรับดึงรายชื่อพนักงานเฉพาะ ID และ Name ของร้านค้าปัจจุบัน
 */
export async function GET(request: NextRequest) {
    try {
        // 1. ตรวจสอบสิทธิ์และดึง storeId ของ User ที่ Login อยู่
        const { storeId } = await getCurrentUserAndStoreIdsByToken(request);

        // 2. ดึงข้อมูลพนักงาน
        // 3. ดึงข้อมูลบริการ
        const services = await prisma.service.findMany({
            where: {
                storeId: storeId,
                // คุณอาจเพิ่ม isActive: true ตรงนี้ถ้ามี field นี้ใน DB
            },
            orderBy: {
                name: 'asc', // เรียงตามชื่อเพื่อให้หาใน Dropdown ง่ายขึ้น
            },
            select: {
                id: true,         // สำหรับ value ใน Dropdown
                name: true,       // สำหรับ label ใน Dropdown
                price: true,      // เผื่อใช้แสดงราคาข้างชื่อบริการ
                durationMinutes: true, // เผื่อใช้คำนวณเวลาจองทันทีที่เลือก
            }
        });

        // 3. ส่งข้อมูลกลับ
        return new NextResponse(
            JSON.stringify({
                message: 'ดึงข้อมูลบริการ​สำเร็จ',
                data: services,
            }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }
        );

    } catch (error) {
        console.error('Fetch simple employees error:', error);

        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json(
            { message: 'เกิดข้อผิดพลาดในการดึงรายชื่อพนักงาน' },
            { status: 500 }
        );
    }
}