import { NextRequest, NextResponse } from 'next/server';
import { DocumentCategory, DocumentStatus, DocumentStep, EquipmentOwner, EquipmentStatus, LocationType, PrismaClient, RepairStatus } from '@prisma/client';
import { Category } from '@/interfaces/Category_Type';
import { Additional, BrokenItems } from '@/interfaces/Maintenance';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        // ดึง query parameters เช่น documentId
        const { searchParams } = new URL(req.url);
        const maintenanceId = searchParams.get('maintenanceId');
        let additional;

        if (maintenanceId) {
            additional = await prisma.additional.findMany({
                where: {
                    maintenanceId,
                },
            });

            if (!additional) {
                return new NextResponse(JSON.stringify('additional not found'), { status: 404 });
            }

            return new NextResponse(JSON.stringify(additional), { status: 200 });

        }
    } catch (error) {
        console.error('Error fetching documents:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(req: NextRequest, res: NextResponse) {

    try {
        const additionals = await req.json() as Additional[];
        const { searchParams } = new URL(req.url);
        const maintenanceId = searchParams.get('maintenanceId');

        if (!Array.isArray(additionals)) {
            return new NextResponse(JSON.stringify({ error: "Invalid data format" }), { status: 400 });
        }

        if (!maintenanceId) {
            return new NextResponse(JSON.stringify({ error: "Invalid Maintenance Id" }), { status: 400 });
        }

        // if(additionals.length === 0){

        await prisma.$transaction(async (tx) => {

            // let maId = additionals[0].maintenanceId;

            let _document = await tx.maintenance.findFirst({ where: { maintenanceId }, select: { documentId: true, repairLocation: true } })

            if (!_document) {
                throw new Error('DocumentId are required');
            }

            if (additionals.length === 0) {

                for (const additional of additionals) {

                    let {
                        additionalId,
                        additionalName,
                        additionalDesc,
                        additionalPrice,
                        maintenanceId
                    } = additional as Additional;

                    if (additionalId) {
                        continue;
                    }

                    // Validation
                    if (!additionalName) {
                        throw new Error('additionalName are required');
                    }

                    // Validation
                    if (!additionalPrice) {
                        throw new Error('additionalPrice are required');
                    }


                    if (!maintenanceId) {
                        throw new Error(`Maintenance with ID ${maintenanceId} not found`);
                    }

                    const newAdditional = await tx.additional.create({
                        data: {
                            additionalName,
                            additionalDesc,
                            additionalPrice,
                            maintenanceId
                        },
                    })
                }

            }

            if (_document.repairLocation === LocationType.OnPlant) {

                await prisma.document.update({
                    where: {
                        documentId: _document.documentId
                    },
                    data: {
                        documentStep: DocumentStep.Approve,
                        documentStatus: DocumentStatus.Open
                    }
                })

            } else {
                await prisma.document.update({
                    where: {
                        documentId: _document.documentId
                    },
                    data: {
                        documentStep: DocumentStep.WaitingApprove,
                        documentStatus: DocumentStatus.WaitingApprove
                    }
                })
            }


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
        const additionalId = searchParams.get('additionalId');

        // ตรวจสอบว่ามี categoryId หรือไม่
        if (!additionalId) {
            return new NextResponse(JSON.stringify('additional ID is required'), { status: 400 });
        }

        // ลบ category โดยใช้ categoryId
        const additionalCategory = await prisma.additional.delete({
            where: {
                additionalId,
            },
        });

        // ส่งข้อมูล category ที่ถูกลบกลับ
        return new NextResponse(JSON.stringify(additionalCategory), { status: 200 });
    } catch (error: any) {
        console.error('Error deleting category:', error);

        if (error.code === 'P2025') {
            // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
            return new NextResponse(JSON.stringify('Category not found'), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

// export async function PATCH(req: NextRequest) {

//     try {

//         const { brokenItemsId,
//             equipmentId,
//             maintenanceId,
//             quantity,
//             equipmentOwner,
//             equipmentName } = await req.json() as BrokenItems;

//         let updatedBrokenItem

//         await prisma.$transaction(async (tx) => {

//             // let maId = brokenItems[0].maintenanceId;

//             // let _document = await tx.maintenance.findFirst({ where: { maintenanceId: maId }, select: { documentId: true } })

//             // if (!_document) {
//             //     throw new Error('DocumentId are required');
//             // }

//             if (!maintenanceId) {
//                 throw new Error(`Maintenance with ID ${maintenanceId} not found`);
//             }

//             if (!equipmentId) {
//                 throw new Error('EquipmentId are required');
//             }

//             if (equipmentOwner === EquipmentOwner.Plant) {
//                 // ส่งอุปกรณ์คืน Stock
//                 let updatedEquipment = await tx.aboutEquipment.update({
//                     where: { equipmentId },
//                     data: {
//                         stockStatus: EquipmentStatus.InStock
//                     },
//                 })
//             }

//             updatedBrokenItem = await tx.brokenItems.update({
//                 where: {
//                     brokenItemsId
//                 },
//                 data: {
//                     repairStatus: RepairStatus.Cancel,
//                 },
//             })
//         });

//         return new NextResponse(JSON.stringify({ message: "Updated", updatedBrokenItem }), { status: 200 });

//     } catch (error: any) {

//         console.error('Error updating category:', error);

//         if (error.code === 'P2025') {
//             // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
//             return new NextResponse(JSON.stringify('Category not found'), { status: 404 });
//         }

//         return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
//     }
// }