import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client"; 

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // ในระบบจริงอาจจะดึง storeId จาก Session หรือ Header
    // ตัวอย่างนี้สมมติว่าดึงจาก Query Parameter
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
    }

    const storeSettings = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        storeNameTH: true,
        storeName: true,
        // 1. เวลาทำการปกติของร้าน (Default Operating Hours)
        operatingHours: true,
        // 3. วันหยุดที่กำลังจะมาถึง
        holidays: {
          where: {
            OR: [
              { date: { gte: new Date() } },
              { isAnnual: true }
            ]
          },
          select: {
            name: true,
            date: true,
            isAnnual: true,
            day: true,
            month: true
          }
        }
      }
    });

    if (!storeSettings) {
      return NextResponse.json({ error: "Store settings not found" }, { status: 404 });
    }

    return NextResponse.json(storeSettings);
  } catch (error) {
    console.error("Fetch Store Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}