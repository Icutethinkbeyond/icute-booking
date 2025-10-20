import { NextRequest, NextResponse } from 'next/server';
import { DocumentStatus, DocumentStep, LocationType, PrismaClient } from '@prisma/client';
import { Site } from '@/interfaces/Site';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        // ดึง query parameters เช่น siteId
        const { searchParams } = new URL(req.url);
        const siteId = searchParams.get('siteId');
        const getbycharacter = searchParams.get('getbycharacter');

        // const siteCategory = searchParams.get('siteCategory');

        let sites;

        if (getbycharacter) {

            sites = await prisma.site.findMany({
                select: {
                    siteId: true,
                    siteName: true,
                }
            });

            if (!sites) {
                return new NextResponse(JSON.stringify('Site not found'), { status: 404 });
            }

            return new NextResponse(
                JSON.stringify({
                    data: sites,
                }),
                { status: 200 }
            );
        }

        if (siteId) {
            // ค้นหา site ตาม ID
            let site = await prisma.site.findUnique({
                where: {
                    siteId,
                },
            });

            if (!site) {
                return new NextResponse(JSON.stringify('Site not found'), { status: 404 });
            }

            return new NextResponse(JSON.stringify(site), { status: 200 });

        } else {

            const page = parseInt(searchParams.get('page') || '1', 10); // หน้าเริ่มต้นที่ 1
            const pageSize = parseInt(searchParams.get('pageSize') || '10', 10); // จำนวนข้อมูลต่อหน้าเริ่มต้นที่ 10

            // คำนวณ skip และ take
            const skip = (page - 1) * pageSize;
            const take = pageSize;

            // ดึงข้อมูลจากฐานข้อมูล
            const [sites, totalItems] = await Promise.all([
                prisma.site.findMany({
                    skip,
                    take,
                    orderBy: { createdAt: 'desc' }, // เรียงลำดับตามวันที่สร้าง
                }),
                prisma.site.count(), // นับจำนวนทั้งหมดของรายการ
            ]);

            // คำนวณค่าที่เกี่ยวข้องกับ pagination
            const totalPages = Math.ceil(totalItems / pageSize);

            // เพิ่ม rowIndex ในข้อมูลแต่ละแถว
            const sitesWithIndex = sites.map((site, index) => ({
                ...site,
                rowIndex: skip + index + 1, // ลำดับแถวเริ่มต้นจาก 1 และเพิ่มตาม pagination
            }));

            return new NextResponse(
                JSON.stringify({
                    data: sitesWithIndex,
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

        // return new NextResponse(JSON.stringify(sites), { status: 200 });
    } catch (error) {
        console.error('Error fetching sites:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(req: NextRequest) {

    try {

        const {
            siteName,
            siteDesc,
            siteId,
            repairLocation,
            contactorName,
            contactorEmail,
            contactorTel, documentId } = await req.json() as Site;


        const { searchParams } = new URL(req.url);
        const quickly = searchParams.get('quickly');

        // Validation
        if (!siteName) {
            return new NextResponse(JSON.stringify('siteName is required'), { status: 400 });
        }

        if (quickly && (quickly === 'false')) {

            //check name is exist
            const idSiteNameIsAlready = await prisma.site.findFirst({ where: { siteName: { equals: siteName } } })

            if (idSiteNameIsAlready) {
                return new NextResponse(JSON.stringify('SiteName is Already'), { status: 400 });
            }

            const newSite = await prisma.site.create({
                data: {
                    siteName,
                    siteDesc,
                    contactorName,
                    contactorEmail,
                    contactorTel
                },
            });

            return new NextResponse(JSON.stringify({ siteName: newSite.siteName }), { status: 200 });
        } else {


            //check name is exist
            const idSiteNameIsAlready = await prisma.site.findFirst({ where: { siteName: { equals: siteName } } })

            if (idSiteNameIsAlready) {

                await prisma.site.update({
                    where: {
                        siteId: siteId
                    },
                    data: {
                        siteDesc,
                        contactorName,
                        contactorEmail,
                        contactorTel
                    },
                });

                return new NextResponse(JSON.stringify({ documentId: documentId }), { status: 200 });
            }

            try {

                // Validation
                if (!documentId) {
                    return new NextResponse(JSON.stringify('documentId is required'), { status: 400 });
                }

                let newSite;

                await prisma.$transaction(async (tx) => {

                    newSite = await tx.site.create({
                        data: {
                            siteName,
                            siteDesc,
                            contactorName,
                            contactorEmail,
                            contactorTel
                        },
                    });

                    await tx.document.update({
                        where: {
                            documentId
                        },
                        data: {
                            // repairLocation: (repairLocation && repairLocation === LocationType.OnPlant) ? LocationType.OnPlant : LocationType.OnSite,
                            siteId: newSite.siteId,
                            documentStep: DocumentStep.Equipment,
                        }
                    });

                });

                return new NextResponse(JSON.stringify({ documentId: documentId }), { status: 200 });

            } catch (error) {
                console.error("Transaction failed:", error);
                return new NextResponse(JSON.stringify({ error }), { status: 500 });
            }

        }


        // return new NextResponse(JSON.stringify({ documentId: documentId }), { status: 201 });


    } catch (error) {

        console.error("Error Connect Local Server:", error);
        return new NextResponse(JSON.stringify({ error }), { status: 500 });

    }

};

// export async function DELETE(req: NextRequest) {

//     try {
//         // รับ siteId จาก query parameter
//         const { searchParams } = new URL(req.url);
//         const siteId = searchParams.get('siteId');

//         // ตรวจสอบว่ามี siteId หรือไม่
//         if (!siteId) {
//             return new NextResponse(JSON.stringify('Site ID is required'), { status: 400 });
//         }

//         // ลบ site โดยใช้ siteId
//         const deletedSite = await prisma.site.delete({
//             where: {
//                 siteId,
//             },
//         });

//         // ส่งข้อมูล site ที่ถูกลบกลับ
//         return new NextResponse(JSON.stringify(deletedSite), { status: 200 });
//     } catch (error: any) {
//         console.error('Error deleting site:', error);

//         if (error.code === 'P2025') {
//             // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
//             return new NextResponse(JSON.stringify('Site not found'), { status: 404 });
//         }

//         return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
//     }
// }

export async function PATCH(req: NextRequest) {

    try {

        const {
            siteId,
            siteName,
            siteDesc,
            repairLocation,
            contactorName,
            contactorEmail,
            contactorTel, documentId } = await req.json() as Site;

            const { searchParams } = new URL(req.url);
            const quickly = searchParams.get('quickly');

            console.log(quickly)


        // Validation
        if (!siteName) {
            return new NextResponse(JSON.stringify('siteName is required'), { status: 400 });
        }

        if (quickly && (quickly === 'false')) {

            const updatedSite = await prisma.site.update({
                data: {
                    siteName,
                    siteDesc,
                    contactorName,
                    contactorEmail,
                    contactorTel
                },
                where: {
                    siteId
                }
            });

            return new NextResponse(JSON.stringify({ siteName: updatedSite.siteName }), { status: 200 });
        } else {

        if (!documentId) {
            return new NextResponse(JSON.stringify('documentId is required'), { status: 400 });
        }

        try {


            await prisma.$transaction(async (tx) => {

                await prisma.site.update({
                    where: {
                        siteId
                    },
                    data: {
                        siteDesc,
                        contactorName,
                        contactorEmail,
                        contactorTel
                    },
                });

                await tx.document.update({
                    where: {
                        documentId
                    },
                    data: {
                        // repairLocation: (repairLocation && repairLocation === LocationType.OnPlant) ? LocationType.OnPlant : LocationType.OnSite,
                        siteId: siteId,
                        documentStep: DocumentStep.Equipment,
                    }
                });

            });

            return new NextResponse(JSON.stringify({ documentId: documentId }), { status: 201 });

        } catch (error) {
            console.error("Transaction failed:", error);
            return new NextResponse(JSON.stringify({ error }), { status: 500 });
        }
    }

        

    } catch (error: any) {

        console.error('Error updating site:', error);

        if (error.code === 'P2025') {
            // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
            return new NextResponse(JSON.stringify('Site not found'), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}