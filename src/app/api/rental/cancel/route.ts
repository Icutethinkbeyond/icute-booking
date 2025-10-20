import { NextRequest, NextResponse } from 'next/server';
import { DocumentCategory, DocumentStatus, DocumentStep, EquipmentStatus, PrismaClient, RentalStatus } from '@prisma/client';
import { Rental } from '@/interfaces/Rental';
import dayjs, { Dayjs } from 'dayjs';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
    try {
        // ดึง query parameters เช่น documentId
        const { searchParams } = new URL(req.url);
        const cancle = searchParams.get('cancle');
        const rentalcancle = searchParams.get('rentalcancle');
        const documentId = searchParams.get('documentId');
        const rentalId = searchParams.get('rentalId');

        let rentals;

        if (cancle && documentId) {

            await prisma.$transaction(async (tx) => {

                rentals = await tx.rental.findMany({
                    where: {
                        documentId: documentId,
                    },
                    select: {
                        equipmentId: true
                    }
                });

                // คืนค่าอุปกรณ์ในคลัง
                for (const rental of rentals) {

                    await tx.aboutEquipment.updateMany({
                        data: {
                            stockStatus: EquipmentStatus.InStock
                        },
                        where: {
                            equipmentId: rental.equipmentId,
                        },
                    });

                }

                // ยกเลิกการเช่า
                await tx.rental.updateMany({
                    data: {
                        rentalStatus: RentalStatus.Cancel
                    },
                    where: {
                        documentId: documentId,
                    },
                });


                // ยกเลิกเอกสาร
                await tx.document.update({
                    data: {
                        documentStatus: DocumentStatus.Cancel
                    },
                    where: {
                        documentId: documentId,
                    },
                });

            })

            return new NextResponse(JSON.stringify("Update Success"), { status: 200 });


        }

        if (rentalcancle) {
            if (!rentalId) {
                return new NextResponse(JSON.stringify('rental Id not found'), { status: 404 });
            }

            await prisma.$transaction(async (tx) => {

                // ยกเลิกการเช่า 1 รายการ
                let rentalUpdated = await tx.rental.update({
                    data: {
                        rentalStatus: RentalStatus.Cancel
                    },
                    where: {
                        rentalId,
                    },
                });

                await tx.aboutEquipment.update({
                    data: {
                        stockStatus: EquipmentStatus.InStock
                    },
                    where: {
                        equipmentId: rentalUpdated.equipmentId,
                    },
                });
            })

            return new NextResponse(JSON.stringify("Update Success"), { status: 200 });
        }

        // if (documentId) {
        //     // ค้นหา document ตาม ID
        //     rentals = await prisma.rental.findMany({
        //         where: {
        //             documentId,
        //         },
        //         include: {
        //             equipment: {
        //                 include: {
        //                     aboutEquipment: true
        //                 }
        //             },

        //         }
        //     });

        //     if (!rentals) {
        //         return new NextResponse(JSON.stringify('Rental not found'), { status: 404 });
        //     }

        //     return new NextResponse(JSON.stringify(rentals), { status: 200 });

        // } else {


        // }

        // return new NextResponse(JSON.stringify(documents), { status: 200 });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
