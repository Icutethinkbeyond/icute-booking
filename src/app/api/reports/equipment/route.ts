import { NextRequest, NextResponse } from 'next/server';
import { EquipmentStatus, PrismaClient } from '@prisma/client';
import fs from 'fs';
import path, { dirname } from 'path';
import { EquipmentRow } from '@/interfaces/Equipment';
import EquipmentExcelService from '@/utils/services/ExcelServices';
import { ReportExport, ReportType, SelectType } from '@/contexts/ReportContext';
import ReportService from '@/utils/services/database-services/ReportDb';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {

        const body = await req.json();
        const { reportType, reportSettings } = body.exports as ReportExport
        const fileName: string = body.filename
        let dataForExport;

        let reportService = new ReportService();

        if (!fileName) {
            return NextResponse.json({ error: 'Filename are Requird' }, { status: 404 });
        }

        let templatePath = path.resolve(process.cwd(), "public/templates/Equipment/StatusTemplate.xlsx");
        let outputPath = path.resolve(process.cwd(), `public/output/Equipment/${fileName}`);

        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }

        const service = new EquipmentExcelService(outputPath);
        await service.copyFile(templatePath, outputPath)

        if (reportType.toString() === "InventoryStatus") {

            if (reportSettings.selectType.toString() === "Category") {

                if (reportSettings.categoryAll) {

                    dataForExport = await prisma.category.findMany({
                        include: {
                            equipments: {
                                include: {
                                    aboutEquipment: true
                                }
                            }
                        }
                    })

                    if (!dataForExport) {
                        return NextResponse.json({ error: 'Category Not Found' }, { status: 404 });
                    }

                    await service.writeCategoryToExcel(dataForExport);

                } else if (reportSettings.categoryId) {

                    const category = await prisma.category.findFirst({
                        where: { categoryId: reportSettings.categoryId },
                        include: {
                            equipments: {
                                include: {
                                    aboutEquipment: true
                                }
                            }
                        }
                    });

                    // ✅ แปลงให้เป็น array ถ้ามีข้อมูล
                    dataForExport = category ? [category] : [];

                    if (!category) {
                        return NextResponse.json({ error: 'Category Not Found' }, { status: 404 });
                    }

                    await service.writeCategoryToExcel(dataForExport);

                }

            }

            if (reportSettings.selectType.toString() === "Location") {

                if (reportSettings.locationAll) {

                    dataForExport = await reportService.getEquipmentsBySite()

                    if (!dataForExport) {
                        return NextResponse.json({ error: 'Lcation Not Found' }, { status: 404 });
                    }

                    await service.writeLocationToExcel(dataForExport);

                } else if (reportSettings.locationId) {

                    dataForExport = await reportService.getEquipmentsBySite(reportSettings.locationId)

                    if (!dataForExport) {
                        return NextResponse.json({ error: 'Lcation Not Found' }, { status: 404 });
                    }

                    await service.writeLocationToExcel(dataForExport);
                }
            }


            // else {
            //     return NextResponse.json({ error: 'This Method Is Not Support' }, { status: 404 });
            // }

        }

        if (!outputPath) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(outputPath);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Disposition': `attachment; filename=${fileName}`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}



