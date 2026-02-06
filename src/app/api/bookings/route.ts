import { NextRequest, NextResponse } from 'next/server';
import dayjs from 'dayjs'; // ต้องติดตั้ง dayjs: npm install dayjs

import { getCurrentUserAndStoreIdsByToken } from '@/utils/lib/auth';
import { Booking } from '@/interfaces/Booking';
import { prisma } from '../../../../lib/prisma';


// --------------------------------------------------------------------------
// 📜 Interface สำหรับข้อมูลที่ส่งมาจาก Request Body
// --------------------------------------------------------------------------


// --------------------------------------------------------------------------
// POST: สร้างรายการจองใหม่
// --------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    // 1. ตรวจสอบสิทธิ์และดึง Store ID (สมมติว่า API นี้ใช้โดยเจ้าของร้าน/ผู้ดูแล)
    const { storeId } = await getCurrentUserAndStoreIdsByToken(request);
    
    // 2. ดึงข้อมูลจาก Body
    const requestBody: Booking = await request.json();
    const { 
        customerName, 
        customerPhone, 
        customerEmail,
        bookingDate, 
        bookingTime,
        serviceId, 
        employeeId, 
        customerId
    } = requestBody;

    // 3. Validation ข้อมูลเบื้องต้น
    if (!customerName || !customerPhone || !bookingDate || !bookingTime || !serviceId || !employeeId) {
        return new NextResponse(
            JSON.stringify({ message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน: ชื่อ, เบอร์โทร, วันที่, เวลา, บริการ, และพนักงาน' }),
            { status: 400 }
        );
    }
    
    // 4. การจัดการวันที่และเวลา
    // 💡 รวมวันที่และเวลาเข้าด้วยกัน และแปลงเป็น ISO 8601 DateTime
    const bookingDateTime = dayjs(`${bookingDate}T${bookingTime}`).toISOString();
    
    // 5. ตรวจสอบความถูกต้องของ Service และ Employee (Scope Check)
    const [service, employee] = await prisma.$transaction([
        // ตรวจสอบ Service: ต้องมีอยู่จริงและเป็นของร้านนี้
        prisma.service.findFirst({
            where: { id: serviceId, storeId: storeId },
            select: { id: true }
        }),
        // ตรวจสอบ Employee: ต้องมีอยู่จริงและเป็นของร้านนี้
        prisma.employee.findFirst({
            where: { id: employeeId, storeId: storeId },
            select: { id: true }
        }),
    ]);
    
    if (!service) {
        return new NextResponse(
            JSON.stringify({ message: 'ไม่พบ Service ID ที่ระบุในร้านค้าของคุณ' }),
            { status: 404 }
        );
    }
    
    if (!employee) {
        return new NextResponse(
            JSON.stringify({ message: 'ไม่พบ Employee ID ที่ระบุในร้านค้าของคุณ' }),
            { status: 404 }
        );
    }
    
    // *** 🚨 ขั้นตอนสำคัญ: ตรวจสอบความซ้ำซ้อนของการจอง (Time Slot Conflict) ***
    // โค้ดนี้จะต้องดึงข้อมูลจองอื่น ๆ ในเวลาเดียวกันเพื่อป้องกันการจองซ้ำ
    // (ละไว้ในที่นี้ แต่สำคัญมากใน Production)

    // 6. เตรียมข้อมูลสำหรับ Customer (ถ้าไม่มี customerId ส่งมา)
    let finalCustomerId = customerId;
    
    if (!finalCustomerId) {
        // ค้นหาลูกค้าที่มีอยู่ หรือสร้างใหม่
        // const customer = await prisma.customer.upsert({
        //     where: { phone: customerPhone }, // ใช้เบอร์โทรศัพท์เป็น unique identifier
        //     update: {
        //         name: customerName,
        //         email: customerEmail,
        //     },
        //     create: {
        //         name: customerName,
        //         phone: customerPhone,
        //         email: customerEmail,
        //     },
        //     select: { id: true }
        // });
        // finalCustomerId = customer.id;
    }
    
    // 7. สร้างรายการจอง (Booking)
    // const newBooking = await prisma.booking.create({
    //   data: {
    //     customerName: customerName,
    //     customerPhone: customerPhone,
    //     customerEmail: customerEmail,
        
    //     bookingDate: bookingDateTime, // ใช้ค่าที่แปลงแล้ว
    //     bookingTime: bookingDateTime, // 💡 หาก schema Booking Time ถูกใช้เพื่อเก็บวันที่+เวลา
    //                                  // ถ้า schema ของคุณมี duration ให้คำนวณ end time ด้วย

    //     status: 'PENDING', // สถานะเริ่มต้นของการจอง
    //     customerType: customerId ? 'MEMBER' : 'GUEST', // หรือใช้ logic อื่น
        
    //     storeId: storeId,
    //     serviceId: serviceId,
    //     employeeId: employeeId,
    //     customerId: finalCustomerId, // ผูกกับ ID ลูกค้าที่หา/สร้างได้
    //   },
    //   include: {
    //     service: { select: { name: true } },
    //     employee: { select: { name: true } },
    //     customer: { select: { name: true } },
    //   }
    // });

    // 8. ตอบกลับสำเร็จ (201 Created)
    return new NextResponse(
      JSON.stringify({
        message: 'สร้างรายการจองสำเร็จ',
        // booking: newBooking,
      }), {
        status: 201, // 201 Created
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error creating booking:', error);

    // จัดการ Unauthorized Error จาก Token
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new NextResponse(
        JSON.stringify({ message: 'ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบ' }), 
        { status: 401 }
      );
    }
    
    // 9. ตอบกลับเมื่อเกิดข้อผิดพลาดอื่น (500 Internal Server Error)
    return new NextResponse(
      JSON.stringify({
        message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ในการสร้างรายการจอง'
      }), {
        status: 500
      }
    );
  }
}