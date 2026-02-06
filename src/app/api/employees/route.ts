import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserAndStoreIdsByToken } from '@/utils/lib/auth';
import bcrypt from "bcryptjs";
import { Employee } from "@/interfaces/Store";
import { deleteImage, handleImageUpload } from "@/utils/services/cloudinary.service";
import dayjs from "dayjs";
import { prisma } from "@/../lib/prisma";

// [GET] ดึงข้อมูลพนักงานทั้งหมด พร้อม Pagination + Search + Filter
export async function GET(request: NextRequest) {
    try {
        const { storeId } = await getCurrentUserAndStoreIdsByToken(request);
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = parseInt(searchParams.get("pageSize") || "10");
        const limit = parseInt(searchParams.get("limit") || pageSize.toString());
        const skip = (page - 1) * limit;

        // Get search and filter params
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "all";

        // Build where clause
        const where: any = {
            storeId,
            isDelete: false
        };

        // Add search filter (search in name, surname, email, phone)
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { surname: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Add status filter
        if (status === 'active') {
            where.isActive = true;
        } else if (status === 'inactive') {
            where.isActive = false;
        }

        const [employees, total] = await Promise.all([
            prisma.employee.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: { role: true, services: true } // ดึงข้อมูลความสัมพันธ์มาด้วย
            }),
            prisma.employee.count({ where }),
        ]);

        return NextResponse.json({
            data: employees,
            metadata: {
                total,
                page,
                pageSize: limit,
                lastPage: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error('GET /api/employees Error:', error);
        return NextResponse.json({
            message: "Internal Server Error",
            error: error.message
        }, { status: 500 });
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

export async function PATCH(request: NextRequest) {
    let _newImage: any = null;
    let _oldImageId: string | null = null;

    try {
        const { storeId } = await getCurrentUserAndStoreIdsByToken(request);
        const data = await request.json();

        const {
            id: employeeId, // ต้องส่ง ID ของพนักงานมาด้วย
            name, surname, nickname, email, password, confirmPassword,
            phone, note, position, startDate, isActive,
            roleId, serviceIds, workingDays, leaves,
            imageId: currentImageId // ID รูปปัจจุบัน
        } = data;

        console.log(employeeId)

        if (!employeeId) {
            return NextResponse.json({ message: 'ไม่พบ ID พนักงานที่ต้องการแก้ไข' }, { status: 400 });
        }

        // 1. ตรวจสอบสิทธิ์และการมีอยู่ของพนักงาน
        const currentEmployee = await prisma.employee.findFirst({
            where: { id: employeeId, storeId: storeId }
        });

        if (!currentEmployee) {
            return NextResponse.json({ message: 'ไม่พบข้อมูลพนักงานในร้านค้าของคุณ' }, { status: 404 });
        }

        // 2. ตรวจสอบ Email ซ้ำ (ถ้ามีการเปลี่ยนอีเมล)
        if (email && email !== currentEmployee.email) {
            const emailExists = await prisma.employee.findFirst({ where: { email } });
            if (emailExists) return NextResponse.json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 400 });
        }

        // 3. จัดการรูปภาพ
        // ถ้ามีการส่ง imageUrl ใหม่มา (Base64) ให้แจ้ง handleImageUpload จัดการ
        _newImage = await handleImageUpload({
            file: data.imageUrl,
            publicId: currentImageId, // ส่ง ID เดิมไปเพื่อให้ handleImageUpload จัดการแทนที่/ลบ
            folder: "employees",
        });

        _oldImageId = currentEmployee.imageId;

        // 4. เตรียมข้อมูล Password (ถ้ามีการกรอกมา)
        let hashedPassword = currentEmployee.password;
        if (password) {
            if (password !== confirmPassword) {
                return NextResponse.json({ message: 'รหัสผ่านไม่ตรงกัน' }, { status: 400 });
            }
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // 5. อัปเดตข้อมูลด้วย Transaction
        // ล้างข้อมูลเดิมใน Nested Tables และเพิ่มใหม่เพื่อให้ข้อมูลเป็นปัจจุบันที่สุด
        const updatedEmployee = await prisma.$transaction(async (tx) => {

            // 1. ดึง ID ของ WorkingDays ทั้งหมดของพนักงานคนนี้ออกมาก่อน
            const oldWorkingDays = await tx.employeeWorkingDay.findMany({
                where: { employeeId },
                select: { id: true }
            });
            const oldWorkingDayIds = oldWorkingDays.map(day => day.id);

            // 2. ลบ TimeSlots (ลูกคนเล็ก) ที่เชื่อมกับ WorkingDays เหล่านั้น
            await tx.employeeWorkingTime.deleteMany({
                where: { workingDayId: { in: oldWorkingDayIds } }
            });

            // ลบ WorkingDays และ Leaves เดิมออกก่อน
            await tx.employeeWorkingDay.deleteMany({ where: { employeeId } });
            await tx.employeeLeave.deleteMany({ where: { employeeId } });

            return await tx.employee.update({
                where: { id: employeeId },
                data: {
                    name,
                    surname,
                    nickname,
                    email,
                    password: hashedPassword,
                    phone,
                    note,
                    position,
                    isActive: typeof isActive === 'string' ? isActive === 'true' : isActive,
                    startDate: startDate ? dayjs(startDate).toDate() : null,
                    roleId: roleId || null,

                    // รูปภาพ (ถ้ามีการเปลี่ยนใหม่ _newImage จะมีค่า)
                    imageId: _newImage?.publicId ?? currentEmployee.imageId,
                    imageUrl: _newImage?.url ?? currentEmployee.imageUrl,

                    // Services (Many-to-Many: ใช้ set เพื่อล้างค่าเก่าและใส่ค่าใหม่ตาม array ที่ส่งมา)
                    services: {
                        set: serviceIds?.map((id: string) => ({ id })) || [],
                    },

                    // สร้าง WorkingDays ใหม่
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

                    // สร้าง Leaves ใหม่
                    leaves: {
                        create: leaves?.map((leave: any) => ({
                            startDate: new Date(leave.startDate),
                            endDate: new Date(leave.endDate),
                            leaveType: leave.leaveType,
                            note: leave.note
                        })) || []
                    }
                },
                include: {
                    workingDays: { include: { timeSlots: true } },
                    leaves: true,
                    services: true
                }
            });
        });

        const { password: _, ...employeeResponse } = updatedEmployee;

        return NextResponse.json({
            message: 'อัปเดตข้อมูลพนักงานสำเร็จ',
            employee: employeeResponse
        }, { status: 200 });

    } catch (error: any) {
        console.error('Update Employee Error:', error);

        // Rollback: หาก DB พังแต่รูปอัปโหลดไปแล้ว ให้ลบรูปใหม่ทิ้ง
        if (_newImage?.publicId && _newImage.publicId !== _oldImageId) {
            await deleteImage(_newImage.publicId);
        }

        return NextResponse.json({
            message: error.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล'
        }, { status: 500 });
    }
}