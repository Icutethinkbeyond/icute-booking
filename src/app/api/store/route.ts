import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client"; // นำเข้า Prisma Client
import { Store } from '@/interfaces/Store';
import { getCurrentUserAndStoreIdsByToken } from '@/utils/lib/auth';

const prisma = new PrismaClient();


// ฟังก์ชัน Helper เพื่อค้นหา Store ID และป้องกันการเข้าถึงที่ไม่ได้รับอนุญาต
export async function getStoreByCurrentUserId(userId: string, storeId: string) {

    if (!storeId || storeId.trim() === '') {
        // API นี้ต้องรู้ว่าบริการนี้เป็นของร้านไหน
        return new NextResponse(
            JSON.stringify({
                message: 'ไม่พบ Store ID ที่จำเป็นในการสร้างบริการ',
            }),
            { status: 400 })
    }

    const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: {
            id: true,
            storeName: true,
            storeUsername: true,
            lineOALink: true,
            lineNotifyToken: true,
            lineChannelId: true,
            lineChannelSecret: true,
            newBooking: true,
            successBooking: true,
            cancelBooking: true,
            before24H: true,
            reSchedule: true,
            userId: true, // เพื่อยืนยัน
            createdAt: true,
            updatedAt: true,
        }
    });

    if (!store) {
        throw new Error('Store Not Found or Unauthorized');
    }
    return store;
}


// --------------------------------------------------------------------------
// GET METHOD: ดึงข้อมูลร้านค้าปัจจุบัน
// --------------------------------------------------------------------------
/**
 * GET /api/store
 * สำหรับดึงข้อมูลรายละเอียดร้านค้าปัจจุบัน
 */
export async function GET(request: NextRequest) {
    try {

        // const store = await getStoreByCurrentUserId(request);

        const { userId, storeId } = await getCurrentUserAndStoreIdsByToken(request);

        const store = await getStoreByCurrentUserId(userId, storeId);

        return new NextResponse(
            JSON.stringify({
                message: 'ดึงข้อมูลร้านค้าสำเร็จ',
                data: store
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Error fetching store details:', error);

        if (error instanceof Error && error.message === 'Unauthorized') {
            return new NextResponse(
                JSON.stringify({ message: 'ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบ' }),
                { status: 401 }
            );
        }
        if (error instanceof Error && error.message === 'Store Not Found or Unauthorized') {
            return new NextResponse(
                JSON.stringify({ message: 'ไม่พบร้านค้าที่ผูกกับบัญชีผู้ใช้งานนี้' }),
                { status: 403 }
            );
        }

        return new NextResponse(
            JSON.stringify({ message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ในการดึงข้อมูลร้านค้า' }),
            { status: 500 }
        );
    }
}


// --------------------------------------------------------------------------
// PUT METHOD: อัปเดตข้อมูลร้านค้าปัจจุบัน
// --------------------------------------------------------------------------
/**
 * PUT /api/store
 * สำหรับอัปเดตข้อมูลรายละเอียดร้านค้าปัจจุบัน
 */
export async function PATCH(request: NextRequest) {
    try {

        const updateData: Store = await request.json();

        console.log(updateData)

        const { userId, storeId } = await getCurrentUserAndStoreIdsByToken(request);

        // const store = await getStoreByCurrentUserId(userId, storeId);

        // ตรวจสอบข้อมูล StoreId ว่าถูกส่งมาด้วยหรือไม่
        if (!storeId || (storeId).trim() === '') {
            // API นี้ต้องรู้ว่าบริการนี้เป็นของร้านไหน
            return new NextResponse(
                JSON.stringify({
                    message: 'ไม่พบ Store ID ที่จำเป็นในการสร้างบริการ',
                }),
                { status: 400 })
        }

        // const storeId = currentStore.id;
        // const currentStoreUsername = currentStore.storeUsername;

        const currentStoreUsername = await prisma.store.findUnique({
            where: { storeUsername: updateData.storeUsername, AND: { id: storeId } }
        });


        // 1. ตรวจสอบความถูกต้องของข้อมูล (Validation)

        // ตรวจสอบความซ้ำซ้อนของ storeUsername หากมีการเปลี่ยนแปลง
        if (updateData.storeUsername && updateData.storeUsername !== currentStoreUsername?.storeUsername) {
            const existingStore = await prisma.store.findUnique({
                where: { storeUsername: updateData.storeUsername }
            });

            if (existingStore) {
                return new NextResponse(
                    JSON.stringify({ message: 'ชื่อผู้ใช้งานร้านค้า (Store Username) นี้ถูกใช้ไปแล้ว' }),
                    { status: 409 } // Conflict
                );
            }
        }

        // 2. อัปเดตข้อมูลในฐานข้อมูล
        const updatedStore = await prisma.store.update({
            data: {
                storeName: updateData.storeName,
                storeUsername: updateData.storeUsername,
                lineOALink: updateData.lineOALink,
            },
            where: { id: updateData.id }
        });

        // 3. ตอบกลับสำเร็จ (200 OK)
        return new NextResponse(
            JSON.stringify({
                message: 'อัปเดตข้อมูลร้านค้าสำเร็จ',
                store: updatedStore
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Error updating store details:', error);

        if (error instanceof Error && error.message === 'Unauthorized') {
            return new NextResponse(
                JSON.stringify({ message: 'ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบ' }),
                { status: 401 }
            );
        }
        if (error instanceof Error && error.message === 'Store Not Found or Unauthorized') {
            return new NextResponse(
                JSON.stringify({ message: 'ไม่พบร้านค้าที่ผูกกับบัญชีผู้ใช้งานนี้' }),
                { status: 403 }
            );
        }

        return new NextResponse(
            JSON.stringify({ message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ในการอัปเดตข้อมูลร้านค้า' }),
            { status: 500 }
        );
    }
}