import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { Resend } from 'resend';

// ตรวจสอบและสร้าง Instance ของ Resend Client
const resend = new Resend(process.env.RESEND_API_KEY);

// ดึง Base URL จาก Environment Variables
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
// กำหนดอีเมลผู้ส่ง (ต้อง verified ในระบบ Resend)
const FROM_EMAIL = 'Acme <onboarding@resend.dev>';





export const sendWithGoogle = async (
  to: string,
  subject: string,
  templateName: string,
  token: string,
  // replacements: Record<string, string>
): Promise<boolean> => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // อ่าน template
    const templatePath = path.join(
      process.cwd(),
      "src",
      "utils",
      "templates",
      "emails",
      `${templateName}.html`
    );

    let html = fs.readFileSync(templatePath, "utf8");

    // replace ตัวแปร
    // Object.entries(replacements).forEach(([key, value]) => {
    //   html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
    // });

    const verificationLink = `${BASE_URL}/api/verify-email?token=${token}`;
    html = html.replace("ConfirmationURL", verificationLink);

    await transporter.sendMail({
      from: `"Your Company" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully to:", to);
    return true; 
  } catch (error) {
    console.error("Error sending email:", error);
    return false; 
  }
};


/**
 * ฟังก์ชันสำหรับส่งอีเมลยืนยันบัญชี
 * @param toEmail อีเมลผู้รับ
 * @param token โทเคนสำหรับยืนยันอีเมล
 */
export async function sendVerificationEmail(toEmail: string, token: string) {
  // สร้างลิงก์ยืนยันที่ผู้ใช้จะต้องคลิก
  const verificationLink = `${BASE_URL}/api/verify-email?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: 'ยืนยันอีเมลสำหรับบัญชีร้านค้าของคุณ',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>สวัสดีครับ/ค่ะ,</h2>
            <p>ขอบคุณที่ลงทะเบียนใช้งานระบบของเรา! กรุณาคลิกลิงก์ด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
            <p>
                <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; color: #182E4E; background-color: #3BB173; border-radius: 5px; text-decoration: none; font-weight: bold;">
                    ยืนยันอีเมล
                </a>
            </p>
            <p>ลิงก์นี้จะหมดอายุภายใน 24 ชั่วโมง</p>
            <p>หากคุณไม่ได้ลงทะเบียน กรุณาเพิกเฉยต่ออีเมลฉบับนี้</p>
            <p>ขอบคุณครับ</p>
            <p>ทีมงาน</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending verification email via Resend:', error);
      // โยน Error เพื่อให้โค้ดที่เรียกใช้จัดการต่อ
      throw new Error(`Resend Error: ${error.message}`);
    }

    console.log('Verification email sent successfully to:', toEmail, 'ID:', data.id);
    return true;

  } catch (err) {
    console.error('Failed to send verification email:', err);
    throw err;
  }
}


/**
 * ฟังก์ชันสำหรับส่งอีเมลรีเซ็ตรหัสผ่าน
 * @param toEmail อีเมลผู้รับ
 * @param token โทเคนสำหรับรีเซ็ตรหัสผ่าน
 */

export async function sendResetPasswordEmail(toEmail: string, token: string) {
  // ลิงก์นี้จะนำผู้ใช้ไปยังหน้า Frontend สำหรับการตั้งรหัสผ่านใหม่
  const resetLink = `${BASE_URL}/auth/reset-password?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: 'คำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>คำขอรีเซ็ตรหัสผ่าน</h2>
            <p>เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีที่ผูกกับอีเมลนี้ กรุณาคลิกลิงก์ด้านล่างเพื่อดำเนินการตั้งรหัสผ่านใหม่:</p>
            <p>
                <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; color: #ffffff; background-color: #4A90E2; border-radius: 5px; text-decoration: none; font-weight: bold;">
                    ตั้งรหัสผ่านใหม่
                </a>
            </p>
            <p>ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง เพื่อความปลอดภัย</p>
            <p>หากคุณไม่ได้ร้องขอการรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลฉบับนี้</p>
            <p>ขอบคุณครับ</p>
            <p>ทีมงาน</p>
        </div>
      `,
    });

    if (error) {
      throw new Error(`Resend Error: ${error.message}`);
    }

    console.log('Reset password email sent successfully to:', toEmail, 'ID:', data.id);
    return true;

  } catch (err) {
    console.error('Failed to send reset password email:', err);
    throw err;
  }
}