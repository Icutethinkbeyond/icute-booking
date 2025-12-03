import { NextRequest, NextResponse } from 'next/server';
import { Employee } from '@/interfaces/Store';

import { PrismaClient } from "@prisma/client";
import { getCurrentUserAndStoreIdsByToken } from '@/utils/lib/auth';

const prisma = new PrismaClient();


/**
 * POST /api/employees
 * สำหรับเพิ่มข้อมูลพนักงานใหม่ โดยดึง storeId จาก Session
 */
export async function POST(request: NextRequest) {
    try {
        // 1. ตรวจสอบสิทธิ์และดึง User ID
        // const currentUserId = await getCurrentUserId(request);
        const { userId } = await getCurrentUserAndStoreIdsByToken(request);

        // 2. ดึงข้อมูลจาก Body
        const data: Employee = await request.json();
        const {
            name,
            role,
            isActive = true, // กำหนด default เป็น true
            serviceIds = []
        } = data;

        // 3. ค้นหา Store ID ที่ผูกกับ User ID นี้
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

        // --- 4. การตรวจสอบความถูกต้องของข้อมูล (Validation) ---

        if (!name || name.trim() === '') {
            return new NextResponse(
                JSON.stringify({
                    message: 'กรุณาระบุชื่อพนักงาน',
                }),
                { status: 400 }
            );
        }

        if (!role || role.trim() === '') {
            return new NextResponse(
                JSON.stringify({
                    message: 'กรุณาระบุบทบาท/ตำแหน่งของพนักงาน',
                }),
                { status: 400 }
            );
        }


        // --- 5. การสร้าง Employee ในฐานข้อมูล ---

        // เตรียมข้อมูลการเชื่อมโยง Service
        const serviceConnects = serviceIds.map(id => ({ id }));

        const newEmployee = await prisma.employee.create({
            data: {
                name: name,
                role: role,
                isActive: isActive,
                storeId: storeId, // ใช้ Store ID ที่ดึงมาจาก DB/Session
                userId: userId, // ผูกกับ User ID หากมีการส่งมา

                // เชื่อมโยง Service ที่พนักงานคนนี้ทำได้ทันที
                // services: {
                //     connect: serviceConnects,
                // },
            },
            //   include: {
            //       services: {
            //           select: { id: true, name: true } // ดึงชื่อบริการที่ทำได้มาด้วย
            //       },
            //   }
        });

        // --- 6. ตอบกลับสำเร็จ (201 Created) ---
        return new NextResponse(
            JSON.stringify({
                message: 'เพิ่มข้อมูลพนักงานใหม่สำเร็จแล้ว',
                employee: newEmployee
            }),
            {
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Error creating new employee:', error);

        // จัดการ Unauthorized Error 
        if (error instanceof Error && error.message === 'Unauthorized') {
            return new NextResponse(
                JSON.stringify({ message: 'ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบ' }),
                { status: 401 }
            );
        }

        // 7. ตอบกลับเมื่อเกิดข้อผิดพลาดอื่น (500 Internal Server Error)
        return new NextResponse(
            JSON.stringify({
                message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ในการเพิ่มพนักงาน'
            }),
            { status: 500 }
        );
    }
}


/**
 * GET /api/employees?page=1&pageSize=10
 * สำหรับดึงรายการพนักงานทั้งหมดของร้านค้า พร้อม Pagination
 */
export async function GET(request: NextRequest) {
    try {
        // 1. ตรวจสอบสิทธิ์และดึง User ID และ Store ID
        // หาก Token ไม่ถูกต้องหรือหมดอายุ จะถูกจัดการที่นี่
        const { userId, storeId } = await getCurrentUserAndStoreIdsByToken(request);

        // 2. ค้นหา Store ID ที่ผูกกับ User ID นี้ (Authorization)
        // การตรวจสอบนี้ช่วยยืนยันว่า User ยังมี Store ที่ใช้งานอยู่
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
        // Note: storeId จาก token และจาก DB ควรตรงกัน

        // 3. จัดการ Pagination Params
        const { searchParams } = request.nextUrl; // ใช้ request.nextUrl ใน NextRequest

        // ดึงค่า page และ pageSize จาก Query Parameter
        const page = parseInt(searchParams.get('page') || '1', 10); // หน้าเริ่มต้นที่ 1
        const pageSize = parseInt(searchParams.get('pageSize') || '10', 10); // จำนวนข้อมูลต่อหน้าเริ่มต้นที่ 10

        // ตรวจสอบค่าที่รับมา
        if (page < 1 || pageSize < 1 || pageSize > 100) {
            return new NextResponse(
                JSON.stringify({ message: 'ค่า page ต้อง >= 1 และ pageSize ต้องอยู่ระหว่าง 1 ถึง 100' }),
                { status: 400 }
            );
        }

        // คำนวณ skip และ take ตามสูตร
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        // 4. ดึงข้อมูลพนักงานและจำนวนรวมด้วย Transaction
        const [totalItems, employees] = await prisma.$transaction([
            // A. นับจำนวนรายการทั้งหมด (เปลี่ยนจาก Service เป็น Employee)
            prisma.employee.count({
                where: { storeId }
            }),
            // B. ดึงรายการพนักงานแบบ Paginate (เปลี่ยนจาก Service เป็น Employee)
            prisma.employee.findMany({
                where: { storeId },
                skip: skip,
                take: take,
                orderBy: {
                    createdAt: 'desc', // เรียงลำดับจากใหม่ไปเก่า
                },
                include: {
                    // เปลี่ยนจากการ Include employees เป็นการ Include services ที่พนักงานทำได้
                    services: {
                        select: { id: true, name: true }
                    }
                }
            })
        ]);

        // 5. คำนวณ Total Pages
        const totalPages = Math.ceil(totalItems / pageSize);

        // เพิ่ม rowIndex ในข้อมูลแต่ละแถว
        const dataWithIndex = employees.map((user, index) => ({
            ...user,
            rowIndex: skip + index + 1, // ลำดับแถวเริ่มต้นจาก 1 และเพิ่มตาม pagination
        }));

        // 6. ตอบกลับสำเร็จ (200 OK)
        return new NextResponse(
            JSON.stringify({
                message: 'ดึงรายการพนักงานสำเร็จ',
                data: dataWithIndex, // <--- เปลี่ยนชื่อ Property เป็น employees
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
        console.error('Error fetching employees with pagination:', error);

        // จัดการ Unauthorized Error ที่อาจถูก throw จาก getCurrentUserAndStoreIdsByToken
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
                message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ในการดึงรายการพนักงาน'
            }), {
            status: 500
        }
        );
    }
}

/**
 * PUT /api/employees/detail?employeeId=[ID]
 * สำหรับอัปเดตข้อมูลพนักงาน
 */
export async function PATCH(request: NextRequest) {
  try {
    // 1. ตรวจสอบสิทธิ์และดึง User ID และ Store ID จาก Token
    const { storeId } = await getCurrentUserAndStoreIdsByToken(request);

    // 2. ดึง employeeId จาก Query Parameter
    // const { searchParams } = request.nextUrl;
    // const employeeId = searchParams.get('employeeId');
    const updateData: Employee = await request.json();
    const { role, name } = updateData;
    // const { serviceIds, ...otherUpdateData } = updateData; // แยก serviceIds ออกมาก่อน

    // 3. Validation: ตรวจสอบ ID และ Data
    if (!updateData.id) {
      return new NextResponse(
        JSON.stringify({ message: 'กรุณาระบุ ID ของพนักงานที่ต้องการอัปเดต' }),
        { status: 400 } // Bad Request
      );
    }
    
    // 4. เตรียมข้อมูลสำหรับอัปเดต
    // const dataToUpdate: any = {
    //     ...otherUpdateData
    // };
    
    // จัดการการอัปเดต Services (ใช้ set เพื่อแทนที่รายการบริการทั้งหมด)
    // if (serviceIds !== undefined) {
    //     // สร้างรายการสำหรับเชื่อมโยง (connect) ใหม่ทั้งหมด
    //     const serviceConnects = serviceIds.map(id => ({ id }));
    //     dataToUpdate.services = {
    //         set: serviceConnects // set จะแทนที่รายการเดิมทั้งหมด
    //     };
    // }
    
    // ตรวจสอบว่ามีข้อมูลให้อัปเดตหรือไม่
    // if (Object.keys(dataToUpdate).length === 0) {
    //     return new NextResponse(
    //         JSON.stringify({ message: 'ไม่พบข้อมูลที่ต้องการอัปเดต' }),
    //         { status: 400 }
    //     );
    // }

    // 5. อัปเดตข้อมูลพนักงานพร้อมตรวจสอบขอบเขต (Scope Check)
    const updatedEmployee = await prisma.employee.update({
      where: {
        id: updateData.id,
        storeId: storeId, // <--- **การตรวจสอบสำคัญ:** ต้องเป็นของร้านนี้เท่านั้น!
      },
      data: {
        name,
        role
      },
    //   include: {
    //     services: { 
    //       select: { id: true, name: true }
    //     }
    //   }
    });

    // 6. ตอบกลับสำเร็จ (200 OK)
    return new NextResponse(
      JSON.stringify({
        message: 'อัปเดตข้อมูลพนักงานสำเร็จ',
        employee: updatedEmployee,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error(`Error updating employee:`, error);

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
            JSON.stringify({ message: 'ไม่พบพนักงานที่มี ID นี้ในร้านค้าของคุณ' }),
            { status: 404 } 
        );
    }
    
    // 7. ตอบกลับเมื่อเกิดข้อผิดพลาดอื่น (500 Internal Server Error)
    return new NextResponse(
      JSON.stringify({
        message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ในการอัปเดตข้อมูลพนักงาน'
      }), {
        status: 500
      }
    );
  }
}

// --------------------------------------------------------------------------
// DELETE METHOD: ลบข้อมูลพนักงาน
// --------------------------------------------------------------------------
/**
 * DELETE /api/employees/detail?employeeId=[ID]
 * สำหรับลบข้อมูลพนักงาน
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. ตรวจสอบสิทธิ์และดึง Store ID จาก Token
    const { storeId } = await getCurrentUserAndStoreIdsByToken(request);

    // 2. ดึง employeeId จาก Query Parameter
    const { searchParams } = request.nextUrl;
    const employeeId = searchParams.get('employeeId');

    // 3. Validation: ตรวจสอบ ID
    if (!employeeId) {
      return new NextResponse(
        JSON.stringify({ message: 'กรุณาระบุ ID ของพนักงานที่ต้องการลบ' }),
        { status: 400 } // Bad Request
      );
    }

    // 4. ดำเนินการลบพนักงานพร้อมตรวจสอบขอบเขต (Scope Check)
    // การใช้ storeId ใน where clause ช่วยให้มั่นใจได้ว่าเราลบได้เฉพาะพนักงานในร้านค้าของเรา
    const deletedEmployee = await prisma.employee.delete({
      where: {
        id: employeeId,
        storeId: storeId, // <--- **การตรวจสอบสำคัญ:** ต้องเป็นของร้านนี้เท่านั้น!
      },
      // เราอาจจะ include ข้อมูลบางอย่างเพื่อยืนยันว่าลบใครไป
      select: { id: true, name: true } 
    });

    // 5. ตอบกลับสำเร็จ (200 OK หรือ 204 No Content ก็ได้ แต่ใช้ 200 เพื่อส่ง Message)
    return new NextResponse(
      JSON.stringify({
        message: `ลบพนักงานชื่อ "${deletedEmployee.name}" สำเร็จแล้ว`,
        employeeId: deletedEmployee.id,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error(`Error deleting employee (ID: ${request.nextUrl.searchParams.get('employeeId')}):`, error);

    // จัดการ Unauthorized Error จาก Token
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new NextResponse(
        JSON.stringify({ message: 'ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบ' }), 
        { status: 401 }
      );
    }
    
    // จัดการ Error กรณีไม่พบ Record (Record to delete does not exist)
    // โค้ดนี้จะครอบคลุมทั้งกรณี ID ผิด และกรณี ID ถูกแต่เป็นของร้านอื่น
    if (error instanceof Error && error.message.includes('Record to delete not found')) {
         return new NextResponse(
            JSON.stringify({ message: 'ไม่พบพนักงานที่มี ID นี้ในร้านค้าของคุณ' }),
            { status: 404 } // Not Found
        );
    }
    
    // 6. ตอบกลับเมื่อเกิดข้อผิดพลาดอื่น (500 Internal Server Error)
    return new NextResponse(
      JSON.stringify({
        message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ในการลบข้อมูลพนักงาน'
      }), {
        status: 500
      }
    );
  }
}