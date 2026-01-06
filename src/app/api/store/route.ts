import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client"; // นำเข้า Prisma Client
import { Store } from '@/interfaces/Store';
import { getCurrentUserAndStoreIdsByToken } from '@/utils/lib/auth';
import { getStoreByCurrentUserId } from '@/utils/services/database-services/StoreDBService';
import { deleteImage, handleImageUpload } from '@/utils/services/cloudinary.service';

const prisma = new PrismaClient();


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
    // เก็บสถานะรูปภาพที่อัปโหลดใหม่ไว้ เพื่อใช้ Rollback หาก DB พัง
    let _logo: any = null;
    let _cover: any = null;

    try {
        const { userId, storeId: tokenStoreId } = await getCurrentUserAndStoreIdsByToken(request);
        const data: Store = await request.json();

        console.log(data)

        // 1. ดึงข้อมูลและกำหนด ID ที่จะอัปเดต
        const id = data.id || tokenStoreId;

        if (!id) {
            return NextResponse.json({ message: 'ไม่พบ Store ID ที่ต้องการอัปเดต' }, { status: 400 });
        }

        // 2. ตรวจสอบสิทธิ์ความเป็นเจ้าของ (Ownership Check)
        const currentStore = await prisma.store.findUnique({
            where: { id: id }
        });

        if (!currentStore || currentStore.userId !== userId) {
            return NextResponse.json({ message: 'คุณไม่มีสิทธิ์แก้ไขข้อมูลร้านค้าค้านี้' }, { status: 403 });
        }

        // 3. ตรวจสอบความซ้ำซ้อนของ storeUsername (ถ้ามีการขอเปลี่ยน)
        if (data.storeUsername && data.storeUsername !== currentStore.storeUsername) {
            const existingUsername = await prisma.store.findUnique({
                where: { storeUsername: data.storeUsername }
            });

            if (existingUsername) {
                return NextResponse.json({ message: 'ชื่อผู้ใช้งานร้านค้า (Store Username) นี้ถูกใช้ไปแล้ว' }, { status: 409 });
            }
        }

        // 4. จัดการรูปภาพ (Logo & Cover)
        // จัดการ Logo
        _logo = await handleImageUpload({
            file: data.logoUrl,     // ส่ง Base64 หรือ URL เดิมเข้ามา
            publicId: data.logoId,  // ส่ง Public ID เดิมจาก DB
            folder: "store/logos",
        });

        // จัดการ Cover
        _cover = await handleImageUpload({
            file: data.coverUrl,    // ส่ง Base64 หรือ URL เดิมเข้ามา
            publicId: data.coverId, // ส่ง Public ID เดิมจาก DB
            folder: "store/covers",
        });

        // 5. อัปเดตข้อมูลในฐานข้อมูล
        const updatedStore = await prisma.store.update({
            where: { id: id },
            data: {
                storeName: data.storeName,
                storeUsername: data.storeUsername,
                lineOALink: data.lineOALink,
                
                // ฟิลด์ที่เพิ่มใหม่
                storeNameThai: data.storeNameTH,
                tel: data.tel,
                addressCustom: data.addressCustom,
                mapUrl: data.mapUrl,
                detail: data.detail,

                // ข้อมูลรูปภาพ (ถ้า action=NONE จะใช้ค่าเดิม ถ้ามีการอัปโหลดใหม่จะใช้ค่าจาก Cloudinary)
                logoUrl: _logo.url ?? data.logoUrl,
                logoId: _logo.publicId ?? data.logoId,
                coverUrl: _cover.url ?? data.coverUrl,
                coverId: _cover.publicId ?? data.coverId,
            }
        });

        return NextResponse.json({
            message: 'อัปเดตข้อมูลร้านค้าสำเร็จ',
            store: updatedStore
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error updating store:', error);

        // --- Rollback Logic ---
        // หากอัปโหลดรูปขึ้น Cloudinary ไปแล้วแต่ DB พัง ให้ลบรูปที่เพิ่งอัปโหลดทิ้ง
        if (_logo?.action === "UPDATE" || _logo?.action === "CREATE") {
            if (_logo.publicId) await deleteImage(_logo.publicId);
        }
        if (_cover?.action === "UPDATE" || _cover?.action === "CREATE") {
            if (_cover.publicId) await deleteImage(_cover.publicId);
        }

        return NextResponse.json({ 
            message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลร้านค้า' 
        }, { status: 500 });
    }
}