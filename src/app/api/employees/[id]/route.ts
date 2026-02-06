import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

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