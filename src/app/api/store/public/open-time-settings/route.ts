import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { StoreRuleService } from "@/utils/services/database-services/StoreService";

const prisma = new PrismaClient();

export interface OpenTimeRes {
  isClosed: boolean,
  reason?: string,
}

export async function GET(request: Request) {
  try {
    // ในระบบจริงอาจจะดึง storeId จาก Session หรือ Header
    // ตัวอย่างนี้สมมติว่าดึงจาก Query Parameter
    const { searchParams } = new URL(request.url);
    const store_username = searchParams.get("store_username");

    if (!store_username) {
      return NextResponse.json({ error: "store_username is required" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({ where: { storeUsername: store_username }, select: { id: true } })

    if (!store) {
      return NextResponse.json({ error: "store not found" }, { status: 404 });
    }

    const status: OpenTimeRes = await StoreRuleService.isClosedNow(store.id);

    console.log(status)

    // const storeSettings = await prisma.store.findUnique({
    //   where: { id: storeId },
    //   select: {
    //     id: true,
    //     storeNameTH: true,
    //     storeName: true,
    //     // 1. เวลาทำการปกติของร้าน (Default Operating Hours)
    //     operatingHours: true,
    //     // 3. วันหยุดที่กำลังจะมาถึง
    //     holidays: {
    //       where: {
    //         OR: [
    //           { date: { gte: new Date() } },
    //           { isAnnual: true }
    //         ]
    //       },
    //       select: {
    //         name: true,
    //         date: true,
    //         isAnnual: true,
    //         day: true,
    //         month: true
    //       }
    //     }
    //   }
    // });

    if (!status) {
      return NextResponse.json({ error: "Store settings not found" }, { status: 404 });
    }

    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    console.error("Fetch Store Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}