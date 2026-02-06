import { NextRequest, NextResponse } from 'next/server';
import { ChangePassword } from '@/interfaces/User';
import { getCurrentUserAndStoreIdsByToken } from '@/utils/lib/auth';
import bcrypt from 'bcryptjs'; // ใช้สำหรับการแฮชและเปรียบเทียบรหัสผ่าน
import { prisma } from '../../../../../lib/prisma';

/**
 * PATCH /api/admin/change-password
 * สำหรับเปลี่ยนรหัสผ่านของผู้ใช้ที่เข้าสู่ระบบ (Admin/Owner)
 */
export async function PATCH(request: NextRequest) {
  try {
    // 1. ตรวจสอบสิทธิ์และดึง User ID
    const { userId } = await getCurrentUserAndStoreIdsByToken(request); // ดึง userId จาก Token
    
    // 2. ดึงข้อมูลจาก Body
    const { oldPassword, newPassword, confirmPassword }: ChangePassword = await request.json();

    // 3. ตรวจสอบข้อมูลเบื้องต้น
    if (!oldPassword || !newPassword || !confirmPassword) {
      return new NextResponse(
        JSON.stringify({ message: 'กรุณากรอกรหัสผ่านเก่า รหัสผ่านใหม่ และยืนยันรหัสผ่านให้ครบถ้วน' }),
        { status: 400 }
      );
    }
    
    // ตรวจสอบว่ารหัสผ่านใหม่ตรงกันหรือไม่
    if (newPassword !== confirmPassword) {
      return new NextResponse(
        JSON.stringify({ message: 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน' }),
        { status: 400 }
      );
    }

    // ตรวจสอบความซับซ้อนของรหัสผ่าน (Minimum Length Check)
    if (newPassword.length < 6) { // กำหนดขั้นต่ำที่ 6 ตัวอักษร (ปรับเปลี่ยนได้)
      return new NextResponse(
        JSON.stringify({ message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' }),
        { status: 400 }
      );
    }

    // 4. ดึงข้อมูลผู้ใช้ปัจจุบันจากฐานข้อมูล
    const user = await prisma.user.findUnique({
      where: { userId: userId },
      select: { userId: true, password: true } // ดึงเฉพาะ ID และ Password Hash มาเท่านั้น
    });

    if (!user) {
      // 🚩 กรณีนี้ไม่ควรเกิดขึ้น หาก Token ถูกต้อง แต่ป้องกันไว้
      return new NextResponse(
        JSON.stringify({ message: 'ไม่พบผู้ใช้งานในระบบ' }),
        { status: 404 }
      );
    }

    if (!user?.password) {
      // 🚩 กรณีนี้ไม่ควรเกิดขึ้น หาก Token ถูกต้อง แต่ป้องกันไว้
      return new NextResponse(
        JSON.stringify({ message: 'ไม่พบรหัสผ่านของคุณ โปรดติดต่อผู้ดูแลระบบ' }),
        { status: 404 }
      );
    }

    // 5. ตรวจสอบรหัสผ่านเก่า
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatch) {
      return new NextResponse(
        JSON.stringify({ message: 'รหัสผ่านเก่าไม่ถูกต้อง' }),
        { status: 401 } // Unauthorized
      );
    }

    // 6. แฮชรหัสผ่านใหม่
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // 7. อัปเดตรหัสผ่านใหม่ลงในฐานข้อมูล
    await prisma.user.update({
      where: { userId: userId },
      data: { password: newPasswordHash },
    });

    // 8. ตอบกลับสำเร็จ (200 OK)
    return new NextResponse(
      JSON.stringify({
        message: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว กรุณาเข้าสู่ระบบอีกครั้งด้วยรหัสผ่านใหม่',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error changing password:', error);

    // จัดการ Unauthorized Error จาก Token
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new NextResponse(
        JSON.stringify({ message: 'ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบ' }), 
        { status: 401 }
      );
    }

    // 9. ตอบกลับเมื่อเกิดข้อผิดพลาดอื่น (500 Internal Server Error)
    return new NextResponse(
      JSON.stringify({
        message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ในการเปลี่ยนรหัสผ่าน'
      }), {
        status: 500
      }
    );
  }
}