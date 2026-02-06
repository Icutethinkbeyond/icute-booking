export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  sendVerificationEmail,
  sendWithGoogle,
} from "@/utils/services/EmailServices";
import { getCurrentUserAndStoreIdsByToken } from "@/utils/lib/auth";
import { prisma } from "@/../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 1. ตรวจสอบ Session (ผู้ใช้ต้องล็อกอินอยู่ตามแผนที่คุณวางไว้)
    const { email, userId } = await getCurrentUserAndStoreIdsByToken(request);

    console.log(email, userId)

    if (!userId) {
      return NextResponse.json(
        { message: "ไม่พบสิทธิ์การใช้งาน" },
        { status: 401 }
      );
    }

    // 2. ตรวจสอบว่าผู้ใช้ยืนยันไปหรือยัง
    const user = await prisma.user.findUnique({
      where: { email },
      select: { isEmailVerified: true },
    });

    if (user?.isEmailVerified) {
      return NextResponse.json(
        { message: "อีเมลนี้ได้รับการยืนยันเรียบร้อยแล้ว" },
        { status: 400 }
      );
    }

    // 3. สร้าง Token สำหรับยืนยัน (สุ่ม String)
    // 2.3 สร้าง Verification Token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    // กำหนดเวลาหมดอายุ (เช่น 24 ชั่วโมง)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 4. บันทึกลงฐานข้อมูล (ถ้ามีอันเก่าให้ Update หรือสร้างใหม่)
    // await prisma.verificationToken.upsert({
    //   where: { userId },
    //   update: { token, expiresAt: expires  },
    //   create: { userId, token, expiresAt: expires, purpose: 'EMAIL_VERIFICATION' }
    // });

    await prisma.verificationToken.create({
      data: {
        userId,
        token: verificationToken,
        purpose: "EMAIL_VERIFICATION", // <--- กำหนดวัตถุประสงค์
        expiresAt: expires,
      },
    });

    console.log(verificationToken)

    // 5. ส่งอีเมล
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      { message: "ส่งอีเมลยืนยันอีกครั้งสำเร็จ" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend Verification Error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}
