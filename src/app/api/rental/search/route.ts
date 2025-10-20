import { NextRequest, NextResponse } from 'next/server';
import { AboutEquipment, Category, PrismaClient, Prisma, EquipmentStatus, DocumentStatus } from '@prisma/client';
import { Equipment } from '@/interfaces/Equipment';
import dayjs from 'dayjs';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {


        const { searchParams } = new URL(req.url);
        let documentIdno = searchParams.get('documentIdno');
        let siteIdNo = searchParams.get('siteIdNo');
        let documentStatus = searchParams.get('documentStatus');

        const page = parseInt(searchParams.get('page') || '1', 10); // หน้าเริ่มต้นที่ 1
        const pageSize = parseInt(searchParams.get('pageSize') || '10', 10); // จำนวนข้อมูลต่อหน้าเริ่มต้นที่ 10

        // คำนวณ skip และ take
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        // ดึงข้อมูลจากฐานข้อมูล
        const [document, totalItems] = await Promise.all([
            prisma.document.findMany({
                skip,
                take,
                orderBy: { createdAt: 'desc' }, // เรียงลำดับตามวันที่สร้าง
                include: {
                    site: true,
                    rental: {
                        include: {
                            equipment: true
                        }
                    }
                },
                where: {
                    ...(documentIdno && { documentIdNo: { contains: documentIdno, mode: "insensitive" } }),
                    ...(documentStatus && { documentStatus: documentStatus as DocumentStatus }),
                    ...(siteIdNo && { site: { siteName: { contains: siteIdNo, mode: "insensitive" } } }),
                },
            }),
            prisma.document.count(), // นับจำนวนทั้งหมดของรายการ
        ]);

        // คำนวณค่าที่เกี่ยวข้องกับ pagination
        const totalPages = Math.ceil(totalItems / pageSize);

        // เพิ่ม rowIndex ในข้อมูลแต่ละแถว
        const documentWithIndex = document.map((document, index) => ({
            ...document,
            rowIndex: skip + index + 1, // ลำดับแถวเริ่มต้นจาก 1 และเพิ่มตาม pagination
        }));

        return new NextResponse(
            JSON.stringify({
                data: documentWithIndex,
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
        console.error('Error fetching document:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}
