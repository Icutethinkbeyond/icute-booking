import { NextRequest, NextResponse } from 'next/server';
import { AboutEquipment, Category, PrismaClient, Prisma, EquipmentStatus, UserStatus, RoleName } from '@prisma/client';
import { Equipment } from '@/interfaces/Equipment';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {

        const { searchParams } = new URL(req.url);
        let fullname = searchParams.get('fullname');
        let department = searchParams.get('department');
        let position = searchParams.get('position');
        let _role = searchParams.get('role');
        let _status = searchParams.get('status');

        const page = parseInt(searchParams.get('page') || '1', 10); // หน้าเริ่มต้นที่ 1
        const pageSize = parseInt(searchParams.get('pageSize') || '10', 10); // จำนวนข้อมูลต่อหน้าเริ่มต้นที่ 10

        // คำนวณ skip และ take
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        // ดึงข้อมูลจากฐานข้อมูล
        const [user, totalItems] = await Promise.all([
            prisma.user.findMany({
                skip,
                take,
                orderBy: { createdAt: 'desc' }, // เรียงลำดับตามวันที่สร้าง
                select: {
                    userId: true,
                    email: true,
                    name: true,
                    department: true,
                    position: true,
                    image: true,
                    manDay: true,
                    phone: true,
                    userStatus: true,
                    address: true,
                    role: true
                },
                where: {
                    userStatus: UserStatus.Active,
                    ...(fullname && { name: { contains: fullname, mode: "insensitive" } }),
                    ...(department && { department: { contains: department, mode: "insensitive" } }),
                    ...(position && { position: { contains: position, mode: "insensitive" } }),
                    ...(_role && { role: { name: _role as RoleName } }),
                    ...(_status && { userStatus: _status as UserStatus }),
                },
            }),
            prisma.user.count(), // นับจำนวนทั้งหมดของรายการ
        ]);

        // คำนวณค่าที่เกี่ยวข้องกับ pagination
        const totalPages = Math.ceil(totalItems / pageSize);

        // เพิ่ม rowIndex ในข้อมูลแต่ละแถว
        const userWithIndex = user.map((user, index) => ({
            ...user,
            rowIndex: skip + index + 1, // ลำดับแถวเริ่มต้นจาก 1 และเพิ่มตาม pagination
        }));

        return new NextResponse(
            JSON.stringify({
                data: userWithIndex,
                pagination: {
                    page,
                    pageSize,
                    totalItems,
                    totalPages,
                },
            }),
            { status: 200 }
        );

    } catch (error) {
        console.error('Error fetching user:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}
