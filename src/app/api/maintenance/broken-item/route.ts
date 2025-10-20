import { NextRequest, NextResponse } from 'next/server';
import { DocumentCategory, DocumentStep, EquipmentOwner, EquipmentStatus, PrismaClient, RepairStatus } from '@prisma/client';
import { Category } from '@/interfaces/Category_Type';
import { BrokenItems } from '@/interfaces/Maintenance';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        // ดึง query parameters เช่น documentId
        const { searchParams } = new URL(req.url);
        const maintenanceId = searchParams.get('maintenanceId');
        const getAllBroken = searchParams.get('get-all-broken');
        let brokenItems;

        console.log(getAllBroken, maintenanceId)

        if (maintenanceId && !Boolean(getAllBroken)) {

            brokenItems = await prisma.brokenItems.findMany({
                where: {
                    maintenanceId,
                    AND: {
                        repairStatus: RepairStatus.Waiting
                    }
                },
                include: {
                    equipment: true,
                    parts: true
                },
            });

            if (!brokenItems) {
                return new NextResponse(JSON.stringify('BrokenItems not found'), { status: 404 });
            }

            return new NextResponse(JSON.stringify(brokenItems), { status: 200 });

        } if (Boolean(getAllBroken) === true && maintenanceId) {

            brokenItems = await prisma.brokenItems.findMany({
                where: {
                    maintenanceId,
                },
                include: {
                    equipment: true,
                    parts: true
                },
            });

            if (!brokenItems) {
                return new NextResponse(JSON.stringify('BrokenItems not found'), { status: 404 });
            }

            return new NextResponse(JSON.stringify(brokenItems), { status: 200 });

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
    } catch (error) {
        console.error('Error fetching documents:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(req: NextRequest, res: NextResponse) {

    try {
        const brokenItems = await req.json() as BrokenItems[];

        if (!Array.isArray(brokenItems)) {
            return new NextResponse(JSON.stringify({ error: "Invalid data format" }), { status: 400 });
        }

        if (brokenItems.length === 0) {
            return new NextResponse(JSON.stringify({ error: "โปรดเพิ่มอุปกรณ์ที่ต้องการซ่อมเเซม" }), { status: 400 });
        }

        await prisma.$transaction(async (tx) => {

            let maId = brokenItems[0].maintenanceId;

            let _document = await tx.maintenance.findFirst({ where: { maintenanceId: maId }, select: { documentId: true } })

            if (!_document) {
                throw new Error('DocumentId are required');
            }

            for (const brokenItem of brokenItems) {

                let {
                    brokenItemsId,
                    equipmentId,
                    maintenanceId,
                    quantity,
                    equipmentOwner,
                    equipmentName
                } = brokenItem as BrokenItems;

                if (brokenItemsId) {
                    continue;
                }

                // Validation
                if (!equipmentName) {
                    throw new Error('EquipmentName are required');
                }


                if (!maintenanceId) {
                    throw new Error(`Maintenance with ID ${maintenanceId} not found`);
                }

                let oldEquipmentStatus = null


                if (equipmentOwner === EquipmentOwner.Site) {
                    let newEquipment = await tx.equipment.create({
                        data: {
                            equipmentName: equipmentName,
                            equipmentOwn: equipmentOwner === EquipmentOwner.Site ? false : true,
                        },
                    })

                    equipmentId = newEquipment.equipmentId;

                } else {

                    oldEquipmentStatus = await tx.aboutEquipment.findFirst({ where: { equipmentId }, select: { stockStatus: true } })

                    await tx.aboutEquipment.update({
                        where: { equipmentId },
                        data: {
                            stockStatus: EquipmentStatus.Damaged
                        },
                    })
                }

                if (!equipmentId) {
                    throw new Error('EquipmentId are required');
                }


                await tx.brokenItems.create({
                    data: {
                        equipmentId: equipmentId,
                        quantity: 1,
                        equipmentOwner: equipmentOwner as EquipmentOwner,
                        maintenanceId: maintenanceId,
                        oldstockStatus: oldEquipmentStatus?.stockStatus
                    },
                })

                // console.log(newBrokenItem)

                // rentalIds.push(newRental.rentalId);
            }

            await prisma.document.update({
                where: {
                    documentId: _document.documentId
                },
                data: {
                    documentStep: DocumentStep.Part
                }
            })


        });


        return new NextResponse(JSON.stringify({ message: "Data processed successfully" }), { status: 201 });

    } catch (error) {
        console.error("Error processing data:", error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }

};


// ยกเลิกการซ่อมเเซม
export async function DELETE(req: NextRequest) {

    try {
        // รับ categoryId จาก query parameter
        const { searchParams } = new URL(req.url);
        const brokenItemsId = searchParams.get('brokenItemId');

        // // ตรวจสอบว่ามี categoryId หรือไม่
        if (!brokenItemsId) {
            return new NextResponse(JSON.stringify('brokenItem ID is required'), { status: 400 });
        }

        let brokenItem = await prisma.brokenItems.findFirst({ where: { brokenItemsId } })

        if (!brokenItem) {
            return new NextResponse(JSON.stringify('brokenItem Not Found'), { status: 400 });
        }

        let equipment = await prisma.equipment.findFirst({ where: { equipmentId: brokenItem.equipmentId } })

        let deletedBrokenItems

        if (equipment?.equipmentOwn === false) {
            deletedBrokenItems = await prisma.equipment.delete({
                where: {
                    equipmentId: equipment.equipmentId,
                },
            });
        } else {
            // ลบ category โดยใช้ categoryId
            deletedBrokenItems = await prisma.brokenItems.delete({
                where: {
                    brokenItemsId,
                    AND: {
                        repairStatus: RepairStatus.Waiting
                    }
                },
            });

            if (equipment) {

                await prisma.aboutEquipment.update({
                    where: { equipmentId: equipment.equipmentId },
                    data: {
                        stockStatus: brokenItem.oldstockStatus as EquipmentStatus
                    },
                })
            }
        }

        // ส่งข้อมูล category ที่ถูกลบกลับ
        return new NextResponse(JSON.stringify(deletedBrokenItems), { status: 200 });
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
        const repairCompleted = searchParams.get('update-completed');
        const repairUnrepairable = searchParams.get('update-unrepairable');

        const { brokenItemsId,
            equipmentId,
            maintenanceId,
            quantity,
            equipmentOwner,
            equipmentName } = await req.json() as BrokenItems;

        let updatedBrokenItem
        let nextStep: boolean = false

        // ต้องตรวจสอบว่าหมดเวลาเช่าหรือยัง ถ้ายัง
        if (Boolean(repairCompleted) === true) {
            updatedBrokenItem = await prisma.brokenItems.update({
                where: {
                    brokenItemsId
                },
                data: {
                    repairStatus: RepairStatus.Completed,
                },
            })
        } else if (Boolean(repairUnrepairable) === true) {
            updatedBrokenItem = await prisma.brokenItems.update({
                where: {
                    brokenItemsId
                },
                data: {
                    repairStatus: RepairStatus.Unrepairable,
                },
            })
        } else {

            await prisma.$transaction(async (tx) => {

                if (!maintenanceId) {
                    throw new Error(`Maintenance with ID ${maintenanceId} not found`);
                }

                if (!equipmentId) {
                    throw new Error('EquipmentId are required');
                }

                if (equipmentOwner === EquipmentOwner.Plant) {

                    let _brokenItems = await prisma.brokenItems.findFirst({
                        where: {
                            brokenItemsId
                        }
                    })

                    if (_brokenItems) {

                        await tx.aboutEquipment.update({
                            where: { equipmentId },
                            data: {
                                // stockStatus: EquipmentStatus.InStock
                                stockStatus: _brokenItems.oldstockStatus as EquipmentStatus
                            },
                        })
                    }

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

        }

        let brokenItems = await prisma.brokenItems.findMany({
            where: {
                maintenanceId,
                AND: {
                    repairStatus: RepairStatus.Waiting,
                }
            },
        });

        if (brokenItems.length === 0) {

            let _document = await prisma.maintenance.findFirst({ where: { maintenanceId }, select: { documentId: true } })

            if (!_document) {
                throw new Error('Document Id are required');
            }

            await prisma.document.update({
                where: {
                    documentId: _document.documentId
                },
                data: {
                    documentStep: DocumentStep.RepairComplete,
                },
            })

            nextStep = true
        }

        return new NextResponse(JSON.stringify({ message: "Updated", updatedBrokenItem, nextStep }), { status: 200 });


    } catch (error: any) {

        console.error('Error updating category:', error);

        if (error.code === 'P2025') {
            // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
            return new NextResponse(JSON.stringify('Category not found'), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}