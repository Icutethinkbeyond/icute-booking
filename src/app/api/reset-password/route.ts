// app/api/reset-password/route.ts

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ResetPassword } from '@/interfaces/User';
import { prisma } from "@/../lib/prisma";

// กำหนดค่า SALT_ROUNDS สำหรับการเข้ารหัส
const SALT_ROUNDS = 10;

/**
 * POST /api/reset-password
 * สำหรับจัดการการตั้งรหัสผ่านใหม่เมื่อผู้ใช้มี token
 */
export async function POST(request: Request) {
    try {
        const { token, newPassword, confirmPassword }: ResetPassword = await request.json();

        // 1. ตรวจสอบความถูกต้องของข้อมูลพื้นฐาน
        if (!token || !newPassword || !confirmPassword) {
            return NextResponse.json({ message: 'ข้อมูลไม่ครบถ้วน (Token หรือรหัสผ่านใหม่)' }, { status: 400 });
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json({ message: 'รหัสผ่านใหม่และการยืนยันไม่ตรงกัน' }, { status: 400 });
        }

        // 2. ค้นหา Token ในฐานข้อมูล
        const resetRecord = await prisma.verificationToken.findFirst({
            where: {
                token: token,
                purpose: 'PASSWORD_RESET', // ตรวจสอบวัตถุประสงค์
            },
        });

        // 3. ตรวจสอบสถานะของ Token
        if (!resetRecord) {
            return NextResponse.json({ message: 'Token ไม่ถูกต้องหรือไม่พบ' }, { status: 404 });
        }

        if (resetRecord.used) {
            return NextResponse.json({ message: 'Token ถูกใช้ไปแล้ว กรุณาส่งคำขอรีเซ็ตใหม่' }, { status: 403 });
        }

        if (resetRecord.expiresAt < new Date()) {
            return NextResponse.json({ message: 'Token หมดอายุแล้ว กรุณาส่งคำขอรีเซ็ตใหม่' }, { status: 403 });
        }

        // 4. เข้ารหัสรหัสผ่านใหม่
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // 5. ทำ Transaction: อัปเดต User และ Token
        await prisma.$transaction(async (tx) => {

            // 5.1 อัปเดต User: ตั้งค่ารหัสผ่านใหม่
            await tx.user.update({
                where: { userId: resetRecord.userId },
                data: { password: hashedPassword },
            });

            // 5.2 อัปเดต Token: ตั้งค่า used เป็น true
            await tx.verificationToken.update({
                where: { id: resetRecord.id },
                data: { used: true },
            });
        });

        // 6. สำเร็จ
        return NextResponse.json(
            {
                message: 'รีเซ็ตรหัสผ่านสำเร็จแล้ว! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่',
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Reset Password API error:', error);
        return new NextResponse(JSON.stringify({ message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ในการรีเซ็ตรหัสผ่าน', }), { status: 500 });

    }
}