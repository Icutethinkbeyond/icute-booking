
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client"; // นำเข้า Prisma Client
import { Service } from '@/interfaces/Store';
import { getCurrentUserAndStoreIdsByToken } from '@/utils/lib/auth';

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest) {
  try {
    // 1. ตรวจสอบสิทธิ์และดึงข้อมูล User
    const { userId } = await getCurrentUserAndStoreIdsByToken(request);

    // 2. รับข้อมูลจาก Request Body
    const { id, active } = await request.json();

    if (!id) {
      return NextResponse.json({ message: "ต้องระบุ Service ID" }, { status: 400 });
    }

    // 3. ค้นหา Store ID ที่ผูกกับ User นี้ (Security Check)
    const store = await prisma.store.findUnique({
      where: { userId: userId },
      select: { id: true }
    });

    if (!store) {
      return NextResponse.json({ message: "ไม่พบร้านค้าที่ผูกกับบัญชีนี้" }, { status: 403 });
    }

    // 4. ตรวจสอบว่าบริการที่จะแก้ไข เป็นของร้านค้านี้จริงหรือไม่
    const employee = await prisma.employee.findFirst({
      where: {
        id: id,
        storeId: store.id,
      },
    });

    if (!employee) {
      return NextResponse.json({ message: "ไม่พบข้อมูลบริการในร้านของคุณ" }, { status: 404 });
    }

    // 5. อัปเดตสถานะ Active
    // ถ้า client ส่งค่า active มาให้ใช้ค่านั้นเลย ถ้าไม่ส่งมาให้สลับค่าเดิม (Toggle)
    const newStatus = typeof active === "boolean" ? active : !employee.isActive;

    const updatedEmployee = await prisma.employee.update({
      where: { id: id },
      data: { isActive: newStatus },
      select: { id: true, name: true, isActive: true }
    });

    return NextResponse.json({
      message: `เปลี่ยนสถานะเป็น ${updatedEmployee.isActive ? "เปิด" : "ปิด"} เรียบร้อยแล้ว`,
      active: updatedEmployee.isActive
    }, { status: 200 });

  } catch (error) {
    console.error("Error toggling service active:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" }, { status: 500 });
  }
}