import { NextRequest, NextResponse } from 'next/server';
import { DocumentStatus, DocumentStep, LocationType, PrismaClient } from '@prisma/client';
import { Site } from '@/interfaces/Site';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";


export async function PATCH(req: NextRequest) {

    try {

        const {
            siteId, documentId } = await req.json() as Site;

        const { searchParams } = new URL(req.url);
        const quickly = searchParams.get('quickly');

        console.log(quickly)


        // Validation
        if (!siteId) {
            return new NextResponse(JSON.stringify('siteId is required'), { status: 400 });
        }
        await prisma.document.update({
            where: {
                documentId
            },
            data: {
                // repairLocation: (repairLocation && repairLocation === LocationType.OnPlant) ? LocationType.OnPlant : LocationType.OnSite,
                siteId: siteId,
                documentStep: DocumentStep.Equipment,
            }
        });

        return new NextResponse(JSON.stringify({ documentId: documentId }), { status: 201 });

    } catch (error: any) {

        console.error('Error updating site:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}