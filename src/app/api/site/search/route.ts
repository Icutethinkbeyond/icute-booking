import { NextRequest, NextResponse } from 'next/server';
import { AboutEquipment, Category, PrismaClient, Prisma, EquipmentStatus, UserStatus, RoleName } from '@prisma/client';
import { Equipment } from '@/interfaces/Equipment';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {

        const { searchParams } = new URL(req.url);
        let siteName = searchParams.get('siteName');
        let contactorEmail = searchParams.get('contactorEmail');
        let contactorName = searchParams.get('contactorName');

        const page = parseInt(searchParams.get('page') || '1', 10); // หน้าเริ่มต้นที่ 1
        const pageSize = parseInt(searchParams.get('pageSize') || '10', 10); // จำนวนข้อมูลต่อหน้าเริ่มต้นที่ 10

        // คำนวณ skip และ take
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        // ดึงข้อมูลจากฐานข้อมูล
        const [site, totalItems] = await Promise.all([
            prisma.site.findMany({
                skip,
                take,
                orderBy: { createdAt: 'desc' }, // เรียงลำดับตามวันที่สร้าง,
                where: {
                    ...(contactorName && { contactorName: { contains: contactorName, mode: "insensitive" } }),
                    ...(contactorEmail && { contactorEmail: { contains: contactorEmail, mode: "insensitive" } }),
                    ...(siteName && { siteName: { contains: siteName, mode: "insensitive" } }),
                },
            }),
            prisma.site.count(), // นับจำนวนทั้งหมดของรายการ
        ]);

        // คำนวณค่าที่เกี่ยวข้องกับ pagination
        const totalPages = Math.ceil(totalItems / pageSize);

        // เพิ่ม rowIndex ในข้อมูลแต่ละแถว
        const siteWithIndex = site.map((site, index) => ({
            ...site,
            rowIndex: skip + index + 1, // ลำดับแถวเริ่มต้นจาก 1 และเพิ่มตาม pagination
        }));

        return new NextResponse(
            JSON.stringify({
                data: siteWithIndex,
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
        console.error('Error fetching site:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}
