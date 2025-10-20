import { NextRequest, NextResponse } from 'next/server';
import { DocumentCategory, DocumentStatus, DocumentStep, EquipmentOwner, EquipmentStatus, LocationType, PrismaClient, RepairStatus } from '@prisma/client';
import { Document } from "../../../interfaces/Document"
import { BrokenItems, Maintenance, Repairman } from '@/interfaces/Maintenance';
import dayjs from 'dayjs';
import { getMonthAbbreviation } from '@/utils/utils';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // ดึง query parameters เช่น documentId
        const { searchParams } = new URL(req.url);
        const documentId = searchParams.get('documentId');
        const getbycharacter = searchParams.get('getbycharacter');

        const documentCategory = searchParams.get('documentCategory');

        let documents;

        if (getbycharacter) {

            documents = await prisma.document.findMany({
                select: {
                    documentId: true,
                    documentIdNo: true,
                }, where: {
                    documentType: {
                        equals: documentCategory === DocumentCategory.Maintenance ? DocumentCategory.Maintenance : DocumentCategory.Rental
                    }
                }
            });

            if (!documents) {
                return new NextResponse(JSON.stringify('Document not found'), { status: 404 });
            }

            return new NextResponse(
                JSON.stringify({
                    data: documents,
                }),
                { status: 200 }
            );
        }

        if (documentId) {
            // ค้นหา document ตาม ID
            documents = await prisma.document.findFirst({
                where: {
                    OR: [
                        { documentIdNo: documentId },
                        { documentId: documentId }, // ค้นหาจาก documentId
                    ]
                },
                include: {
                    site: true,
                    maintenance: true,
                    rental: true
                }
            });

            console.log(documents)

            if (!documents) {
                return new NextResponse(JSON.stringify('Document not found'), { status: 404 });
            }

            return new NextResponse(JSON.stringify({ data: documents }), { status: 200 });

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

//         const { documentId,
//             documentIdNo,
//             documentDetials,
//             documentType,
//             siteId,
//             documentStatus,
//             rental,
//             maintenance } = await req.json() as Document;


//         // console.log(documentType)

//         // Validation
//         if (!documentIdNo) {
//             return new NextResponse(JSON.stringify('documentIdNo is required'), { status: 400 });
//         }

//         //check name is exist
//         const idNumberIsAlready = await prisma.document.findFirst({
//             where: {
//                 documentIdNo: { equals: documentIdNo },
//                 // AND: {
//                 //     documentType: documentType
//                 // }
//             }
//         })

//         if (idNumberIsAlready) {

//             if (idNumberIsAlready.documentStatus === DocumentStatus.Close) {
//                 return new NextResponse(JSON.stringify({ message: "เอกสารถูกปิดการเเก้ไขเเล้ว" }), { status: 400 });
//             }

//             if (idNumberIsAlready.documentStatus === DocumentStatus.Cancel) {
//                 return new NextResponse(JSON.stringify({ message: "เอกสารถูกยกเลิกเเล้ว" }), { status: 400 });
//             }

//             const unEditStatus = [
//                 "Approve",
//                 "WithdrawPart",
//                 "RepairStared",
//                 "RepairComplete",
//             ];

//             if (unEditStatus.includes(idNumberIsAlready.documentStep.toString()) && idNumberIsAlready.documentStatus === DocumentStatus.Open) {
//                 return new NextResponse(JSON.stringify({ message: "เอกสารได้รับการอนุมัติเเล้ว เเละอยู่ระหว่างดำเนินการ" }), { status: 400 });
//             }

//             try {

//                 await prisma.document.update({
//                     where: {
//                         documentIdNo: documentIdNo,
//                         AND: {
//                             documentType: documentType
//                         }
//                     },
//                     data: {
//                         documentDetials,
//                     },
//                 });

//                 return new NextResponse(JSON.stringify({ message: "Updated Success", documentIdNo: idNumberIsAlready.documentIdNo, documentId: idNumberIsAlready.documentId }), { status: 200 });

//             } catch (e) {
//                 return new NextResponse(JSON.stringify({ message: "Document Id Is Ready To Used", documentIdNo: idNumberIsAlready.documentIdNo, documentId: idNumberIsAlready.documentId }), { status: 400 });
//             }

//         } else {

//             console.log('ไม่พบเอกสาร ระบบกำลังสร้างเอกสารใหม่')


//             if (documentType === DocumentCategory.Maintenance) {
//                 //สร้าง maintenance ด้วยยยย

//                 const {
//                     natureOfBreakdown,
//                     causes,
//                     repairingStart,
//                     repairingEnd,
//                     TOFstart,
//                     TOFend,
//                     maintenanceRamark,
//                     technicianName,
//                     plantEngineer,
//                     plantApproval,
//                     repairLocation,
//                     maintenanceType } = maintenance as Maintenance


//                 let documentAndMaintenance = await prisma.$transaction(async (tx) => {

//                     // Create a new document
//                     const newDocument = await prisma.document.create({
//                         data: {
//                             documentIdNo,
//                             documentDetials,
//                             documentType,
//                             documentStatus: DocumentStatus.Draft,
//                             documentStep: repairLocation === LocationType.OnPlant ? DocumentStep.Equipment : DocumentStep.Location
//                         },
//                     });

//                     const newMaintenace = await tx.maintenance.create({
//                         data: {
//                             natureOfBreakdown,
//                             causes,
//                             repairingStart: repairingStart ? dayjs(repairingStart).format() : null,
//                             TOFstart: TOFstart ? dayjs(TOFstart).format() : null,
//                             maintenanceRamark,
//                             repairLocation,
//                             maintenanceType,
//                             documentId: newDocument.documentId
//                         },
//                     });

//                     return { newDocument, newMaintenace }

//                 });

//                 return new NextResponse(JSON.stringify({
//                     message: "Created Success",
//                     documentIdNo: documentAndMaintenance.newDocument.documentIdNo,
//                     documentId: documentAndMaintenance.newDocument.documentId,
//                     maintenanceId: documentAndMaintenance.newMaintenace.maintenanceId
//                 }), { status: 201 });

//             } else {
//                 // Create a new document
//                 const newDocument = await prisma.document.create({
//                     data: {
//                         documentIdNo,
//                         documentDetials,
//                         documentType,
//                         documentStatus: DocumentStatus.Draft,
//                     },
//                 });

//                 return new NextResponse(JSON.stringify({ message: "Created Success", documentIdNo: newDocument.documentIdNo, documentId: newDocument.documentId }), { status: 201 });

//             }

//         }

//     } catch (error) {

//         console.error("Error Connect Local Server:", error);
//         return new NextResponse(JSON.stringify({ error }), { status: 500 });

//     }

// };

export async function POST(req: NextRequest) {

    try {

        const { documentId,
            // documentIdNo,
            documentDetials,
            documentType,
            siteId,
            documentStatus,
            rental,
            maintenance } = await req.json() as Document;

        let _docType = null;

        if (documentType === "Maintenance") {
            _docType = "MA";
        } else {
            _docType = "RT";
        }

        // Get current month and year
        const now = new Date();
        const monthAbbr = getMonthAbbreviation(now.getMonth()); // getMonth() เริ่มที่ 0 = มกราคม
        const year = now.getFullYear().toString();

        // Find the latest document for current month/year/type
        const latestDocument = await prisma.document.findFirst({
            where: {
                docType: _docType,
                docMonth: monthAbbr,
                docYear: year,
            },
            orderBy: {
                documentIdNo: 'desc', // เรียงจากมากไปน้อย
            },
            select: {
                documentIdNo: true,
            },
        });

        // Get new running number
        let newRunningNumber = 1;

        if (latestDocument?.documentIdNo) {
            const latestRunningNumber = parseInt(latestDocument.documentIdNo);
            if (!isNaN(latestRunningNumber)) {
                newRunningNumber = latestRunningNumber + 1;
            }
        }

        // Format running number to 5 digits
        const runningNumberStr = newRunningNumber.toString().padStart(5, '0');

        // Assemble the final ID
        const documentCode = `${_docType}-${monthAbbr}-${year}-${runningNumberStr}`;


        // if (idNumberIsAlready) {

        //     if (idNumberIsAlready.documentStatus === DocumentStatus.Close) {
        //         return new NextResponse(JSON.stringify({ message: "เอกสารถูกปิดการเเก้ไขเเล้ว" }), { status: 400 });
        //     }

        //     if (idNumberIsAlready.documentStatus === DocumentStatus.Cancel) {
        //         return new NextResponse(JSON.stringify({ message: "เอกสารถูกยกเลิกเเล้ว" }), { status: 400 });
        //     }

        //     const unEditStatus = [
        //         "Approve",
        //         "WithdrawPart",
        //         "RepairStared",
        //         "RepairComplete",
        //     ];

        //     if (unEditStatus.includes(idNumberIsAlready.documentStep.toString()) && idNumberIsAlready.documentStatus === DocumentStatus.Open) {
        //         return new NextResponse(JSON.stringify({ message: "เอกสารได้รับการอนุมัติเเล้ว เเละอยู่ระหว่างดำเนินการ" }), { status: 400 });
        //     }

        //     try {

        //         await prisma.document.update({
        //             where: {
        //                 documentIdNo: documentIdNo,
        //                 AND: {
        //                     documentType: documentType
        //                 }
        //             },
        //             data: {
        //                 documentDetials,
        //             },
        //         });

        //         return new NextResponse(JSON.stringify({ message: "Updated Success", documentIdNo: idNumberIsAlready.documentIdNo, documentId: idNumberIsAlready.documentId }), { status: 200 });

        //     } catch (e) {
        //         return new NextResponse(JSON.stringify({ message: "Document Id Is Ready To Used", documentIdNo: idNumberIsAlready.documentIdNo, documentId: idNumberIsAlready.documentId }), { status: 400 });
        //     }

        // } else {

        console.log(documentCode)

        console.log('ไม่พบเอกสาร ระบบกำลังสร้างเอกสารใหม่')


        if (documentType === DocumentCategory.Maintenance) {
            //สร้าง maintenance ด้วยยยย

            const {
                natureOfBreakdown,
                causes,
                repairingStart,
                repairingEnd,
                TOFstart,
                TOFend,
                maintenanceRamark,
                technicianName,
                plantEngineer,
                plantApproval,
                repairLocation,
                maintenanceType } = maintenance as Maintenance


            let documentAndMaintenance = await prisma.$transaction(async (tx) => {

                // Create a new document
                const newDocument = await prisma.document.create({
                    data: {
                        docType: _docType,
                        documentIdNo: runningNumberStr,
                        docMonth: monthAbbr,
                        docYear: year,
                        documentDetials,
                        documentType,
                        documentStatus: DocumentStatus.Draft,
                        documentStep: repairLocation === LocationType.OnPlant ? DocumentStep.Equipment : DocumentStep.Location
                    },
                });

                const newMaintenace = await tx.maintenance.create({
                    data: {
                        natureOfBreakdown,
                        causes,
                        repairingStart: repairingStart ? dayjs(repairingStart).format() : null,
                        TOFstart: TOFstart ? dayjs(TOFstart).format() : null,
                        maintenanceRamark,
                        repairLocation,
                        maintenanceType,
                        documentId: newDocument.documentId
                    },
                });

                return { newDocument, newMaintenace }

            });

            return new NextResponse(JSON.stringify({
                message: "Created Success",
                // documentIdNo: documentAndMaintenance.newDocument.documentIdNo,
                documentIdNo: documentCode,
                documentId: documentAndMaintenance.newDocument.documentId,
                maintenanceId: documentAndMaintenance.newMaintenace.maintenanceId
            }), { status: 201 });

        } else {
            // Create a new document
            const newDocument = await prisma.document.create({
                data: {
                    docType: _docType,
                    documentIdNo: runningNumberStr,
                    docMonth: monthAbbr,
                    docYear: year,
                    documentDetials,
                    documentType,
                    documentStatus: DocumentStatus.Draft,
                },
            });

            return new NextResponse(JSON.stringify({
                message: "Created Success",
                // documentIdNo: newDocument.documentIdNo,
                documentIdNo: documentCode,
                documentId: newDocument.documentId
            }),
                { status: 201 });

        }

        // }

    } catch (error) {

        console.error("Error Connect Local Server:", error);
        return new NextResponse(JSON.stringify({ error }), { status: 500 });

    }

};

export async function DELETE(req: NextRequest) {

    try {
        // รับ documentId จาก query parameter
        const { searchParams } = new URL(req.url);
        const documentId = searchParams.get('documentId');

        console.log(documentId)

        // ตรวจสอบว่ามี documentId หรือไม่
        if (!documentId) {
            return new NextResponse(JSON.stringify('Document ID is required'), { status: 400 });
        }

        const getDocument = await prisma.document.findFirst({
            where: {
                documentId,
            },
            include: {
                maintenance: {
                    include: {
                        brokenItems: true,
                        repairman: true,
                        additional: true
                    }
                },
                rental: {
                    include: {
                        equipment: {
                            include: {
                                aboutEquipment: true
                            }
                        }
                    }
                }
            }
        })

        // const { brokenItems, repairman, additional } = getDocument?.maintenance?

        let maintenanceId = getDocument?.maintenance?.maintenanceId
        let broken = getDocument?.maintenance?.brokenItems
        let repairman = getDocument?.maintenance?.repairman
        let additional = getDocument?.maintenance?.additional

        if (additional && additional.length > 0) {
            await prisma.additional.deleteMany({
                where: {
                    maintenanceId
                },
            })
        }

        if (repairman && repairman.length > 0) {
            await prisma.repairman.deleteMany({
                where: {
                    maintenanceId
                },
            })
        }

        if (broken && broken.length > 0) {

            await prisma.$transaction(async (tx) => {

                if (!maintenanceId) {
                    throw new Error(`Maintenance with ID ${maintenanceId} not found`);
                }

                for (const brokenItem of broken) {

                    let {
                        brokenItemsId,
                        equipmentId,
                        maintenanceId,
                        quantity,
                        equipmentOwner,
                        equipmentName
                    } = brokenItem as BrokenItems;

                    if (!equipmentId) {
                        throw new Error('EquipmentId are required');
                    }

                    // หากยกเลิกควรกลับไปที่สถานะไหน
                    if (equipmentOwner === EquipmentOwner.Plant) {
                        await tx.aboutEquipment.update({
                            where: { equipmentId },
                            data: {
                                stockStatus: EquipmentStatus.InStock
                            },
                        })
                    }
                    // ======= จัดการยังไงกับอุปกรณ์ของโรงงานที่ให้เช่าเมื่อซ่อมได้หรือไม่ได้ =======

                    await tx.brokenItems.updateMany({
                        where: {
                            brokenItemsId
                        },
                        data: {
                            repairStatus: RepairStatus.Cancel,
                        },
                    })

                }

            });
        }


        let deletedDocument = await prisma.document.update({
            where: { documentId: documentId },
            data: {
                documentStatus: DocumentStatus.Cancel
            },
            // Update fields based on the request body
        });


        // // ส่งข้อมูล document ที่ถูกลบกลับ
        return new NextResponse(JSON.stringify({ documentIdNo: deletedDocument.documentIdNo }), { status: 200 });
    } catch (error: any) {
        console.error('Error deleting document:', error);

        if (error.code === 'P2025') {
            // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
            return new NextResponse(JSON.stringify('Document not found'), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {

    try {

        const { documentId,
            documentIdNo,
            documentDetials,
            documentType,
            siteId,
            documentStatus,
            documentStep,
            maintenance
        } = await req.json() as Document;

        if (!(documentId && documentIdNo)) {
            return new NextResponse(JSON.stringify('Document ID is required'), { status: 400 });
        }

        const {
            natureOfBreakdown,
            causes,
            repairingStart,
            repairingEnd,
            TOFstart,
            TOFend,
            maintenanceRamark,
            technicianName,
            plantEngineer,
            plantApproval,
            repairLocation,
            maintenanceType,
            maintenanceId } = maintenance as Maintenance

        let updatedDocument: any;

        await prisma.$transaction(async (tx) => {

            updatedDocument = await tx.document.update({
                where: { documentId: documentId },
                data: {
                    documentDetials,
                    documentType,
                    siteId,
                    documentStatus,
                    documentStep,
                }
            });

            const updatedMaintenace = await tx.maintenance.update({
                where: { maintenanceId },
                data: {
                    natureOfBreakdown,
                    causes,
                    repairingStart: repairingStart ? dayjs(repairingStart).format() : null,
                    TOFstart: TOFstart ? dayjs(TOFstart).format() : null,
                    maintenanceRamark,
                    repairLocation,
                    maintenanceType,
                },
            });
        })


        return new NextResponse(JSON.stringify({ message: "Updated Success", documentIdNo: updatedDocument?.documentIdNo, documentId: updatedDocument?.documentId }), { status: 200 });


    } catch (error: any) {

        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });

    }
}