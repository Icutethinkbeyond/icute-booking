import { NextRequest, NextResponse } from 'next/server';
import { DocumentCategory, DocumentStep, EquipmentOwner, EquipmentStatus, PrismaClient, RepairStatus } from '@prisma/client';
import { Category } from '@/interfaces/Category_Type';
import { BrokenItems, Part } from '@/interfaces/Maintenance';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        // ดึง query parameters เช่น documentId
        const { searchParams } = new URL(req.url);
        const maintenanceId = searchParams.get('maintenanceId');
        let brokenItems;

        if (!maintenanceId) {
            return new NextResponse(JSON.stringify('maintenanceId not found'), { status: 404 });
        }

        brokenItems = await prisma.brokenItems.findMany({
            where: {
                maintenanceId,
                // AND: {
                //     repairStatus: RepairStatus.Waiting
                // }
            },
            include: {
                equipment: true,
                // parts: true
            },
        });

        if (!brokenItems) {
            return new NextResponse(JSON.stringify('BrokenItems not found'), { status: 404 });
        }

        return new NextResponse(JSON.stringify(brokenItems), { status: 200 });

        // return new NextResponse(JSON.stringify(documents), { status: 200 });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(req: NextRequest, res: NextResponse) {

    try {
        const brokenItems = await req.json() as BrokenItems[];

        if (!Array.isArray(brokenItems)) {
            return new NextResponse(JSON.stringify({ error: "Invalid data format" }), { status: 400 });
        }

        // console.log(brokenItems)

        await prisma.$transaction(async (tx) => {

            let maId = brokenItems[0].maintenanceId;

            let _document = await tx.maintenance.findFirst({ where: { maintenanceId: maId }, select: { documentId: true } })

            if (!_document) {
                throw new Error('DocumentId are required');
            }

            for (const brokenItem of brokenItems) {

                let {
                    brokenItemsId,
                    equipmentId,
                    maintenanceId,
                    quantity,
                    equipmentOwner,
                    equipmentName,
                    parts
                } = brokenItem as BrokenItems;

                if (!parts?.length) {
                    console.log('Part are required')
                    continue;
                }

                if (!brokenItemsId) {
                    throw new Error('brokenItemsId are required');
                }

                for (const part of parts) {


                    // console.log(part)
                    const {
                        partName,
                        partStatus,
                        quantity,
                        partPrice,
                        partDesc,
                        partSerialNo,
                        brand,
                        unitName,
                        brokenItemsId,
                        partId
                    } = part as Part

                    if(partId){
                        continue
                    }

                    if (!partName) {
                        throw new Error('partName are required');
                    }

                    if (!quantity) {
                        throw new Error('quantity are required');
                    }

                    // if (typeof(partPrice) !== 'number') {
                    //     throw new Error('partPrice are required');
                    // }

                    let newPart = await tx.part.create({
                        data: {
                            partName,
                            partStatus,
                            quantity,
                            partPrice: (typeof partPrice === 'string') ? parseFloat(partPrice) : partPrice,
                            partDesc,
                            partSerialNo,
                            brand,
                            unitName,
                            brokenItemsId,
                        },
                    })
                }

            }

            await prisma.document.update({
                where: {
                    documentId: _document.documentId
                },
                data: {
                    documentStep: DocumentStep.Repairman
                }
            })


        });

        return new NextResponse(JSON.stringify({ message: "Data processed successfully" }), { status: 201 });

    } catch (error) {
        console.error("Error processing data:", error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }

};

export async function DELETE(req: NextRequest) {

    try {
        // รับ categoryId จาก query parameter
        const { searchParams } = new URL(req.url);
        const partId = searchParams.get('partId');

        // ตรวจสอบว่ามี categoryId หรือไม่
        if (!partId) {
            return new NextResponse(JSON.stringify('part ID is required'), { status: 400 });
        }

        // ลบ category โดยใช้ categoryId
        const deletedPart = await prisma.part.delete({
            where: {
                partId,
            },
        });

        // ส่งข้อมูล category ที่ถูกลบกลับ
        return new NextResponse(JSON.stringify(deletedPart), { status: 200 });
    } catch (error: any) {
        console.error('Error deleting category:', error);

        if (error.code === 'P2025') {
            // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
            return new NextResponse(JSON.stringify('Category not found'), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {

    try {

        const { brokenItemsId,
            equipmentId,
            maintenanceId,
            quantity,
            equipmentOwner,
            equipmentName } = await req.json() as BrokenItems;

        let updatedBrokenItem

        await prisma.$transaction(async (tx) => {

            // let maId = brokenItems[0].maintenanceId;

            // let _document = await tx.maintenance.findFirst({ where: { maintenanceId: maId }, select: { documentId: true } })

            // if (!_document) {
            //     throw new Error('DocumentId are required');
            // }

            if (!maintenanceId) {
                throw new Error(`Maintenance with ID ${maintenanceId} not found`);
            }

            if (!equipmentId) {
                throw new Error('EquipmentId are required');
            }

            if (equipmentOwner === EquipmentOwner.Plant) {
                // ส่งอุปกรณ์คืน Stock
                let updatedEquipment = await tx.aboutEquipment.update({
                    where: { equipmentId },
                    data: {
                        stockStatus: EquipmentStatus.InStock
                    },
                })
            }

            updatedBrokenItem = await tx.brokenItems.update({
                where: {
                    brokenItemsId
                },
                data: {
                    repairStatus: RepairStatus.Cancel,
                },
            })
        });

        return new NextResponse(JSON.stringify({ message: "Updated", updatedBrokenItem }), { status: 200 });

    } catch (error: any) {

        console.error('Error updating category:', error);

        if (error.code === 'P2025') {
            // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
            return new NextResponse(JSON.stringify('Category not found'), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}