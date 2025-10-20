import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export const sendEmail = async (to: string, subject: string, templateName: string, replacements: Record<string, string>) => {
  try {
    // สร้าง transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // ใช้จาก ENV
      port: Number(process.env.EMAIL_PORT) || 587, // ใช้จาก ENV
      secure: process.env.EMAIL_SECURE === "true", // ใช้ TLS/SSL
      auth: {
          user: process.env.EMAIL_USER, // อีเมลผู้ส่ง
          pass: process.env.EMAIL_PASSWORD, // รหัสผ่าน
      },
    });

    // อ่านเทมเพลต HTML
    const templatePath = path.join(process.cwd(), "src", "utils", "templates", "emails", `${templateName}.html`);
    let html = fs.readFileSync(templatePath, "utf8");

    // แทนค่าตัวแปรในเทมเพลต
    Object.keys(replacements).forEach((key) => {
      const value = replacements[key];
      html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
    });

    // ส่งอีเมล
    await transporter.sendMail({
      from: '"Your Company" <your-email@example.com>',
      to,
      subject,
      html,
    });

    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};