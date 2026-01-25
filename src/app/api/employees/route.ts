import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserAndStoreIdsByToken } from '@/utils/lib/auth';
import bcrypt from "bcryptjs";
import { Employee } from "@/interfaces/Store";
import { EmployeeBreakTime } from '../../../interfaces/Store';
import { deleteImage, handleImageUpload } from "@/utils/services/cloudinary.service";
import dayjs from "dayjs";

const prisma = new PrismaClient();

// [GET] ดึงข้อมูลพนักงานทั้งหมด พร้อม Pagination
export async function GET(request: NextRequest) {
    try {
        const { storeId } = await getCurrentUserAndStoreIdsByToken(request);
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const [employees, total] = await Promise.all([
            prisma.employee.findMany({
                where: { storeId },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: { role: true, services: true } // ดึงข้อมูลความสัมพันธ์มาด้วย
            }),
            prisma.employee.count({ where: { storeId } }),
        ]);

        return NextResponse.json({
            data: employees,
            metadata: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}



/**
 * POST /api/employee
 * สำหรับเพิ่มบริการใหม่
 */
export async function POST(request: NextRequest) {
    let _image: any = null;

    try {
        const { storeId } = await getCurrentUserAndStoreIdsByToken(request);
        const data: Employee = await request.json();

        const {
            name, surname, nickname, email, password, confirmPassword,
            phone, note, position, startDate, isActive,
            roleId, serviceIds, workingDays, leaves
        } = data;

        // --- 1. Validation ---
        if (!name || !surname || !email || !password) {
            return NextResponse.json({ message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ message: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน' }, { status: 400 });
        }

        // ตรวจสอบว่ามีพนักงานที่ใช้อีเมลนี้แล้วหรือยัง
        const existingEmployee = await prisma.employee.findFirst({
            where: { email: email }
        });
        if (existingEmployee) {
            return NextResponse.json({ message: 'อีเมลนี้ถูกใช้งานในระบบพนักงานแล้ว' }, { status: 400 });
        }

        // --- 2. Image Management ---
        // จัดการรูปภาพ (ถ้ามีการส่งไฟล์ Base64 มาใน data.imageUrl)
        _image = await handleImageUpload({
            file: data.imageUrl,
            folder: "employees",
        });

        // --- 3. Data Preparation ---
        const hashedPassword = await bcrypt.hash(password, 10);
        const serviceConnects = serviceIds.map((id: any) => ({ id }));

        // --- 4. Database Create ---
        const newEmployee = await prisma.employee.create({
            data: {
                name,
                surname,
                nickname,
                email,
                password: hashedPassword,
                phone,
                note,
                position,
                isActive: typeof isActive === 'string' ? Boolean(isActive) : isActive,
                startDate: startDate ? dayjs(startDate).format() : null,
                // storeId: storeId,
                // roleId: roleId || null,

                // รูปภาพจาก Cloudinary
                imageId: _image?.publicId,
                imageUrl: _image?.url,

                // Many-to-Many Relation (เก็บเป็น array of IDs ใน MongoDB)
                // serviceIds: serviceIds || [],
                services: {
                    connect: serviceConnects,
                },

                store: {
                    connect: { id: storeId }
                },

                // Nested Create สำหรับตารางเวลาทำงาน
                workingDays: {
                    create: workingDays?.map((day: any) => ({
                        dayOfWeek: day.dayOfWeek,
                        isWorking: day.isWorking,
                        timeSlots: {
                            create: day.timeSlots?.map((slot: any) => ({
                                startTime: slot.startTime,
                                endTime: slot.endTime,
                            })) || []
                        }
                    })) || []
                },

                // 🔥 2. เพิ่มส่วนวันลา (Leaves)
                leaves: {
                    create: leaves?.map((leave: any) => ({
                        startDate: new Date(leave.startDate),
                        endDate: new Date(leave.endDate),
                        leaveType: leave.leaveType, // ต้องตรงกับ Enum: SICK, VACATION, etc.
                        note: leave.note
                    })) || []
                }


            },
            include: {
                workingDays: {
                    include: { timeSlots: true }
                },
                leaves: true // ให้ส่งค่า leaves กลับไปหลังสร้างเสร็จด้วย
            }
        });

        // ลบ password ออกก่อนส่งกลับ
        const { password: _, ...employeeWithoutPassword } = newEmployee;

        return NextResponse.json({
            message: 'เพิ่มพนักงานใหม่สำเร็จแล้ว',
            employee: employeeWithoutPassword
        }, { status: 201 });

    } catch (error: any) {
        console.error('Create Employee Error:', error);

        // Rollback รูปภาพถ้า DB พัง
        if (_image?.publicId) {
            await deleteImage(_image.publicId);
        }

        return NextResponse.json({
            message: error.message || 'เกิดข้อผิดพลาดในการเพิ่มพนักงาน'
        }, { status: 500 });
    }
}