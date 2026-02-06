// app/api/verify-email/route.ts

import { NextResponse } from 'next/server';
import { prisma } from "@/../lib/prisma";

/**
 * GET /api/verify-email?token=<verification_token>
 * สำหรับยืนยันอีเมลเมื่อผู้ใช้คลิกลิงก์
 */
export async function GET(request: Request) {

  const url = new URL(request.url);
  const { searchParams } = url
  const token = searchParams.get('token')

  console.log("token ----> :", token)

  // 1. ตรวจสอบว่ามี Token ส่งมาหรือไม่
  if (!token) {
    // ส่งผู้ใช้ไปยังหน้าจอแสดงข้อผิดพลาด (หรือ redirect ไปที่หน้าหลัก)
    return NextResponse.redirect(new URL('/auth/verification-status?status=error&message=Token not found', url));
  }

  try {
    // 2. ค้นหา Token ในฐานข้อมูล
    const verificationRecord = await prisma.verificationToken.findFirst({
      where: {
        token: token,
        purpose: 'EMAIL_VERIFICATION', // ตรวจสอบว่าวัตถุประสงค์ถูกต้อง
      },
      include: {
        user: true, // ดึงข้อมูล User มาด้วย
      },
    });

    // 3. ตรวจสอบสถานะของ Token
    if (!verificationRecord) {
      return NextResponse.redirect(new URL('/auth/verification-status?status=error&message=Invalid token', url));
    }

    if (verificationRecord.used) {
      return NextResponse.redirect(new URL('/auth/verification-status?status=error&message=Token already used', url));
    }

    if (verificationRecord.expiresAt < new Date()) {
      return NextResponse.redirect(new URL('/auth/verification-status?status=error&message=Token expired', url));
    }

    // ตรวจสอบว่า User มีอยู่จริง (เผื่อกรณีข้อมูลผิดพลาด)
    if (!verificationRecord.user) {
      return NextResponse.redirect(new URL('/auth/verification-status?status=error&message=User not found', url));
    }

    // 4. ทำ Transaction: อัปเดต User และ Token
    await prisma.$transaction(async (tx) => {
      // 4.1 อัปเดต User: ตั้งค่า isEmailVerified เป็น true
      await tx.user.update({
        where: { userId: verificationRecord.userId },
        data: {
          isEmailVerified: true,
          userStatus: 'ACTIVE', // อาจจะเปลี่ยนสถานะบัญชีเป็น ACTIVE ทันที
        },
      });

      // // 4.2 อัปเดต Token: ตั้งค่า used เป็น true เพื่อป้องกันการใช้ซ้ำ
      // await tx.verificationToken.update({
      //   where: { id: verificationRecord.id },
      //   data: { used: true },
      // });
      // 3. ลบ Token ที่ใช้แล้ว
      await prisma.verificationToken.delete({ where: { token } });
    });

    // 5. สำเร็จ: Redirect ผู้ใช้ไปยังหน้าจอแสดงความสำเร็จ
    return NextResponse.redirect(new URL('/auth/verification-status?status=success&message=Email verified successfully! You can now log in.', url));

  } catch (error) {
    console.error('Email verification error:', error);
    // 6. ข้อผิดพลาดที่ไม่คาดคิด
    return NextResponse.redirect(new URL('/auth/verification-status?status=error&message=An unexpected error occurred during verification', url));
  }
}