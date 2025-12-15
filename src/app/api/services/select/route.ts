import { NextRequest, NextResponse } from 'next/server';
import { Employee } from '@/interfaces/Store';

import { PrismaClient } from "@prisma/client";
import { getCurrentUserAndStoreIdsByToken } from '@/utils/lib/auth';

const prisma = new PrismaClient();


/**
 * GET /api/services?shop_id=[ID]
 * ออกแบบมาเพื่อดึงข้อมูลไปใช้ใน Select / Dropdown
 */
export async function GET(request: NextRequest) {
  try {
    // 1. ตรวจสอบสิทธิ์ (Security)
    // สำหรับ Dropdown ในระบบหลังบ้าน ควรเช็คว่า User มีสิทธิ์ในร้านค้านี้จริงหรือไม่
    const { userId } = await getCurrentUserAndStoreIdsByToken(request);

    console.log(userId)

    // 2. ดึง shop_id จาก Query Parameter
    const { searchParams } = request.nextUrl;
    const shopId = searchParams.get('shop_id');

    if (!shopId) {
      return new NextResponse(
        JSON.stringify({ message: 'กรุณาระบุ shop_id' }),
        { status: 400 }
      );
    }

    // // ป้องกันการข้ามร้าน (Cross-store access)
    // if (tokenStoreId !== shopId) {
    //   return new NextResponse(
    //     JSON.stringify({ message: 'Unauthorized access to this store' }),
    //     { status: 403 }
    //   );
    // }

    // 3. ดึงข้อมูลบริการ
    const services = await prisma.service.findMany({
      where: {
        storeId: shopId,
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

    return new NextResponse(
      JSON.stringify({
        message: 'success',
        data: services,
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Fetch services for dropdown error:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}