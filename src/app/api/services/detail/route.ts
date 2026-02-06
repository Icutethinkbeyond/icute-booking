import { NextRequest, NextResponse } from 'next/server';
import { Employee } from '@/interfaces/Store';

import { getCurrentUserAndStoreIdsByToken } from '@/utils/lib/auth';
import { prisma } from '../../../../../lib/prisma';

/**
 * GET /api/services/detail?serviceId=[ID]
 * สำหรับดึงข้อมูลบริการรายบุคคล
 */
export async function GET(request: NextRequest) {
  try {
    // 1. ตรวจสอบสิทธิ์และดึง User ID และ Store ID จาก Token
    const { userId, storeId } = await getCurrentUserAndStoreIdsByToken(request);

    // 2. ดึง serviceId จาก Query Parameter
    const { searchParams } = request.nextUrl;
    // 💡 เปลี่ยนจาก employeeId เป็น serviceId
    const serviceId = searchParams.get('serviceId'); 

    // 3. Validation: ตรวจสอบว่ามี serviceId ส่งมาหรือไม่
    if (!serviceId) {
      return new NextResponse(
        JSON.stringify({
          // 💡 เปลี่ยนข้อความ
          message: 'กรุณาระบุ ID ของบริการที่ต้องการดึงข้อมูล',
        }),
        { status: 400 } // Bad Request
      );
    }
    
    // 4. (ลบการตรวจสอบ store ซ้ำซ้อนทิ้งไป)

    // 5. ดึงข้อมูลบริการพร้อมตรวจสอบขอบเขต (Scope Check)
    // 💡 เปลี่ยน Model จาก prisma.employee เป็น prisma.service
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId, // 💡 ใช้ serviceId
        storeId: storeId, // <--- **การตรวจสอบสำคัญ:** ต้องเป็นของร้านนี้เท่านั้น!
      },
      include: {
        // 💡 เปลี่ยนจากการ include services (ใน employee) เป็น include employees (ใน service)
        employees: { 
          select: { id: true, name: true, role: true }
        },
        store: { 
            select: { storeName: true, id: true }
        }
      }
    });

    // 6. ตรวจสอบว่าพบบริการหรือไม่
    if (!service) {
      return new NextResponse(
        JSON.stringify({
          // 💡 เปลี่ยนข้อความ
          message: 'ไม่พบบริการที่มี ID นี้ในร้านค้าของคุณ',
        }),
        { status: 404 } // Not Found
      );
    }

    // 7. ตอบกลับสำเร็จ (200 OK)
    return new NextResponse(
      JSON.stringify({
        // 💡 เปลี่ยนข้อความและชื่อ property ใน response
        message: 'ดึงข้อมูลบริการสำเร็จ',
        data: service,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error(`Error fetching service (ID: ${request.nextUrl.searchParams.get('serviceId')}):`, error); // 💡 เปลี่ยนข้อความ log

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
        // 💡 เปลี่ยนข้อความ
        message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ในการดึงข้อมูลบริการ'
      }), {
        status: 500
      }
    );
  }
}