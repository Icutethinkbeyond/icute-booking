import { NextRequest, NextResponse } from 'next/server';
import { DocumentStep, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {

    try {

        const { searchParams } = new URL(req.url);
        const maintenanceId = searchParams.get('maintenanceId');

        if (!maintenanceId) {
            return new NextResponse(JSON.stringify('Maintenance Id not found'), { status: 404 });
        }

        let updatedDocument;

        await prisma.$transaction(async (tx) => {

            let _document = await tx.maintenance.findFirst({ where: { maintenanceId }, select: { documentId: true } })

            if (!_document) {
                throw new Error('Document Id are required');
            }

            updatedDocument = await tx.document.update({
                where: {
                    documentId: _document.documentId
                },
                data: {
                    documentStep: DocumentStep.WithdrawPart,
                },
            })
        });

        return new NextResponse(JSON.stringify({ message: "Updated", updatedDocument }), { status: 200 });

    } catch (error: any) {

        console.error('Error updating document:', error);

        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}