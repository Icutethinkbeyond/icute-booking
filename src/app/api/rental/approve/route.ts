import { NextRequest, NextResponse } from 'next/server';
import { DocumentCategory, DocumentStatus, DocumentStep, EquipmentOwner, EquipmentStatus, LocationType, PrismaClient, RepairStatus } from '@prisma/client';
import { Category } from '@/interfaces/Category_Type';
import { Additional, BrokenItems } from '@/interfaces/Maintenance';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, res: NextResponse) {

    try {

        const { documentId } = await req.json() as any;

        if (!documentId) {
            throw new Error('DocumentId are required');
        }

        await prisma.document.update({
            where: {
                documentId: documentId
            },
            data: {
                documentStep: DocumentStep.Approve,
                documentStatus: DocumentStatus.Open
            }
        })

        return new NextResponse(JSON.stringify({ message: "Data processed successfully" }), { status: 201 });

    } catch (error) {

        console.error("Error processing data:", error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });

    }

};

// export async function DELETE(req: NextRequest) {

//     try {
//         // รับ categoryId จาก query parameter
//         const { searchParams } = new URL(req.url);
//         const categoryId = searchParams.get('categoryId');

//         // ตรวจสอบว่ามี categoryId หรือไม่
//         if (!categoryId) {
//             return new NextResponse(JSON.stringify('Category ID is required'), { status: 400 });
//         }

//         // ลบ category โดยใช้ categoryId
//         const deletedCategory = await prisma.category.delete({
//             where: {
//                 categoryId,
//             },
//         });

//         // ส่งข้อมูล category ที่ถูกลบกลับ
//         return new NextResponse(JSON.stringify(deletedCategory), { status: 200 });
//     } catch (error: any) {
//         console.error('Error deleting category:', error);

//         if (error.code === 'P2025') {
//             // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
//             return new NextResponse(JSON.stringify('Category not found'), { status: 404 });
//         }

//         return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
//     }
// }

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