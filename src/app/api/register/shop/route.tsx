import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { User } from "@/interfaces/User";
// import { TokenService } from '@/utils/services/TokenService';
// import { sendEmail } from '@/utils/services/EmailServices';
import { PasswordService } from "@/utils/services/PasswordServices";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

import bcrypt from "bcryptjs";
import { StoreRegister } from "@/interfaces/Store";
import { sendVerificationEmail, sendWithGoogle } from "@/utils/services/EmailServices";

// กำหนดค่า SALT_ROUNDS สำหรับการเข้ารหัส
const SALT_ROUNDS = 10;

/**
 * POST /api/shop/register
 * สำหรับจัดการการสมัครสมาชิกร้านค้า
 */
export async function POST(request: Request) {
  try {
    const data: StoreRegister = await request.json();
    const {
      storeName,
      storeUsername,
      email,
      password,
      confirmPassword,
      termsAccepted,
    } = data;

    // --- 1. การตรวจสอบความถูกต้องของข้อมูล (Validation) ---

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Password และ Confirm Password ไม่ตรงกัน" },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { message: "คุณต้องยอมรับข้อตกลงและเงื่อนไข" },
        { status: 400 }
      );
    }

    // ตรวจสอบความซ้ำซ้อนของ Email - Store Username

    const [existingUser, existingStore] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.store.findUnique({ where: { storeUsername } }),
    ]);

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({
          message: "Email นี้ถูกใช้ในการลงทะเบียนแล้ว",
        }),
        { status: 409 }
      );
    }

    if (existingStore) {
      return new NextResponse(
        JSON.stringify({
          message: "ชื่อผู้ใช้งานร้านค้านี้ (Store Username) ถูกใช้แล้ว",
        }),
        { status: 409 }
      );
    }

    // --- 2. เตรียมข้อมูล ---

    // 2.1 ค้นหาหรือสร้าง Role สำหรับผู้ดูแลร้านค้า (STOREADMIN)
    let storeAdminRole = await prisma.role.findUnique({
      where: { name: "STOREADMIN" },
    });

    if (!storeAdminRole) {
      storeAdminRole = await prisma.role.create({
        data: {
          name: "STOREADMIN",
          description: "Role สำหรับผู้ดูแลร้านค้า",
        },
      });
    }

    // 2.2 เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 2.3 สร้าง Verification Token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    // กำหนดเวลาหมดอายุ (เช่น 24 ชั่วโมง)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 2.3 กำหนด Line OA Link (ใช้ storeUsername เป็นพื้นฐานในการสร้าง link ชั่วคราว)
    const lineOALink = `https://line.me/R/ti/p/@${storeUsername.toLowerCase()}`;

    // --- 3. การสร้าง User และ Store ด้วย Transaction ---
    // ใช้ Transaction เพื่อให้แน่ใจว่าทั้ง 2 Model ถูกสร้างพร้อมกัน
    const result = await prisma.$transaction(async (tx) => {
      // 3.1 สร้าง User
      const newUser = await tx.user.create({
        data: {
          email: email,
          password: hashedPassword,
          userStatus: "ACTIVE",
          isEmailVerified: false, // <--- ตั้งค่าเริ่มต้นเป็น FALSE
          roleId: storeAdminRole?.roleId,
        },
      });

      // 3.2 สร้าง Store และผูกกับ User
      const newStore = await tx.store.create({
        data: {
          storeName: storeName,
          storeUsername: storeUsername,
          lineOALink: lineOALink,
          userId: newUser.userId,
          employeeSetting: {
            allowCustomerSelectEmployee: true,
            autoAssignEmployee: false,
            maxQueuePerEmployeePerDay: 0,
          },
          bookingRule: {
            minAdvanceBookingHours: 0,
            maxAdvanceBookingDays: 0,
            maxQueuePerService: 99,
          },
          cancelRule: {
            minCancelBeforeHours: 0, // ต้องยกเลิกล่วงหน้ากี่ชั่วโมง
            allowCustomerCancel: true,
          },
          // สามารถกำหนดค่า default อื่นๆ ได้ตามต้องการ
        },
      });

      // 3.3 สร้าง Verification Token สำหรับผู้ใช้ใหม่
      const newVerificationToken = await tx.verificationToken.create({
        data: {
          userId: newUser.userId,
          token: verificationToken,
          purpose: "EMAIL_VERIFICATION", // <--- กำหนดวัตถุประสงค์
          expiresAt: expiresAt,
        },
      });

      return { newUser, newStore, newVerificationToken };
    });

    // --- 4. ส่งอีเมลยืนยัน (เรียกใช้ Service) ---
    try {
      await sendVerificationEmail(email, result.newVerificationToken.token);
      // await sendWithGoogle(email, "ยืนยันอีเมล", "verify-email", result.newVerificationToken.token);
    } catch (emailError) {
      // หากส่งอีเมลล้มเหลว ควรพิจารณา:
      // 1. ตอบกลับสำเร็จ แต่เตือนให้ผู้ใช้ขอลิงก์ใหม่
      // 2. หรือโยน Error 500
      console.error(
        "CRITICAL: Failed to send email after successful registration. Token:",
        result.newVerificationToken.token
      );
      // ในกรณีนี้ เลือกที่จะให้ผู้ใช้สมัครสำเร็จ แต่แจ้งเตือนการส่งอีเมล
      return NextResponse.json(
        {
          message:
            "สมัครสมาชิกสำเร็จ แต่การส่งอีเมลยืนยันล้มเหลว! กรุณาเข้าสู่ระบบและขอลิงก์ยืนยันใหม่ภายหลัง",
          userId: result.newUser.userId,
          storeId: result.newStore.id,
        },
        { status: 201 }
      );
    }

    // --- 4. ตอบกลับสำเร็จ ---
    return new NextResponse(
      JSON.stringify({
        message: "สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี",
        userId: result.newUser.userId,
        storeId: result.newStore.id,
      }),
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error during registration:", error);

    // 5. ตอบกลับเมื่อเกิดข้อผิดพลาด
    return new NextResponse(JSON.stringify({ error }), { status: 500 });
  }
}
