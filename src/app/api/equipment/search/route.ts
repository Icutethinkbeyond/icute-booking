import { NextRequest, NextResponse } from 'next/server';
import { AboutEquipment, Category, PrismaClient, Prisma, EquipmentStatus } from '@prisma/client';
import { Equipment } from '@/interfaces/Equipment';
import dayjs from 'dayjs';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

function handleEquipmentStatus(status: EquipmentStatus) {
    switch (status) {
        case "InStock":
            console.log("The equipment is in stock and available.");
            return EquipmentStatus.InStock
            break;
        // case "WillBeSold":
        //     console.log("The equipment is marked for sale.");
        //     return EquipmentStatus.WillBeSold
        //     break;
        case "CurrentlyRenting":
            console.log("The equipment is currently being rented.");
            return EquipmentStatus.CurrentlyRenting
            break;
        case "Damaged":
            console.log("The equipment is damaged and requires attention.");
            return EquipmentStatus.Damaged
            break;
        // case "RepairingAtSupplier":
        //     console.log("The equipment is being repaired at the supplier.");
        //     return EquipmentStatus.RepairingAtSupplier
        //     break;
        case "Broken":
            console.log("The equipment is broken and needs replacement.");
            return EquipmentStatus.Broken
            break;
        default:
            console.log("Unknown status. Please check the input.");
    }
}


export async function GET(req: NextRequest) {
    try {


        const { searchParams } = new URL(req.url);
        let serialNo = searchParams.get('serialNo');
        let equipmentName = searchParams.get('equipmentName');
        let _stockStatus = searchParams.get('stockStatus');

        const page = parseInt(searchParams.get('page') || '1', 10); // หน้าเริ่มต้นที่ 1
        const pageSize = parseInt(searchParams.get('pageSize') || '10', 10); // จำนวนข้อมูลต่อหน้าเริ่มต้นที่ 10

        // คำนวณ skip และ take
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        // ดึงข้อมูลจากฐานข้อมูล
        const [equipment, totalItems] = await Promise.all([
            prisma.equipment.findMany({
                skip,
                take,
                orderBy: { createdAt: 'desc' }, // เรียงลำดับตามวันที่สร้าง
                include: {
                    category: {
                        select: {
                            categoryId: true,
                            categoryName: true,
                        },
                    }, // ดึงข้อมูลที่เกี่ยวข้องกับ Category
                    aboutEquipment: true, // ดึงข้อมูลที่เกี่ยวข้องกับ AboutEquipment
                    equipmentType: {
                        select: {
                            equipmentTypeId: true,
                            equipmentTypeName: true,
                        },
                    }, // ดึงข้อมูลที่เกี่ยวข้องกับ EquipmentType
                },
                where: {
                    ...(serialNo && { serialNo: { contains: serialNo, mode: "insensitive" } }),
                    ...(equipmentName && { equipmentName: { contains: equipmentName, mode: "insensitive" } }),
                    ...(_stockStatus && { aboutEquipment: { stockStatus: _stockStatus as EquipmentStatus } }),
                },
            }),
            prisma.equipment.count(), // นับจำนวนทั้งหมดของรายการ
        ]);

        // คำนวณค่าที่เกี่ยวข้องกับ pagination
        const totalPages = Math.ceil(totalItems / pageSize);

        // เพิ่ม rowIndex ในข้อมูลแต่ละแถว
        const equipmentWithIndex = equipment.map((equipment, index) => ({
            ...equipment,
            rowIndex: skip + index + 1, // ลำดับแถวเริ่มต้นจาก 1 และเพิ่มตาม pagination
        }));

        return new NextResponse(
            JSON.stringify({
                data: equipmentWithIndex,
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
        console.error('Error fetching equipment:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}
