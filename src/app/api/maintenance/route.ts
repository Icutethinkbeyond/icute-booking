import { NextRequest, NextResponse } from 'next/server';
import { DocumentCategory, DocumentStatus, DocumentStep, PrismaClient } from '@prisma/client';
import { Category } from '@/interfaces/Category_Type';
import { Maintenance } from '@/interfaces/Maintenance';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        // ดึง query parameters เช่น documentId

        const { searchParams } = new URL(req.url);
        const documentId = searchParams.get('documentId');

        let maintenance;

        if (documentId) {
            // ค้นหา document ตาม ID
            maintenance = await prisma.maintenance.findFirst({
                where: {
                    documentId,
                    // AND:{
                    //     rentalStatus: RentalStatus.Renting
                    // }
                },
                include: {
                    // equipment: {
                    //     include: {
                    //         aboutEquipment: {
                    //             where: {
                    //                 stockStatus: EquipmentStatus.CurrentlyRenting
                    //             }
                    //         }

                    //     }
                    // },

                }
            });

            if (!maintenance) {
                return new NextResponse(JSON.stringify('Rental not found'), { status: 404 });
            }

            return new NextResponse(JSON.stringify(maintenance), { status: 200 });

        } else {

            const page = parseInt(searchParams.get('page') || '1', 10); // หน้าเริ่มต้นที่ 1
            const pageSize = parseInt(searchParams.get('pageSize') || '10', 10); // จำนวนข้อมูลต่อหน้าเริ่มต้นที่ 10

            // คำนวณ skip และ take
            const skip = (page - 1) * pageSize;
            const take = pageSize;

            // ดึงข้อมูลจากฐานข้อมูล
            const [documents, totalItems] = await Promise.all([
                prisma.document.findMany({
                    skip,
                    take,
                    orderBy: { createdAt: 'desc' }, // เรียงลำดับตามวันที่สร้าง
                    include: {
                        site: true,
                        maintenance: true
                        // include: {
                        //     equipment: true
                        // }

                    },
                    where: {
                        documentType: DocumentCategory.Maintenance
                    }
                }),
                prisma.document.count(), // นับจำนวนทั้งหมดของรายการ
            ]);

            // คำนวณค่าที่เกี่ยวข้องกับ pagination
            const totalPages = Math.ceil(totalItems / pageSize);

            // เพิ่ม rowIndex ในข้อมูลแต่ละแถว
            const documentsWithIndex = documents.map((document, index) => ({
                ...document,
                rowIndex: skip + index + 1, // ลำดับแถวเริ่มต้นจาก 1 และเพิ่มตาม pagination
            }));

            return new NextResponse(
                JSON.stringify({
                    data: documentsWithIndex,
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

        // return new NextResponse(JSON.stringify(documents), { status: 200 });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

// export async function POST(req: NextRequest) {

//     try {

//         const { categoryName, categoryDesc } = await req.json() as Category;

//         // Validation
//         if (!categoryName) {
//             return new NextResponse(JSON.stringify('Category name is required'), { status: 400 });
//         }

//         //check name is exist
//         const nameIsAlready = await prisma.category.findFirst({ where: { categoryName: { equals: categoryName } } })

//         if (nameIsAlready) {
//             return new NextResponse(JSON.stringify('Category name is Already'), { status: 400 });
//         }

//         // Create a new category
//         const newCategory = await prisma.category.create({
//             data: {
//                 categoryName,
//                 categoryDesc,
//                 // equipments: equipments ? { connect: equipments } : undefined, // Assuming `equipments` is an array of IDs
//             },
//         });

//         return new NextResponse(JSON.stringify(newCategory), { status: 201 });

//     } catch (error) {

//         console.error("Error Connect Local Server:", error);
//         return new NextResponse(JSON.stringify({ error }), { status: 500 });

//     }

// };

export async function DELETE(req: NextRequest) {

    try {
        // รับ categoryId จาก query parameter
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId');

        // ตรวจสอบว่ามี categoryId หรือไม่
        if (!categoryId) {
            return new NextResponse(JSON.stringify('Category ID is required'), { status: 400 });
        }

        // ลบ category โดยใช้ categoryId
        const deletedCategory = await prisma.category.delete({
            where: {
                categoryId,
            },
        });

        // ส่งข้อมูล category ที่ถูกลบกลับ
        return new NextResponse(JSON.stringify(deletedCategory), { status: 200 });
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

        const { searchParams } = new URL(req.url);
        const updateRepairStaredStatus = searchParams.get('update-repairstared-status');
        const updateRepairCompleteStatus = searchParams.get('update-repaircomplete-status');

        const {
            natureOfBreakdown,
            causes,
            repairingStart,
            repairingEnd,
            TOFstart,
            TOFend,
            quantity,
            maintenanceRamark,
            technicianName,
            plantEngineer,
            plantApproval,
            repairLocation,
            maintenanceType,
            documentDetials,
            maintenanceId, } = await req.json() as Maintenance

        if (!(maintenanceId)) {
            return new NextResponse(JSON.stringify('maintenanceId is required'), { status: 400 });
        }

        const updatedMaintenanceId = await prisma.maintenance.update({
            where: { maintenanceId },
            data: {
                natureOfBreakdown: natureOfBreakdown && natureOfBreakdown,
                causes: causes && causes,
                repairingStart: (repairingStart !== null || repairingStart !== undefined) ? dayjs(repairingStart).format() : null,
                repairingEnd: (repairingEnd !== null || repairingEnd !== undefined) ? dayjs(repairingEnd).format() : null,
                TOFstart: (TOFstart !== null || TOFstart !== undefined) ? dayjs(TOFstart).format() : null,
                TOFend: (TOFend !== null || TOFend !== undefined) ? dayjs(TOFend).format() : null,
                maintenanceRamark: maintenanceRamark && maintenanceRamark,
                technicianName: technicianName && technicianName,
                plantEngineer: plantEngineer && plantEngineer,
                plantApproval: plantApproval && plantApproval,
                repairLocation: repairLocation && repairLocation,
                maintenanceType: maintenanceType && maintenanceType,
            },
            // Update fields based on the request body
        });

        if (Boolean(updateRepairStaredStatus) === true) {
            await prisma.$transaction(async (tx) => {

                let _document = await tx.maintenance.findFirst({ where: { maintenanceId }, select: { documentId: true } })

                if (!_document) {
                    throw new Error('Document Id are required');
                }

                let updatedDocument = await tx.document.update({
                    where: {
                        documentId: _document.documentId
                    },
                    data: {
                        documentStep: DocumentStep.RepairStared,
                    },
                })
            });
        }

        if (Boolean(updateRepairCompleteStatus) === true) {
            await prisma.$transaction(async (tx) => {

                let _document = await tx.maintenance.findFirst({ where: { maintenanceId }, select: { documentId: true } })

                if (!_document) {
                    throw new Error('Document Id are required');
                }

                let updatedDocument = await tx.document.update({
                    where: {
                        documentId: _document.documentId
                    },
                    data: {
                        documentStep: DocumentStep.RepairComplete,
                        documentStatus: DocumentStatus.Close
                    },
                })
            });
        }

        return new NextResponse(JSON.stringify(updatedMaintenanceId), { status: 200 });

    } catch (error: any) {

        console.error('Error updating category:', error);

        if (error.code === 'P2025') {
            // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
            return new NextResponse(JSON.stringify('Category not found'), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}