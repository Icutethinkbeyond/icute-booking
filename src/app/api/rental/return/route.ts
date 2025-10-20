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
        const returnItem = searchParams.get('returnitem');
        const documentId = searchParams.get('documentId');
        const rentalId = searchParams.get('rentalId');
        const date = searchParams.get('date')

        let rentalCheck;

        if (returnItem) {

            if (!rentalId) {
                return new NextResponse(JSON.stringify('rental Id not found'), { status: 404 });
            }

            if (!documentId) {
                return new NextResponse(JSON.stringify('documentId not found'), { status: 404 });
            }

            await prisma.$transaction(async (tx) => {

                // ยกเลิกการเช่า 1 รายการ
                let rentalUpdated = await tx.rental.update({
                    data: {
                        rentalStatus: RentalStatus.Returned,
                        dismantlingDatePlan: dayjs(date).format()
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

                rentalCheck = await tx.rental.findMany({
                    where: {
                        documentId,
                        AND: {
                            rentalStatus: RentalStatus.Renting
                        }
                    },
                });

                // console.log(rentalCheck.length)

                if (rentalCheck.length === 0) {
                    // ยกเลิกเอกสาร
                    await tx.document.update({
                        data: {
                            documentStatus: DocumentStatus.Close
                        },
                        where: {
                            documentId: documentId,
                        },
                    });
                }
            })


            return new NextResponse(JSON.stringify({ message: "Update Success", redirect: false }), { status: 200 });

        }

        // return new NextResponse(JSON.stringify('parameter not found'), { status: 404 });

    } catch (error) {
        console.error('Error fetching documents:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
