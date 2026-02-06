import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserAndStoreIdsByToken } from '@/utils/lib/auth';
import { prisma } from "@/../lib/prisma";

export const dynamic = "force-dynamic"

/**
 * GET /api/employees/simple
 * สำหรับดึงรายชื่อพนักงานเฉพาะ ID และ Name ของร้านค้าปัจจุบัน
 */
export async function GET(request: NextRequest) {
    try {
        // 1. ตรวจสอบสิทธิ์และดึง storeId ของ User ที่ Login อยู่
        const { storeId } = await getCurrentUserAndStoreIdsByToken(request);

        // 2. ดึงข้อมูลพนักงาน
        const employees = await prisma.employee.findMany({
            where: {
                storeId: storeId,
                // isActive: true // (แนะนำ) ถ้ามีฟิลด์สถานะ ควรกรองเฉพาะคนที่ยังทำงานอยู่
            },
            // 🎯 ดึงเฉพาะ id และ name ตามที่ต้องการ
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: 'asc', // เรียงลำดับตามชื่อเพื่อให้อ่านง่าย
            },
        });

        // 3. ส่งข้อมูลกลับ
        return new NextResponse(
            JSON.stringify({
                message: 'ดึงข้อมูลพนักงานสำเร็จ',
                data: employees,
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