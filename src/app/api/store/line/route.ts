import { NextRequest, NextResponse } from 'next/server';
import { Store } from '@/interfaces/Store';
import { getCurrentUserAndStoreIdsByToken } from '@/utils/lib/auth';
import { prisma } from "@/../lib/prisma";

// --------------------------------------------------------------------------
// GET METHOD: ดึงข้อมูลร้านค้าปัจจุบัน
// --------------------------------------------------------------------------
/**
 * GET /api/store
 * สำหรับดึงข้อมูลรายละเอียดร้านค้าปัจจุบัน
 */
// export async function GET(request: NextRequest) {
//     try {

//         // const store = await getStoreByCurrentUserId(request);

//         const { userId, storeId } = await getCurrentUserAndStoreIdsByToken(request);

//         const store = await getStoreByCurrentUserId(userId, storeId);

//         return new NextResponse(
//             JSON.stringify({
//                 message: 'ดึงข้อมูลร้านค้าสำเร็จ',
//                 data: store
//             }),
//             {
//                 status: 200,
//                 headers: { 'Content-Type': 'application/json' }
//             }
//         );

//     } catch (error) {
//         console.error('Error fetching store details:', error);

//         if (error instanceof Error && error.message === 'Unauthorized') {
//             return new NextResponse(
//                 JSON.stringify({ message: 'ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบ' }),
//                 { status: 401 }
//             );
//         }
//         if (error instanceof Error && error.message === 'Store Not Found or Unauthorized') {
//             return new NextResponse(
//                 JSON.stringify({ message: 'ไม่พบร้านค้าที่ผูกกับบัญชีผู้ใช้งานนี้' }),
//                 { status: 403 }
//             );
//         }

//         return new NextResponse(
//             JSON.stringify({ message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ในการดึงข้อมูลร้านค้า' }),
//             { status: 500 }
//         );
//     }
// }


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

        // 2. อัปเดตข้อมูลในฐานข้อมูล
        const updatedStore = await prisma.store.update({
            data: {
                lineNotifyToken: updateData.lineNotifyToken,
                lineChannelId: updateData.lineChannelId,
                lineChannelSecret: updateData.lineChannelSecret,
                newBooking: updateData.newBooking,
                successBooking: updateData.successBooking,
                cancelBooking: updateData.cancelBooking,
                before24H: updateData.before24H,
                reSchedule: updateData.reSchedule,
            },
            where: { id: updateData.id },
            // select: {
            //     id: true,
            //     storeName: true,
            //     storeUsername: true,
            //     lineOALink: true,
            //     lineNotifyToken: true,
            //     lineChannelId: true,
            //     lineChannelSecret: true,
            //     newBooking: true,
            //     successBooking: true,
            //     cancelBooking: true,
            //     before24H: true,
            //     reSchedule: true,
            //     userId: true,
            // }
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