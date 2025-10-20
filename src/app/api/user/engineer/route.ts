import { NextRequest, NextResponse } from 'next/server';
import { AboutEquipment, Category, PrismaClient, Prisma, EquipmentStatus, UserStatus, RoleName, DocumentStep } from '@prisma/client';
import { Equipment } from '@/interfaces/Equipment';
import dayjs from 'dayjs';
import { User } from '@/interfaces/User';
import { Repairman } from '@/interfaces/Maintenance';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {

        // const { searchParams } = new URL(req.url);
        // let fullname = searchParams.get('fullname');
        // let department = searchParams.get('department');
        // let position = searchParams.get('position');
        // let _role = searchParams.get('role');
        // let _status = searchParams.get('status');

        let engineer;

        // engineer = await prisma.user.findMany({
        //     select: {
        //         userId: true,
        //         name: true,

        //     },
        //     where: {
        //         userStatus: UserStatus.Active,
        //         role: {
        //             name: RoleName.Employee
        //         }
        //     }
        // });

        engineer = await prisma.user.findMany({
            select: {
                userId: true,
                name: true,
                manDay: true,
            },
            where: {
                userStatus: UserStatus.Active,
                role: {
                    name: RoleName.Employee
                }
            }
        });

        console.log(engineer)

        if (!engineer) {
            return new NextResponse(JSON.stringify('Engineer not found'), { status: 404 });
        }

        return new NextResponse(
            JSON.stringify({
                data: engineer,
            }),
            { status: 200 }
        );

    } catch (error) {
        console.error('Error fetching user:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

export async function POST(req: NextRequest, res: NextResponse) {

    try {
        const engineers = await req.json() as Repairman[];
        const { searchParams } = new URL(req.url);
        const maintenanceId = searchParams.get('maintenanceId');

        if (!Array.isArray(engineers)) {
            return new NextResponse(JSON.stringify({ error: "Invalid data format" }), { status: 400 });
        }

        if (!maintenanceId) {
            return new NextResponse(JSON.stringify({ error: "Invalid Maintenance Id" }), { status: 400 });
        }


        await prisma.$transaction(async (tx) => {

            let _document = await tx.maintenance.findFirst({ where: { maintenanceId }, select: { documentId: true } })

            if (!_document) {
                throw new Error('DocumentId are required');
            }

            if (engineers.length === 0) {

                for (const engineer of engineers) {

                    let {
                        repairmanId,
                        userId,
                        activities,
                        manHours,
                        cost,
                        repairmanRemark,
                        maintenanceId,
                        user,
                    } = engineer as Repairman;

                    if (repairmanId) {
                        continue;
                    }

                    // Validation
                    if (!userId) {
                        throw new Error('user Id are required');
                    }


                    if (!maintenanceId) {
                        throw new Error(`Maintenance with ID ${maintenanceId} not found`);
                    }




                    let newRepairman = await tx.repairman.create({
                        data: {
                            userId,
                            activities,
                            manHours: manHours ? manHours : 0,
                            cost,
                            repairmanRemark,
                            maintenanceId,
                        },
                    })

                }
            }

            await prisma.document.update({
                where: {
                    documentId: _document.documentId
                },
                data: {
                    documentStep: DocumentStep.AdditionalFee
                }
            })


        });


        return new NextResponse(JSON.stringify({ message: "Data processed successfully" }), { status: 201 });

    } catch (error) {
        console.error("Error processing data:", error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }

};
