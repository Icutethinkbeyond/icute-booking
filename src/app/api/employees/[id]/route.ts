import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserAndStoreIdsByToken } from '@/utils/lib/auth';
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// [GET] ดึงข้อมูลพนักงานรายบุคคล
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: {
        workingDays: { include: { timeSlots: true } },
        leaves: true,
        role: true,
        services: true
      }
    });

    if (!employee) return NextResponse.json({ message: "ไม่พบข้อมูล" }, { status: 404 });
    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

// [PATCH] แก้ไขข้อมูลพนักงาน
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { password, ...updateData } = body;

    // ถ้ามีการเปลี่ยนรหัสผ่าน ให้ Hash ใหม่
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    return NextResponse.json({ message: "Update Failed" }, { status: 400 });
  }
}

// [DELETE] ลบพนักงาน
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ลบข้อมูลที่เกี่ยวข้องแบบ Manual หรือใช้ Cascade (ใน Schema ตั้ง Cascade ไว้ที่ Store)
    // แต่สำหรับ Employee workingDays ควรลบด้วยถ้าไม่ได้ตั้ง Cascade ไว้ในระดับนี้
    await prisma.employee.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "ลบข้อมูลสำเร็จ" });
  } catch (error) {
    return NextResponse.json({ message: "Delete Failed" }, { status: 400 });
  }
}