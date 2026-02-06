import { NextRequest, NextResponse } from 'next/server';
import { Employee } from '@/interfaces/Store';

import { getCurrentUserAndStoreIdsByToken } from '@/utils/lib/auth';
import { prisma } from '@/../lib/prisma';


/**
 * GET /api/employees/detail?employeeId=[ID]
 * สำหรับดึงข้อมูลพนักงานรายบุคคล
 */
export async function GET(request: NextRequest) {
  try {
    // 1. ตรวจสอบสิทธิ์และดึง User ID และ Store ID จาก Token
    const { userId, storeId } = await getCurrentUserAndStoreIdsByToken(request);

    console.log(storeId)

    // 2. ดึง employeeId จาก Query Parameter
    const { searchParams } = request.nextUrl;
    const employeeId = searchParams.get('employeeId');

    // 3. Validation: ตรวจสอบว่ามี employeeId ส่งมาหรือไม่
    if (!employeeId) {
      return new NextResponse(
        JSON.stringify({
          message: 'กรุณาระบุ ID ของพนักงานที่ต้องการดึงข้อมูล',
        }),
        { status: 400 } // Bad Request
      );
    }
    
    // 4. ค้นหา Store ID (ขั้นตอนนี้ซ้ำซ้อนกับ token แต่ยืนยันความถูกต้อง)
    const store = await prisma.store.findUnique({
      where: {
        userId: userId
      },
      select: { id: true }
    });

    if (!store) {
      return new NextResponse(
        JSON.stringify({
          message: 'ไม่พบร้านค้าที่ผูกกับบัญชีผู้ใช้งานนี้ หรือผู้ใช้ไม่มีสิทธิ์',
        }),
        { status: 403 } // Forbidden
      );
    }

    // 5. ดึงข้อมูลพนักงานพร้อมตรวจสอบขอบเขต (Scope Check)
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        storeId: storeId, // <--- **การตรวจสอบสำคัญ:** ต้องเป็นของร้านนี้เท่านั้น!
      },
      include: {
        services: { // ดึงข้อมูลบริการที่พนักงานทำได้
          select: { id: true, name: true }
        },
        store: { // ดึงข้อมูลร้านค้าพื้นฐาน
            select: { storeName: true, id: true }
        },
        leaves: true,
        workingDays: {
          include: {
            timeSlots: true
          }
        }
      }
    });

    // 6. ตรวจสอบว่าพบพนักงานหรือไม่
    if (!employee) {
      return new NextResponse(
        JSON.stringify({
          message: 'ไม่พบพนักงานที่มี ID นี้ในร้านค้าของคุณ',
        }),
        { status: 404 } // Not Found
      );
    }

    const { password: _, ...employeeWithoutPassword } = employee;

    // 7. ตอบกลับสำเร็จ (200 OK)
    return new NextResponse(
      JSON.stringify({
        message: 'ดึงข้อมูลพนักงานสำเร็จ',
        data: employeeWithoutPassword,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error(`Error fetching employee (ID: ${request.nextUrl.searchParams.get('employeeId')}):`, error);

    // จัดการ Unauthorized Error จาก Token
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new NextResponse(
        JSON.stringify({
          message: 'ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบ'
        }), {
          status: 401
        }
      );
    }

    // 8. ตอบกลับเมื่อเกิดข้อผิดพลาดอื่น (500 Internal Server Error)
    return new NextResponse(
      JSON.stringify({
        message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ในการดึงข้อมูลพนักงาน'
      }), {
        status: 500
      }
    );
  }
}