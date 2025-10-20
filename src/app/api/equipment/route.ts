import { NextRequest, NextResponse } from 'next/server';
import { AboutEquipment, Category, PrismaClient, Prisma, EquipmentStatus, EquipmentOwner } from '@prisma/client';
import { Equipment } from '@/interfaces/Equipment';
import dayjs from 'dayjs';
import { isEqualIgnoreCaseAndWhitespace } from '@/utils/utils';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // ดึง query parameters เช่น equipmentId
        const { searchParams } = new URL(req.url);
        const equipmentId = searchParams.get('equipmentId');
        const getbycharacter = searchParams.get('getbycharacter');
        const readyForRentalList = searchParams.get('ready-for-rental-list');
        const readyForFixList = searchParams.get('ready-for-fix-list');

        let equipment;

        if (readyForFixList) {

            equipment = await prisma.equipment.findMany({
                select: {
                    equipmentId: true,
                    equipmentName: true,
                    serialNo: true
                },
                where: {
                    equipmentOwn: true,
                    aboutEquipment: {
                        stockStatus: EquipmentStatus.InStock || EquipmentStatus.CurrentlyRenting, // เงื่อนไขใน AboutEquipment
                    },
                }
            });

            if (!equipment) {
                return new NextResponse(JSON.stringify('Category not found'), { status: 404 });
            }

            return new NextResponse(
                JSON.stringify({
                    data: equipment,
                }),
                { status: 200 }
            );
        }

        if (readyForRentalList) {

            equipment = await prisma.equipment.findMany({
                select: {
                    equipmentId: true,
                    equipmentName: true,
                    serialNo: true
                },
                where: {
                    aboutEquipment: {
                        stockStatus: EquipmentStatus.InStock, // เงื่อนไขใน AboutEquipment
                    },
                }

            });

            if (!equipment) {
                return new NextResponse(JSON.stringify('Category not found'), { status: 404 });
            }

            return new NextResponse(
                JSON.stringify({
                    data: equipment,
                }),
                { status: 200 }
            );
        }

        if (getbycharacter) {

            equipment = await prisma.equipment.findMany({
                select: {
                    equipmentId: true,
                    equipmentName: true,
                    serialNo: true
                },
            });

            if (!equipment) {
                return new NextResponse(JSON.stringify('Category not found'), { status: 404 });
            }

            return new NextResponse(
                JSON.stringify({
                    data: equipment,
                }),
                { status: 200 }
            );
        }

        if (equipmentId) {
            // ค้นหา equipment ตาม ID
            equipment = await prisma.equipment.findUnique({
                include: {
                    aboutEquipment: true
                },
                where: {
                    equipmentId,
                }
            });

            if (!equipment) {
                return new NextResponse(JSON.stringify('equipment not found'), { status: 404 });
            }

            return new NextResponse(JSON.stringify(equipment), { status: 200 });

        } else {

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
                    where: {
                        equipmentOwn: true
                    },
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
        }

        // return new NextResponse(JSON.stringify(equipment), { status: 200 });

    } catch (error) {
        console.error('Error fetching equipment:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

export async function POST(req: NextRequest) {

    try {

        const data = await req.json() as Equipment;
        const { equipmentName, equipmentOwn, categoryId, equipmentTypeId, aboutEquipment, serialNo, brand, model, description } = data;
        const { rentalPriceCurrent, rentalPricePre, equipmentPrice, unitName, stockStatus, purchaseDate, registerDate, PO, fixAssetsNumber, QTY, BTLNumber } = aboutEquipment as AboutEquipment;


        // Validation
        if (!equipmentName) {
            return new NextResponse(JSON.stringify('Equipment name is required'), { status: 400 });
        }

        const serialNoIsAlready = await prisma.equipment.findFirst({ where: { serialNo: { equals: serialNo } } })

        if (serialNoIsAlready) {
            return new NextResponse(JSON.stringify(`หมายเลข SerialNumber ${equipmentName} มีแล้ว`), { status: 400 });
        }

        const _equipmentName = await prisma.equipment.findFirst({
            where: { equipmentName }
        });

        const _modelName = await prisma.equipment.findFirst({
            where: { model }
        });

        let _existingEquipment: boolean = isEqualIgnoreCaseAndWhitespace(`${_equipmentName}${_modelName}`, `${equipmentName}${model}`);

        if (_existingEquipment) {
            return new NextResponse(JSON.stringify('Existing Equipment is already'), { status: 400 });
        }

        let uncategorizedCategory: any = null;
        let uncategorizedEquipmentType: any = null;

        if (categoryId) {
            uncategorizedCategory = await prisma.category.findFirst({ select: { categoryId: true }, where: { categoryName: { equals: 'uncategorized' } } })
        }

        if (equipmentTypeId) {
            uncategorizedEquipmentType = await prisma.equipmentType.findFirst({ select: { equipmentTypeId: true }, where: { equipmentTypeName: { equals: 'unequipmenttype' } } })
        }

        try {
            await prisma.$transaction(async (tx) => {

                // Create a new equipment
                const newEquipment = await tx.equipment.create({
                    data: {
                        equipmentName,
                        serialNo,
                        model,
                        description,
                        equipmentOwn,
                        categoryId: categoryId ? categoryId : uncategorizedCategory?.categoryId,
                        equipmentTypeId: equipmentTypeId ? equipmentTypeId : uncategorizedEquipmentType?.equipmentTypeId,
                        brand
                    },
                });

                // ขั้นตอนที่ 2: สร้าง AboutEquipment ที่เชื่อมกับ Equipment ที่เพิ่งสร้าง
                await tx.aboutEquipment.create({
                    data: {
                        equipmentId: newEquipment.equipmentId, // ใช้ equipmentId จากขั้นตอนก่อนหน้า
                        rentalPriceCurrent: (typeof rentalPriceCurrent === 'string') ? parseFloat(rentalPriceCurrent) : rentalPriceCurrent,
                        rentalPricePre: (typeof rentalPricePre === 'string') ? parseFloat(rentalPricePre) : rentalPricePre,
                        equipmentPrice: (typeof equipmentPrice === 'string') ? parseFloat(equipmentPrice) : equipmentPrice,
                        rentalUpdateAt: new Date(),
                        purchaseDate: purchaseDate ? dayjs(purchaseDate).format() : null,
                        registerDate: registerDate ? dayjs(registerDate).format() : null,
                        unitName,
                        stockStatus: stockStatus,
                        PO: PO,
                        fixAssetsNumber,
                        QTY: (typeof QTY === 'string') ? parseFloat(QTY) : QTY,
                        BTLNumber: BTLNumber
                    },
                });
            });

            console.log("Successfully created both Equipment and AboutEquipment");
            return new NextResponse(JSON.stringify("Successfully created both Equipment and AboutEquipment"), { status: 201 });

        } catch (error) {

            console.error("Transaction failed:", error);
            return new NextResponse(JSON.stringify({ error }), { status: 500 });
        }

    } catch (error) {

        console.error("Error Connect Local Server:", error);
        return new NextResponse(JSON.stringify({ error }), { status: 500 });

    } finally {
        await prisma.$disconnect();
    }

};

export async function DELETE(req: NextRequest) {

    try {
        // รับ equipmentId จาก query parameter
        const { searchParams } = new URL(req.url);
        const equipmentId = searchParams.get('equipmentId');

        // ตรวจสอบว่ามี equipmentId หรือไม่
        if (!equipmentId) {
            return new NextResponse(JSON.stringify('equipment ID is required'), { status: 400 });
        }

        // ลบ equipment โดยใช้ equipmentId
        const deletedequipment = await prisma.aboutEquipment.update({
            include: {
                equipment: true
            },
            where: {
                equipmentId,
            },
            data: {
                stockStatus: EquipmentStatus.InActive
            }
        });

        // ส่งข้อมูล equipment ที่ถูกลบกลับ
        return new NextResponse(JSON.stringify({ equipmentName: deletedequipment.equipment.equipmentName }), { status: 200 });
    } catch (error: any) {
        console.error('Error deleting equipment:', error);

        if (error.code === 'P2025') {
            // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
            return new NextResponse(JSON.stringify('equipment not found'), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {

    try {

        const data = await req.json() as Equipment;
        // const { equipmentName, equipmentOwn, categoryId, equipmentTypeId, aboutEquipment, serialNo, brand, equipmentId } = data;
        // const { rentalPriceCurrent, rentalPricePre, equipmentPrice, unitName, stockStatus, purchaseDate, registerDate } = aboutEquipment as AboutEquipment;

        const { equipmentName, equipmentOwn, categoryId, equipmentTypeId, aboutEquipment, serialNo, brand, model, equipmentId, description } = data;
        const { rentalPriceCurrent, rentalPricePre, equipmentPrice, unitName, stockStatus, purchaseDate, registerDate, PO, fixAssetsNumber, QTY, BTLNumber } = aboutEquipment as AboutEquipment;

        

        console.log(data)

        // Validation
        if (!equipmentName) {
            return new NextResponse(JSON.stringify('Equipment name is required'), { status: 400 });
        }

        let uncategorizedCategory: any = null;
        let uncategorizedEquipmentType: any = null;

        if (categoryId) {
            uncategorizedCategory = await prisma.category.findFirst({ select: { categoryId: true }, where: { categoryName: { equals: 'uncategorized' } } })
        }

        if (equipmentTypeId) {
            uncategorizedEquipmentType = await prisma.equipmentType.findFirst({ select: { equipmentTypeId: true }, where: { equipmentTypeName: { equals: 'unequipmenttype' } } })
        }
        try {
            await prisma.$transaction(async (tx) => {

                // Create a new equipment
                const newEquipment = await tx.equipment.update({
                    where: { equipmentId },
                    data: {
                        equipmentName,
                        serialNo,
                        model,
                        equipmentOwn,
                        description,
                        categoryId: categoryId ? categoryId : uncategorizedCategory?.categoryId,
                        equipmentTypeId: equipmentTypeId ? equipmentTypeId : uncategorizedEquipmentType?.equipmentTypeId,
                        brand
                    },
                });

                // ขั้นตอนที่ 2: สร้าง AboutEquipment ที่เชื่อมกับ Equipment ที่เพิ่งสร้าง
                await tx.aboutEquipment.update({
                    where: { equipmentId },
                    data: {
                        equipmentId: newEquipment.equipmentId, // ใช้ equipmentId จากขั้นตอนก่อนหน้า
                        rentalPriceCurrent: (typeof rentalPriceCurrent === 'string') ? parseFloat(rentalPriceCurrent) : rentalPriceCurrent,
                        rentalPricePre: (typeof rentalPricePre === 'string') ? parseFloat(rentalPricePre) : rentalPricePre,
                        equipmentPrice: (typeof equipmentPrice === 'string') ? parseFloat(equipmentPrice) : equipmentPrice,
                        rentalUpdateAt: new Date(),
                        purchaseDate: purchaseDate ? dayjs(purchaseDate).format() : null,
                        registerDate: registerDate ? dayjs(registerDate).format() : null,
                        unitName,
                        stockStatus: stockStatus,
                        PO,
                        fixAssetsNumber,
                        QTY: (typeof QTY === 'string') ? parseFloat(QTY) : QTY,
                        BTLNumber: BTLNumber
                    },
                });



            });

            console.log("Successfully Updated both Equipment and AboutEquipment");
            return new NextResponse(JSON.stringify("Successfully Updated both Equipment and AboutEquipment"), { status: 201 });

        } catch (error) {

            console.error("Transaction failed:", error);
            return new NextResponse(JSON.stringify({ error }), { status: 500 });
        }
    } catch (error: any) {

        console.error('Error updating equipment:', error);

        if (error.code === 'P2025') {
            // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
            return new NextResponse(JSON.stringify('equipment not found'), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}