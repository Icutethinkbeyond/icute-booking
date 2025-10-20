import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { EquipmentType } from '@/interfaces/Category_Type';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        // ดึง query parameters เช่น equipmentTypeId
        const { searchParams } = new URL(req.url);
        const equipmentTypeId = searchParams.get('equipmentTypeId');
        const getbycharacter = searchParams.get('getbycharacter');

        let categories;

        if (getbycharacter) {

            categories = await prisma.equipmentType.findMany({
                select: {
                    equipmentTypeId: true,
                    equipmentTypeName: true,
                }
            });

            // if (character.length < 3) {
            //     categories = await prisma.equipmentType.findMany({
            //         select: {
            //             equipmentTypeId: true,
            //             equipmentTypeName: true,
            //         },
            //         where: {
            //             equipmentTypeName: {
            //                 contains: character
            //             }
            //         }
            //     });
            // }

            if (!categories) {
                return new NextResponse(JSON.stringify('Type not found'), { status: 404 });
            }

            return new NextResponse(
                JSON.stringify({
                    data: categories,
                }),
                { status: 200 }
            );
        }

        if (equipmentTypeId) {
            // ค้นหา equipmentType ตาม ID
            categories = await prisma.equipmentType.findUnique({
                where: {
                    equipmentTypeId,
                },
                include: {
                    equipments: true, // ดึงข้อมูล equipments ที่เชื่อมโยงด้วย
                },
            });

            if (!categories) {
                return new NextResponse(JSON.stringify('equipmentType not found'), { status: 404 });
            }
        } else {

            const page = parseInt(searchParams.get('page') || '1', 10); // หน้าเริ่มต้นที่ 1
            const pageSize = parseInt(searchParams.get('pageSize') || '10', 10); // จำนวนข้อมูลต่อหน้าเริ่มต้นที่ 10

            // คำนวณ skip และ take
            const skip = (page - 1) * pageSize;
            const take = pageSize;

            // ดึงข้อมูลจากฐานข้อมูล
            const [categories, totalItems] = await Promise.all([
                prisma.equipmentType.findMany({
                    skip,
                    take,
                    orderBy: { createdAt: 'desc' }, // เรียงลำดับตามวันที่สร้าง
                }),
                prisma.equipmentType.count(), // นับจำนวนทั้งหมดของรายการ
            ]);

            // คำนวณค่าที่เกี่ยวข้องกับ pagination
            const totalPages = Math.ceil(totalItems / pageSize);

            // เพิ่ม rowIndex ในข้อมูลแต่ละแถว
            const categoriesWithIndex = categories.map((equipmentType, index) => ({
                ...equipmentType,
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
        }

        // return new NextResponse(JSON.stringify(categories), { status: 200 });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(req: NextRequest) {

    try {

        const { equipmentTypeName, equipmentTypeDesc } = await req.json() as EquipmentType;

        // Validation
        if (!equipmentTypeName) {
            return new NextResponse(JSON.stringify('equipmentType name is required'), { status: 400 });
        }

        //check name is exist
        const nameIsAlready = await prisma.equipmentType.findFirst({ where: { equipmentTypeName: { equals: equipmentTypeName } } })

        if (nameIsAlready) {
            return new NextResponse(JSON.stringify('equipmentType name is Already'), { status: 400 });
        }

        // Create a new equipmentType
        const newequipmentType = await prisma.equipmentType.create({
            data: {
                equipmentTypeName,
                equipmentTypeDesc,
                // equipments: equipments ? { connect: equipments } : undefined, // Assuming `equipments` is an array of IDs
            },
        });

        return new NextResponse(JSON.stringify(newequipmentType), { status: 201 });

    } catch (error) {

        console.error("Error Connect Local Server:", error);
        return new NextResponse(JSON.stringify({ error }), { status: 500 });

    } finally {
        await prisma.$disconnect();
    }

};

export async function DELETE(req: NextRequest) {

    try {
        // รับ equipmentTypeId จาก query parameter
        const { searchParams } = new URL(req.url);
        const equipmentTypeId = searchParams.get('equipmentTypeId');

        // ตรวจสอบว่ามี equipmentTypeId หรือไม่
        if (!equipmentTypeId) {
            return new NextResponse(JSON.stringify('equipmentType ID is required'), { status: 400 });
        }

        // ลบ equipmentType โดยใช้ equipmentTypeId
        const deletedequipmentType = await prisma.equipmentType.delete({
            where: {
                equipmentTypeId,
            },
        });

        // ส่งข้อมูล equipmentType ที่ถูกลบกลับ
        return new NextResponse(JSON.stringify(deletedequipmentType), { status: 200 });
    } catch (error: any) {
        console.error('Error deleting equipmentType:', error);

        if (error.code === 'P2025') {
            // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
            return new NextResponse(JSON.stringify('equipmentType not found'), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function PATCH(req: NextRequest) {

    try {

        const { equipmentTypeId, equipmentTypeName, equipmentTypeDesc } = await req.json() as EquipmentType;

        if (!(equipmentTypeId && equipmentTypeName)) {
            return new NextResponse(JSON.stringify('equipmentType ID is required'), { status: 400 });
        }

        const updatedequipmentType = await prisma.equipmentType.update({
            where: { equipmentTypeId: equipmentTypeId },
            data: {
                equipmentTypeName, equipmentTypeDesc
            },
            // Update fields based on the request body
        });

        return new NextResponse(JSON.stringify(updatedequipmentType), { status: 200 });

    } catch (error: any) {

        console.error('Error updating equipmentType:', error);

        if (error.code === 'P2025') {
            // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
            return new NextResponse(JSON.stringify('equipmentType not found'), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}