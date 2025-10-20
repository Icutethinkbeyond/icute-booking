import { NextRequest, NextResponse } from 'next/server';
import { AboutEquipment, Category, PrismaClient, Prisma, EquipmentStatus } from '@prisma/client';
import { Equipment } from '@/interfaces/Equipment';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {

    try {
        // ดึง query parameters เช่น categoryId
        const { searchParams } = new URL(req.url);
        let categoryName = searchParams.get('categoryName');

        const page = parseInt(searchParams.get('page') || '1', 10); // หน้าเริ่มต้นที่ 1
        const pageSize = parseInt(searchParams.get('pageSize') || '10', 10); // จำนวนข้อมูลต่อหน้าเริ่มต้นที่ 10

        // คำนวณ skip และ take
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        // ดึงข้อมูลจากฐานข้อมูล
        const [categories, totalItems] = await Promise.all([
            prisma.category.findMany({
                skip,
                take,
                orderBy: { createdAt: 'desc' }, // เรียงลำดับตามวันที่สร้าง
                include: {
                    _count: {
                        select: { equipments: true }, // นับจำนวนอุปกรณ์ในแต่ละ category
                    },
                },
                where: {
                    ...(categoryName && { categoryName: { contains: categoryName, mode: "insensitive" } }),
                },
            }),
            prisma.category.count(), // นับจำนวนทั้งหมดของรายการ
        ]);

        // คำนวณค่าที่เกี่ยวข้องกับ pagination
        const totalPages = Math.ceil(totalItems / pageSize);

        // เพิ่ม rowIndex ในข้อมูลแต่ละแถว
        const categoriesWithIndex = categories.map((category, index) => ({
            ...category,
            rowIndex: skip + index + 1, // ลำดับแถวเริ่มต้นจาก 1 และเพิ่มตาม pagination
        }));

        return new NextResponse(
            JSON.stringify({
                data: categoriesWithIndex,
                pagination: {
                    page,
                    pageSize,
                    totalItems,
                    totalPages,
                },
            }),
            { status: 200 }
        );


        // return new NextResponse(JSON.stringify(categories), { status: 200 });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
