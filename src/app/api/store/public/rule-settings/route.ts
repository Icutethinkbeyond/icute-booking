import { NextResponse } from "next/server";
import { StoreRuleService } from "@/utils/services/database-services/StoreService";
import { prisma } from "@/../lib/prisma";

export async function GET(request: Request) {
    try {
        // ในระบบจริงอาจจะดึง storeId จาก Session หรือ Header
        // ตัวอย่างนี้สมมติว่าดึงจาก Query Parameter
        const { searchParams } = new URL(request.url);
        const store_username = searchParams.get("store_username");

        if (!store_username) {
            return NextResponse.json({ error: "store_username is required" }, { status: 400 });
        }

        const store = await prisma.store.findUnique({ where: { storeUsername: store_username }, select: { id: true, employeeSetting: true } })

        if (!store) {
            return NextResponse.json({ error: "store not found" }, { status: 404 });
        }

        return NextResponse.json(store, { status: 200 });
    } catch (error) {
        console.error("Fetch Store Settings Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}