// app/api/services/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client"; // นำเข้า Prisma Client
import { Service } from '@/interfaces/Store';
import { getCurrentUserAndStoreIdsByToken } from '@/utils/lib/auth';
import { deleteImage, handleImageUpload } from '@/utils/services/cloudinary.service';

const prisma = new PrismaClient();

/**
 * POST /api/services
 * สำหรับเพิ่มบริการใหม่
 */
export async function POST(request: NextRequest) {

  let _image: {
    publicId?: string | null;
    url?: string | null;
  } | null = null;

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
      colorOfService,
      active,
      imageId,
      imageUrl,
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

    _image = await handleImageUpload({
      file: imageUrl,          // undefined ถ้าไม่เปลี่ยน
      publicId: imageId,  // จาก DB
      folder: "service",
    });


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
        price: typeof price === 'string' ? parseFloat(price) : 0, // ถ้า price เป็น undefined ให้ใส่ null
        storeId: storeId,
        discount: typeof discount === 'string' ? parseFloat(discount) : 0,
        bufferTime: typeof bufferTime === 'string' ? parseFloat(bufferTime) : 0,
        detail,
        displayNumber: typeof nextDisplayNumber === 'string' ? parseInt(nextDisplayNumber) : nextDisplayNumber,
        imageUrl: _image.url ?? imageUrl,
        imageId: _image.publicId ?? imageId,
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
          select: { id: true } // เลือกเฉพาะ ID และชื่อพนักงาน
        },
        store: {
          select: { id: true }
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

    if (_image?.publicId) {
      await deleteImage(_image.publicId);
    }

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

    console.log('get services is calling')

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

    console.log(searchParams)

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
  let _image: {
    publicId?: string | null;
    url?: string | null;
    action?: string;
  } | null = null;

  try {
    const { userId } = await getCurrentUserAndStoreIdsByToken(request);
    const data: any = await request.json();

    const {
      id, // ต้องส่ง ID ของ Service มาเพื่ออัปเดต
      name,
      durationMinutes,
      price,
      employeeIds = [],
      discount,
      bufferTime,
      detail,
      displayNumber,
      colorOfService,
      active,
      imageId,  // publicId เดิมที่อยู่ใน DB
      imageUrl, // อาจเป็น Base64 ใหม่ หรือ URL เดิม
    } = data;

    if (!id) {
      return NextResponse.json({ message: 'Missing Service ID' }, { status: 400 });
    }

    // 1. ค้นหา Store ของ User นี้
    const store = await prisma.store.findUnique({
      where: { userId: userId },
      select: { id: true }
    });

    if (!store) {
      return NextResponse.json({ message: 'ไม่พบร้านค้าหรือคุณไม่มีสิทธิ์' }, { status: 403 });
    }

    // 2. ตรวจสอบว่า Service นี้เป็นของ Store นี้จริงหรือไม่ (Security Check)
    const existingService = await prisma.service.findFirst({
      where: { id: id, storeId: store.id }
    });

    if (!existingService) {
      return NextResponse.json({ message: 'ไม่พบข้อมูลบริการนี้ในร้านของคุณ' }, { status: 404 });
    }

    // 3. จัดการรูปภาพด้วยฟังก์ชัน handleImageUpload ที่เราปรับปรุงแล้ว
    // - ถ้า imageUrl เป็น Base64 -> จะลบรูปเก่า (imageId) และอัปโหลดใหม่
    // - ถ้า imageUrl เป็น URL เดิม -> จะส่งค่าเดิมกลับมา (action: NONE)
    _image = await handleImageUpload({
      file: imageUrl,
      publicId: imageId, 
      folder: "service",
    });

    // 4. เตรียมข้อมูลสำหรับพนักงาน (ใช้ set เพื่อล้างข้อมูลเก่าและแทนที่ด้วย ID ชุดใหม่)
    const employeeConnects = employeeIds.map((empId: string) => ({ id: empId }));

    // 5. ทำการอัปเดตข้อมูล
    const updatedService = await prisma.service.update({
      where: { id: id },
      data: {
        name: name,
        durationMinutes: typeof durationMinutes === 'string' ? parseInt(durationMinutes) : durationMinutes,
        price: typeof price === 'string' ? parseFloat(price) : price,
        discount: typeof discount === 'string' ? parseFloat(discount) : discount,
        bufferTime: typeof bufferTime === 'string' ? parseFloat(bufferTime) : bufferTime,
        detail,
        displayNumber: typeof displayNumber === 'string' ? parseInt(displayNumber) : displayNumber,
        colorOfService,
        active: typeof active === 'boolean' ? active : (active === 'true'),
        
        // ใช้ข้อมูลรูปจาก handleImageUpload
        imageUrl: _image?.url ?? existingService.imageUrl,
        imageId: _image?.publicId ?? existingService.imageId,

        // จัดการความสัมพันธ์พนักงาน
        employees: {
          set: employeeConnects, // ลบความเชื่อมโยงเก่าทั้งหมดและใส่ตามที่ส่งมาใหม่
        },
      },
      include: {
        employees: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json({
      message: 'อัปเดตข้อมูลบริการสำเร็จ',
      service: updatedService
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating service:', error);

    // ถ้าเกิด Error และมีการอัปโหลดรูปใหม่ไปแล้ว (ได้ publicId ใหม่มา) ให้ลบออกเพื่อไม่ให้รูปค้างใน Cloudinary
    if (_image?.action === "UPDATE" || _image?.action === "CREATE") {
        if(_image.publicId) await deleteImage(_image.publicId);
    }

    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' }, { status: 500 });
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