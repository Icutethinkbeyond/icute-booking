import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/../lib/prisma";
/**
 * GET /api/public/services?store_username="xxxx"
 * สำหรับดึงรายการบริการทั้งหมดของร้านค้า พร้อม Pagination
 */
export async function GET(request: NextRequest) {
    try {

        // 3. จัดการ Pagination Params
        const { searchParams } = new URL(request.url);

        // ดึงค่า page และ pageSize จาก Query Parameter
        const store_username = searchParams.get('store_username'); // หน้าเริ่มต้นที่ 1

        if (!store_username) {
            return new NextResponse(
                JSON.stringify({
                    message: 'ไม่พบ Store Username โปรดขอ URL สำหรับจองใหม่จากร้านค้า',
                }),
                { status: 400 }
            );
        }

        // 2. ค้นหา Store ID ที่ผูกกับ User ID นี้ (Authorization)
        const store = await prisma.store.findUnique({
            where: {
                storeUsername: store_username
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

        // 4. ดึงข้อมูลบริการและจำนวนรวมด้วย Transaction
        const services = await prisma.service.findMany({
            where: { storeId: store.id },
            orderBy: {
                createdAt: 'desc', // เรียงลำดับจากใหม่ไปเก่า
            }
        })


        // 6. ตอบกลับสำเร็จ (200 OK)
        return new NextResponse(
            JSON.stringify({
                message: 'ดึงรายการบริการสำเร็จ',
                data: services,
            }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }
        );

    } catch (error) {
        console.error('Error fetching services with pagination:', error);

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