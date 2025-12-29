// app/api/services/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client"; // นำเข้า Prisma Client
import { Service } from '@/interfaces/Store';
import { getCurrentUserAndStoreIdsByToken } from '@/utils/lib/auth';

const prisma = new PrismaClient();

/**
 * POST /api/services
 * สำหรับเพิ่มบริการใหม่
 */
export async function POST(request: NextRequest) {
  try {

    const { userId } = await getCurrentUserAndStoreIdsByToken(request);

    const data: Service = await request.json();
    const {
      name,
      durationMinutes,
      price,
      employeeIds = [], // กำหนดค่าเริ่มต้นเป็น array ว่างหากไม่ได้ส่งมา
      discount,
      bufferTime,
      detail,
      displayNumber,
      image,
      colorOfService,
      active,
    } = data;

    //  ค้นหา Store ID ที่ผูกกับ User ID นี้
    const store = await prisma.store.findUnique({
      where: {
        userId: userId
      },
      select: { id: true }
    });

    if (!store) {
      // หากไม่พบ Store ที่ผูกกับ User
      return new NextResponse(
        JSON.stringify({
          message: 'ไม่พบร้านค้าที่ผูกกับบัญชีผู้ใช้งานนี้ หรือผู้ใช้ไม่มีสิทธิ์',
        }),
        { status: 403 }
      );
    }

    const storeId = store.id;

    // --- 1. การตรวจสอบความถูกต้องของข้อมูล (Validation) ---

    if (!name || name.trim() === '') {
      return new NextResponse(
        JSON.stringify({
          message: 'กรุณาระบุชื่อบริการ',
        }),
        { status: 400 })

    }

    if (!durationMinutes || durationMinutes <= 0) {
      return new NextResponse(
        JSON.stringify({
          message: 'กรุณาระบุระยะเวลาการใช้บริการที่ถูกต้อง (เป็นนาที)',
        }),
        { status: 400 })
    }

    if (!storeId || storeId.trim() === '') {
      // API นี้ต้องรู้ว่าบริการนี้เป็นของร้านไหน
      return new NextResponse(
        JSON.stringify({
          message: 'ไม่พบ Store ID ที่จำเป็นในการสร้างบริการ',
        }),
        { status: 400 })
    }

    // (Optional) ตรวจสอบว่า storeId มีอยู่จริง
    const existingStore = await prisma.store.findUnique({
      where: { id: storeId }
    });
    if (!existingStore) {
      return NextResponse.json({ message: 'Store ID ไม่ถูกต้องหรือไม่พบร้านค้านี้' }, { status: 404 });
    }


    // --- 2. การสร้าง Service ในฐานข้อมูล ---

    // สร้าง Array ของ Employee IDs สำหรับการเชื่อมโยง (connect)
    const employeeConnects = employeeIds.map(id => ({ id }));

    const maxDisplayNumberRow = await prisma.service.findFirst({
      where: {
        storeId: storeId,
        displayNumber: {
          not: null,
        },
      },
      orderBy: {
        displayNumber: "desc",
      },
      select: {
        displayNumber: true,
      },
    });

    let nextDisplayNumber = maxDisplayNumberRow?.displayNumber
      ? maxDisplayNumberRow.displayNumber + 1
      : 1;

    const newService = await prisma.service.create({
      data: {

        name: name,
        durationMinutes: typeof durationMinutes === 'string' ? parseInt(durationMinutes) : durationMinutes,
        price: typeof price === 'string' ? parseFloat(price) : null, // ถ้า price เป็น undefined ให้ใส่ null
        storeId: storeId,
        discount,
        bufferTime,
        detail,
        displayNumber: typeof nextDisplayNumber === 'string' ? parseInt(nextDisplayNumber) : nextDisplayNumber,
        imageURL: null,
        imageId: null,
        colorOfService,
        active: typeof active === 'string' ? Boolean(active) : active,

        // เชื่อมโยงพนักงานที่เกี่ยวข้องทันที
        employees: {
          connect: employeeConnects,
        },

        // fields อื่นๆ จะถูกกำหนดโดย @default(now()) และ @updatedAt โดย Prisma
      },
      // สามารถรวม Employee และ Store ที่เกี่ยวข้องในการตอบกลับได้
      include: {
        employees: {
          select: { id: true, name: true } // เลือกเฉพาะ ID และชื่อพนักงาน
        },
        store: {
          select: { id: true, storeName: true }
        }
      }
    });

    // --- 3. ตอบกลับสำเร็จ ---
    return new NextResponse(
      JSON.stringify({
        message: 'เพิ่มบริการใหม่สำเร็จแล้ว',
        service: newService
      }),
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating new service:', error);

    // 4. ตอบกลับเมื่อเกิดข้อผิดพลาด
    return new NextResponse(JSON.stringify({ message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ในการเพิ่มบริการ', }), { status: 500 });
  }
}


/**
 * GET /api/services?page=1&pageSize=10
 * สำหรับดึงรายการบริการทั้งหมดของร้านค้า พร้อม Pagination
 */
export async function GET(request: NextRequest) {
  try {
    // 1. ตรวจสอบสิทธิ์และดึง User ID
    // (ฟังก์ชัน getCurrentUserId ต้องจัดการ Header หรือ Cookie เพื่อดึงข้อมูล Session)
    // const currentUserId = await getCurrentUserId(request);
    const { userId, storeId } = await getCurrentUserAndStoreIdsByToken(request);

    // 2. ค้นหา Store ID ที่ผูกกับ User ID นี้ (Authorization)
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
        { status: 403 }
      );
    }

    // const storeId = store.id;

    // 3. จัดการ Pagination Params
    const { searchParams } = new URL(request.url);

    // ดึงค่า page และ pageSize จาก Query Parameter
    const page = parseInt(searchParams.get('page') || '1', 10); // หน้าเริ่มต้นที่ 1
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10); // จำนวนข้อมูลต่อหน้าเริ่มต้นที่ 10

    // ตรวจสอบค่าที่รับมา
    if (page < 1 || pageSize < 1 || pageSize > 100) { // จำกัด pageSize ไม่ให้มากเกินไป
      return new NextResponse(
        JSON.stringify({ message: 'ค่า page ต้อง >= 1 และ pageSize ต้องอยู่ระหว่าง 1 ถึง 100' }),
        { status: 400 }
      );
    }

    // คำนวณ skip และ take ตามสูตร
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // 4. ดึงข้อมูลบริการและจำนวนรวมด้วย Transaction
    const [totalItems, services] = await prisma.$transaction([
      // A. นับจำนวนรายการทั้งหมด
      prisma.service.count({
        where: { storeId }
      }),
      // B. ดึงรายการบริการแบบ Paginate
      prisma.service.findMany({
        where: { storeId },
        skip: skip,
        take: take,
        orderBy: {
          createdAt: 'desc', // เรียงลำดับจากใหม่ไปเก่า
        },
        include: {
          employees: { // ดึงข้อมูลพนักงานที่เกี่ยวข้องมาด้วย
            select: { userId: true, name: true }
          }
        }
      })
    ]);

    // 5. คำนวณ Total Pages
    const totalPages = Math.ceil(totalItems / pageSize);

    // เพิ่ม rowIndex ในข้อมูลแต่ละแถว
    const dataWithIndex = services.map((service, index) => ({
      ...service,
      rowIndex: skip + index + 1, // ลำดับแถวเริ่มต้นจาก 1 และเพิ่มตาม pagination
    }));

    // 6. ตอบกลับสำเร็จ (200 OK)
    return new NextResponse(
      JSON.stringify({
        message: 'ดึงรายการบริการสำเร็จ',
        data: dataWithIndex,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          pageSize: pageSize,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
    );

  } catch (error) {
    console.error('Error fetching services with pagination:', error);

    // จัดการ Unauthorized Error ที่อาจถูก throw จาก getCurrentUserId
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new NextResponse(
        JSON.stringify({
          message: 'ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบ'
        }), {
        status: 401
      }
      );
    }

    // 7. ตอบกลับเมื่อเกิดข้อผิดพลาดอื่น (500 Internal Server Error)
    return new NextResponse(
      JSON.stringify({
        message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ในการดึงรายการบริการ'
      }), {
      status: 500
    }
    );
  }
}

/**
 * PATCH /api/services/detail?serviceId=[ID]
 * สำหรับอัปเดตข้อมูลบริการ
 */
export async function PATCH(request: NextRequest) {
  try {
    // 1. ตรวจสอบสิทธิ์และดึง Store ID จาก Token
    const { storeId } = await getCurrentUserAndStoreIdsByToken(request);

    // ดึงข้อมูลอัปเดตจาก Body
    const updateData: Service = await request.json();
    const { price, name, durationMinutes, id } = updateData;
    // const { employeeIds, ...otherUpdateData } = updateData; // แยก employeeIds ออกมาก่อน

    // 3. Validation: ตรวจสอบ ID
    if (!id) {
      return new NextResponse(
        JSON.stringify({ message: 'กรุณาระบุ ID ของบริการที่ต้องการอัปเดต' }),
        { status: 400 } // Bad Request
      );
    }

    // 4. เตรียมข้อมูลสำหรับอัปเดต
    // const dataToUpdate: any = {
    //   ...otherUpdateData
    // };

    // จัดการการอัปเดตความสัมพันธ์กับพนักงาน (Employees)
    // if (employeeIds !== undefined) {
    //   // สร้างรายการสำหรับเชื่อมโยง (connect) ใหม่ทั้งหมด
    //   const employeeConnects = employeeIds.map(id => ({ id }));
    //   dataToUpdate.employees = {
    //     // ใช้ 'set' เพื่อแทนที่รายการพนักงานเดิมทั้งหมดด้วยรายการใหม่ที่ส่งมา
    //     set: employeeConnects
    //   };
    // }

    // ตรวจสอบว่ามีข้อมูลให้อัปเดตหรือไม่
    // if (Object.keys(dataToUpdate).length === 0) {
    //   return new NextResponse(
    //     JSON.stringify({ message: 'ไม่พบข้อมูลที่ต้องการอัปเดต' }),
    //     { status: 400 }
    //   );
    // }

    // 5. อัปเดตข้อมูลบริการพร้อมตรวจสอบขอบเขต (Scope Check)
    // 💡 เปลี่ยนจาก prisma.employee.update เป็น prisma.service.update
    const updatedService = await prisma.service.update({
      where: {
        id: id,
        storeId: storeId, // <--- **การตรวจสอบสำคัญ:** ต้องเป็นของร้านนี้เท่านั้น!
      },
      data: {
        name,
        durationMinutes: typeof durationMinutes === 'string' ? parseInt(durationMinutes) : durationMinutes,
        price: typeof price === 'string' ? parseFloat(price) : null, // ถ้า price เป็น undefined ให้ใส่ null
      },
      // include: {
      //   employees: { // ดึงข้อมูลพนักงานที่เกี่ยวข้องมาด้วย
      //     select: { id: true, name: true }
      //   }
      // }
    });

    // 6. ตอบกลับสำเร็จ (200 OK)
    return new NextResponse(
      JSON.stringify({
        message: 'อัปเดตข้อมูลบริการสำเร็จ',
        service: updatedService,
      }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
    );

  } catch (error) {
    console.error(`Error updating service:`, error);

    // จัดการ Unauthorized Error จาก Token
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new NextResponse(
        JSON.stringify({ message: 'ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบ' }),
        { status: 401 }
      );
    }

    // จัดการ Error กรณีไม่พบ Record (RecordNotFound)
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return new NextResponse(
        // 💡 เปลี่ยนข้อความ
        JSON.stringify({ message: 'ไม่พบบริการที่มี ID นี้ในร้านค้าของคุณ' }),
        { status: 404 }
      );
    }

    // 7. ตอบกลับเมื่อเกิดข้อผิดพลาดอื่น (500 Internal Server Error)
    return new NextResponse(
      JSON.stringify({
        // 💡 เปลี่ยนข้อความ
        message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ในการอัปเดตข้อมูลบริการ'
      }), {
      status: 500
    }
    );
  }
}

// --------------------------------------------------------------------------
// DELETE METHOD: ลบข้อมูลบริการ
// --------------------------------------------------------------------------
/**
 * DELETE /api/services/detail?serviceId=[ID]
 * สำหรับลบข้อมูลบริการ
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. ตรวจสอบสิทธิ์และดึง Store ID จาก Token
    // 🔑 การตรวจสอบนี้สำคัญมากสำหรับการยืนยันสิทธิ์
    const { storeId } = await getCurrentUserAndStoreIdsByToken(request);

    // 2. ดึง serviceId จาก Query Parameter
    const { searchParams } = request.nextUrl;
    const serviceId = searchParams.get('serviceId');

    // 3. Validation: ตรวจสอบ ID
    if (!serviceId) {
      return new NextResponse(
        JSON.stringify({ message: 'กรุณาระบุ ID ของบริการที่ต้องการลบ' }),
        { status: 400 } // Bad Request
      );
    }

    // 4. ดำเนินการลบบริการพร้อมตรวจสอบขอบเขต (Scope Check)
    // 💡 เราใช้ findUnique แทน findFirst เพื่อให้มั่นใจว่าการลบนั้นตรงเป๊ะ
    const deletedService = await prisma.service.delete({
      where: {
        id: serviceId,
        storeId: storeId, // <--- **Scope Check:** ต้องเป็นของร้านนี้เท่านั้น!
      },
      select: { id: true, name: true } // ดึง ID และชื่อมาเพื่อใช้ในการตอบกลับ
    });

    // 5. ตอบกลับสำเร็จ (200 OK)
    return new NextResponse(
      JSON.stringify({
        message: `ลบบริการชื่อ "${deletedService.name}" สำเร็จแล้ว`,
        serviceId: deletedService.id,
      }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
    );

  } catch (error) {
    console.error(`Error deleting service (ID: ${request.nextUrl.searchParams.get('serviceId')}):`, error);

    // จัดการ Unauthorized Error จาก Token
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new NextResponse(
        JSON.stringify({ message: 'ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบ' }),
        { status: 401 }
      );
    }

    // จัดการ Error กรณีไม่พบ Record (Record to delete does not exist)
    if (error instanceof Error && error.message.includes('Record to delete not found')) {
      return new NextResponse(
        JSON.stringify({ message: 'ไม่พบบริการที่มี ID นี้ในร้านค้าของคุณ' }),
        { status: 404 } // Not Found
      );
    }

    // 6. ตอบกลับเมื่อเกิดข้อผิดพลาดอื่น (500 Internal Server Error)
    return new NextResponse(
      JSON.stringify({
        message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ในการลบข้อมูลบริการ'
      }), {
      status: 500
    }
    );
  }
}