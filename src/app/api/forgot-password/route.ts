// app/api/forgot-password/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendResetPasswordEmail } from '@/utils/services/EmailServices';
import { prisma } from "@/../lib/prisma";

/**
 * POST /api/forgot-password
 * สำหรับจัดการคำขอส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลผู้ใช้
 */
export async function POST(request: Request) {
  try {
    const email = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'กรุณาระบุอีเมล' }, { status: 400 });
    }

    // 1. ค้นหาผู้ใช้จากอีเมล
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // สำคัญ: เราควรตอบกลับด้วยข้อความที่ไม่เผยให้รู้ว่าอีเมลนั้นมีอยู่ในระบบหรือไม่ เพื่อความปลอดภัย
    if (!user) {
      console.warn(`Attempted password reset for unknown email: ${email}`);
      // ตอบกลับว่า "ส่งอีเมลแล้ว" แม้ว่าจะไม่พบผู้ใช้ เพื่อป้องกันการโจมตีแบบ Brute-force
      return NextResponse.json(
        { message: 'หากอีเมลนี้อยู่ในระบบของเรา คุณจะได้รับลิงก์สำหรับรีเซ็ตรหัสผ่าน' },
        { status: 200 }
      );
    }
    
    // --- 2. เตรียมข้อมูลโทเคน ---
    
    // สร้างโทเคนใหม่ที่ไม่ซ้ำกัน
    const resetToken = crypto.randomBytes(32).toString('hex');
    // กำหนดเวลาหมดอายุ (เช่น 1 ชั่วโมงสำหรับรีเซ็ตรหัสผ่าน)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 

    // --- 3. สร้าง/อัปเดต Token ในฐานข้อมูลด้วย Transaction ---
    await prisma.$transaction(async (tx) => {
        // ล้างโทเคนรีเซ็ตที่ยังไม่หมดอายุและยังไม่ได้ใช้ของ User คนเดิมออกก่อน
        await tx.verificationToken.deleteMany({
            where: {
                userId: user.userId,
                purpose: 'PASSWORD_RESET',
                used: false,
                expiresAt: {
                    gt: new Date() // ยังไม่หมดอายุ
                }
            }
        });

        // สร้างโทเคนรีเซ็ตรหัสผ่านใหม่
        await tx.verificationToken.create({
            data: {
                userId: user.userId,
                token: resetToken,
                purpose: 'PASSWORD_RESET', // <--- วัตถุประสงค์คือรีเซ็ตรหัสผ่าน
                expiresAt: expiresAt,
            }
        });
    });

    // --- 4. ส่งอีเมล ---
    try {
        await sendResetPasswordEmail(user.email, resetToken);
    } catch (emailError) {
        console.error('Failed to send reset password email:', emailError);
        // หากส่งอีเมลล้มเหลว แจ้งผู้ใช้ แต่ยังคงตอบ 200 เพื่อไม่ให้เผยข้อมูล
        return NextResponse.json(
            { message: 'เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่ในภายหลัง' },
            { status: 500 }
        );
    }

    // --- 5. ตอบกลับสำเร็จ ---
    return NextResponse.json(
      { 
        message: 'หากอีเมลนี้อยู่ในระบบของเรา คุณจะได้รับลิงก์สำหรับรีเซ็ตรหัสผ่าน',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot Password API error:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ กรุณาลองใหม่' },
      { status: 500 }
    );
  }
}