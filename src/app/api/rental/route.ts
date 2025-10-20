import { NextRequest, NextResponse } from 'next/server';
import { DocumentCategory, DocumentStatus, DocumentStep, EquipmentStatus, PrismaClient, RentalStatus } from '@prisma/client';
import { Rental } from '@/interfaces/Rental';
import dayjs, { Dayjs } from 'dayjs';
import { compareDates } from '@/utils/utils';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        // ดึง query parameters เช่น documentId
        const { searchParams } = new URL(req.url);
        const documentId = searchParams.get('documentId');

        let rentals;

        if (documentId) {
            // ค้นหา document ตาม ID
            rentals = await prisma.rental.findMany({
                where: {
                    documentId,
                    AND: {
                        rentalStatus: RentalStatus.Renting
                    }
                },
                include: {
                    equipment: {
                        include: {
                            aboutEquipment: true

                        }
                    },

                }
            });

            if (!rentals) {
                return new NextResponse(JSON.stringify('Rental not found'), { status: 404 });
            }

            return new NextResponse(JSON.stringify(rentals), { status: 200 });

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
                        rental: {
                            include: {
                                equipment: true
                            }
                        }
                    }
                    ,
                    where: {
                        documentType: DocumentCategory.Rental
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


export async function POST(req: NextRequest) {

    try {
        const rentals = await req.json();

        if (!Array.isArray(rentals) || rentals.length === 0) {
            return new NextResponse(JSON.stringify('No rental data provided'), { status: 400 });
        }

        const rentalIds: string[] = [];

        await prisma.$transaction(async (tx) => {

            for (const rental of rentals) {
                const {
                    documentId,
                    equipmentId,
                    rentalRemark,
                    erentionDatePlan,
                    dismantlingDatePlan,
                    rentalStatus,
                    equipment,
                    rentalId
                } = rental as Rental;

                if (rentalId) {
                    continue;
                }

                // Validation
                if (!equipmentId || !erentionDatePlan) {
                    throw new Error('equipmentId and erentionDatePlan are required');
                }

                const checkEquipment = await tx.aboutEquipment.findUnique({
                    where: { equipmentId },
                });

                if (!checkEquipment) {
                    throw new Error(`Equipment with ID ${equipmentId} not found`);
                }

                if (checkEquipment.stockStatus === 'CurrentlyRenting') {
                    throw new Error(`Equipment with ID ${equipmentId} is currently renting`);
                }

                if (!documentId) {
                    throw new Error('documentId is required');
                }

                const _document = await tx.document.findUnique({
                    where: { documentId },
                });

                if (!_document) {
                    throw new Error(`Document with ID ${documentId} not found`);
                }

                if (_document.documentStep === DocumentStep.Approve && _document.documentStatus === DocumentStatus.Open) {
                    throw new Error(`Document be Closed`);
                }

                // Create Rental
                const newRental = await tx.rental.create({
                    data: {
                        documentId,
                        equipmentId,
                        rentalRemark,
                        erentionDatePlan: dayjs(erentionDatePlan).toISOString(),
                        dismantlingDatePlan: dismantlingDatePlan ? dayjs(dismantlingDatePlan).toISOString() : null,
                        rentalStatus,
                    },
                });

                // Update Equipment Status

                if (compareDates(dayjs(erentionDatePlan).toISOString(), new Date()) === 1) {
                    await tx.aboutEquipment.update({
                        where: { equipmentId },
                        data: { stockStatus: EquipmentStatus.Booked },
                    });
                } else {
                    await tx.aboutEquipment.update({
                        where: { equipmentId },
                        data: { stockStatus: EquipmentStatus.CurrentlyRenting },
                    });
                }

                // Update Document Status
                await tx.document.update({
                    where: { documentId },
                    data: {
                        documentStep: DocumentStep.WaitingApprove,
                        documentStatus: DocumentStatus.WaitingApprove
                    },
                });

                rentalIds.push(newRental.rentalId);
            }
        });

        return new NextResponse(JSON.stringify({ message: 'Rentals created successfully', rentalIds }), { status: 201 });

    } catch (error: any) {
        console.error('Error creating rentals:', error.message);
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
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

// export async function PATCH(req: NextRequest) {

//     try {

//         const { categoryId, categoryName, categoryDesc, categoryRemark } = await req.json() as Category;

//         if (!(categoryId && categoryName)) {
//             return new NextResponse(JSON.stringify('Category ID is required'), { status: 400 });
//         }

//         const updatedCategory = await prisma.category.update({
//             where: { categoryId: categoryId },
//             data: {
//                 categoryName, categoryDesc, categoryRemark
//             },
//             // Update fields based on the request body
//         });

//         return new NextResponse(JSON.stringify(updatedCategory), { status: 200 });

//     } catch (error: any) {

//         console.error('Error updating category:', error);

//         if (error.code === 'P2025') {
//             // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
//             return new NextResponse(JSON.stringify('Category not found'), { status: 404 });
//         }

//         return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
//     }
// }