// lib/auth-by-token.ts

// ใช้ getToken จาก next-auth/jwt เพื่อดึง JWT Payload โดยอัตโนมัติ
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

// กำหนด Type ของ Token Payload
interface JWTUserPayload {
    id: string; // userId
    email: string;
    roleName: string;
    roleId: string;
    storeName: string;
    storeId: string; // ค่าที่เราต้องการ
    exp: number; // Expiration Time (UNIX timestamp)
}

/**
 * ดึง User ID และ Store ID จาก JWT โดยใช้ NextAuth.js getToken()
 * @param request NextRequest object
 * @returns Promise<{ userId: string, storeId: string }> - ID ผู้ใช้และ ID ร้านค้า
 * @throws Error 'Unauthorized' หากไม่พบ Token, Token หมดอายุ, หรือ Token ไม่สมบูรณ์
 */
export async function getCurrentUserAndStoreIdsByToken(request: NextRequest): Promise<{ userId: string, storeId: string, email: string }> {

    // 1. ดึง Token Payload
    // getToken จัดการการอ่าน Cookie, การถอดรหัส, และการตรวจสอบลายเซ็นให้
    const token = await getToken({ req: request as any }) as JWTUserPayload | null; // Note: Casting to any is often required here

    // 2. ตรวจสอบ Token ว่ามีอยู่จริงหรือไม่
    if (!token) {
        console.error('Auth Error: No token found');
        throw new Error('Unauthorized'); // Token ไม่ถูกส่งมา
    }

    const currentTime = Math.floor(Date.now() / 1000);

    // 3. ตรวจสอบ Token Expiration (ตามโค้ดที่คุณให้มา)
    if (typeof token.exp === "number" && token.exp < currentTime) {
        console.error('Auth Error: Token expired');
        throw new Error('Unauthorized'); // Token หมดอายุ
    }

    // 4. ดึงค่าจาก Payload
    const userId = token.id;
    const storeId = token.storeId;
    const email = token.email;

    if (!userId || !storeId) {
        // กรณีที่ Payload ไม่สมบูรณ์ (แม้จะผ่านการตรวจสอบ Signature แล้ว)
        console.error('Auth Error: Incomplete token payload', {
            hasUserId: !!userId,
            hasStoreId: !!storeId,
            email: email,
            roleName: token.roleName
        });
        throw new Error('Unauthorized');
    }

    return { userId, storeId, email };
}