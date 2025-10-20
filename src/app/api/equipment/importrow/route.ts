import { NextRequest, NextResponse } from 'next/server';
import { EquipmentStatus, PrismaClient } from '@prisma/client';
import fs from 'fs';
import path, { dirname } from 'path';
import * as XLSX from 'xlsx';
import { Readable } from "stream";
import { createWriteStream } from "fs";
import { EquipmentRow } from '@/interfaces/Equipment';
import { isEqualIgnoreCaseAndWhitespace, parseDateToMongo, REQUIRED_COLUMN, validateExcelColumns } from '@/utils/utils';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {

    const { searchParams } = new URL(req.url);
    const getTemplate = searchParams.get('get-template');
    const filename = searchParams.get('filename');

    if (!filename) {
        return NextResponse.json({ error: 'filename is not defined' }, { status: 404 });
    }

    let filePath;

    if (getTemplate === 'true') {

        filePath = path.join(process.cwd(), '/public/templates', 'EquipmentTemplate.xlsx');

    } else {

        filePath = path.join(process.cwd(), '/public/tmp', 'EquipmentReject.xlsx');
    }

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
        headers: {
            'Content-Disposition': `attachment; filename=${filename}`,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
    });
}

export async function POST(req: NextRequest) {

    // let test = await req.json();
    // console.log(test)

    // return;

    try {

        const { equipmentname,
            model,
            serialno,
            brand,
            description,
            qty,
            btlnumber,
            purchasedprice,
            purchasedate,
            registerdate,
            po,
            fixassetsnumber,
            rentalpricepre,
            rentalrate,
            unitname,
            mfd,
            categoryname } = await req.json() as EquipmentRow;


        // ❌ ตรวจสอบค่าว่างและบันทึกลง EquipmentReject.xlsx
        if (!equipmentname) {
            return new NextResponse(JSON.stringify('Equipment Name are Requird'), { status: 400 });
        }

        if (!serialno) {
            return new NextResponse(JSON.stringify('Serial No. are Requird'), { status: 400 });
        }

        if (!rentalrate) {
            return new NextResponse(JSON.stringify('Rental Rate Are Requird'), { status: 400 });
        }

        // // 🔍 ตรวจสอบว่า serialNo มีอยู่ในฐานข้อมูลหรือไม่
        // const existingEquipment = await prisma.equipment.findFirst({
        //     where: { serialNo }
        // });

        // 🔍 ตรวจสอบว่า serialNo มีอยู่ในฐานข้อมูลหรือไม่
        const existingEquipment = await prisma.equipment.findFirst({
            where: { serialNo: (serialno).toString() }
        });

        if (existingEquipment) {
            return new NextResponse(JSON.stringify('Serial Number is already'), { status: 400 });
        }

        // const _equipmentName = await prisma.equipment.findFirst({
        //     where: { equipmentName }
        // });

        // const _modelName = await prisma.equipment.findFirst({
        //     where: { model }
        // });

        // let _existingEquipment: boolean = isEqualIgnoreCaseAndWhitespace(`${_equipmentName}${_modelName}`, `${equipmentName}${model}`);

        // if (_existingEquipment) {
        //     return new NextResponse(JSON.stringify('Existing Equipment is already'), { status: 400 });
        // }

        let purchaseDateCheck: Date | null = null;
        let registerDateCheck: Date | null = null;

        if (purchasedate) {
            //check date format
            purchaseDateCheck = parseDateToMongo(purchasedate);
            if (!purchaseDateCheck) {
                return new NextResponse(JSON.stringify('PurchaseDate is Valid Format'), { status: 400 });
            }
        }

        if (registerdate) {
            //check date format
            registerDateCheck = parseDateToMongo(registerdate);
            if (!registerDateCheck) {
                return new NextResponse(JSON.stringify('RegisterDate is Valid Format'), { status: 400 });
            }
        }

        // 🔍 ค้นหา categoryName ถ้ายังไม่มีให้สร้างใหม่
        let _category = await prisma.category.findFirst({
            where: { categoryName: categoryname }
        });

        if (!_category) {
            _category = await prisma.category.create({
                data: { categoryName: categoryname }
            });
        }

        // ✅ บันทึกข้อมูล Equipment และ AboutEquipment
        const equipment = await prisma.equipment.create({
            data: {
                equipmentName: equipmentname,
                serialNo: serialno.toString(),
                model,
                brand,
                description,
                categoryId: _category ? _category?.categoryId : null
            }
        });

        if (equipment) {

            await prisma.aboutEquipment.create({
                data: {
                    equipmentId: equipment.equipmentId,
                    equipmentPrice: purchasedprice ? parseFloat(purchasedprice) : 0,
                    rentalPricePre: rentalpricepre ? parseFloat(rentalpricepre) : 0,
                    rentalPriceCurrent: rentalrate ? parseFloat(rentalrate) : 0,
                    rentalUpdateAt: new Date(),
                    purchaseDate: purchaseDateCheck ? new Date(purchaseDateCheck) : null,
                    unitName: unitname || 'Unit',
                    stockStatus: EquipmentStatus.InStock,
                    registerDate: registerDateCheck ? new Date(registerDateCheck) : null,
                    PO: po,
                    fixAssetsNumber: fixassetsnumber,
                    MFD: mfd,
                    QTY: qty ? parseInt(qty) : 0,
                    BTLNumber: btlnumber,
                }
            });

        }

        return NextResponse.json({ error: 'Equipment Created' }, { status: 201 });

        // return NextResponse.json({
        //     message: 'Processing complete',
        //     created: createdEquipment.length,
        //     rejected: rejectedRows.length,
        //     // rejectFileUrl
        // });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// export async function POST(req: NextRequest) {
//     try {
//         const formData = await req.formData();
//         const file = formData.get('file') as File;

//         if (!file) {
//             return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
//         }

//         const fileBuffer = await file.arrayBuffer();

//         // ✅ ตรวจสอบโครงสร้างคอลัมน์
//         const validationResult = validateExcelColumns(fileBuffer);
//         if (!validationResult.valid) {
//             return NextResponse.json(
//                 { data: "Invalid columns", missingColumns: validationResult.missingColumns },
//                 { status: 400 }
//             );
//         }

//         // อ่านไฟล์จาก Buffer
//         const buffer = Buffer.from(fileBuffer);
//         const workbook = XLSX.read(buffer, { type: 'buffer' });
//         const sheetName = workbook.SheetNames[0];
//         const data: EquipmentRow[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//         const rejectedRows: any[] = [];
//         const createdEquipment: any[] = [];

//         for (const row of data) {

//             const {
//                 equipmentName,
//                 serialNo,
//                 brand,
//                 description,
//                 equipmentPrice,
//                 categoryName,
//                 rentalPricePre,
//                 rentalPriceCurrent,
//                 purchaseDate,
//                 unitName,
//             } = row;

//             const validateEquipmentData = (row: Partial<EquipmentRow>): Partial<EquipmentRow> => {
//                 const fixedRow = Object.fromEntries(
//                     Object.entries(row).map(([key, value]) => [
//                         key,
//                         REQUIRED_COLUMN.includes(key as keyof EquipmentRow) &&
//                             (value === undefined || value === null || value === "")
//                             ? "โปรดใส่ข้อมูล"
//                             : value
//                     ])
//                 );

//                 return fixedRow as Partial<EquipmentRow>;
//             };

//             const validatedRow = validateEquipmentData(row);

//             // console.log(validatedRow)

//             // ❌ ตรวจสอบค่าว่างและบันทึกลง EquipmentReject.xlsx
//             if (!equipmentName || !serialNo || !rentalPriceCurrent) {
//                 rejectedRows.push(validatedRow);
//                 continue;
//             }

//             // 🔍 ตรวจสอบว่า serialNo มีอยู่ในฐานข้อมูลหรือไม่
//             const existingEquipment = await prisma.equipment.findFirst({
//                 where: { serialNo }
//             });

//             if (existingEquipment) {
//                 continue; // ข้ามการสร้างข้อมูลซ้ำ
//             }

//             // 🔍 ค้นหา categoryName ถ้ายังไม่มีให้สร้างใหม่
//             let category = await prisma.category.findFirst({
//                 where: { categoryName }
//             });

//             if (!category) {
//                 category = await prisma.category.create({
//                     data: { categoryName }
//                 });
//             }

//             // ✅ บันทึกข้อมูล Equipment และ AboutEquipment
//             const equipment = await prisma.equipment.create({
//                 data: {
//                     equipmentName,
//                     serialNo,
//                     brand,
//                     description,
//                     categoryId: category.categoryId
//                 }
//             });

//             if (equipment) {

//                 await prisma.aboutEquipment.create({
//                     data: {
//                         equipmentId: equipment.equipmentId,
//                         equipmentPrice,
//                         rentalPricePre,
//                         rentalPriceCurrent: rentalPriceCurrent,
//                         rentalUpdateAt: new Date(),
//                         purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
//                         unitName: unitName || 'Unit',
//                         stockStatus: EquipmentStatus.InStock,
//                     }
//                 });

//             }

//             createdEquipment.push({ status: 'created', serialNo });
//         }

//         if (rejectedRows.length > 0) {
//             XLSX.set_fs(fs);
//             const ws = XLSX.utils.json_to_sheet(rejectedRows);
//             const wb = XLSX.utils.book_new();
//             XLSX.utils.book_append_sheet(wb, ws, 'Rejected Equipment');

//             const filePath = path.resolve(process.cwd(), "public/tmp/EquipmentReject.xlsx");

//             if (fs.existsSync(filePath)) {
//                 fs.unlinkSync(filePath);
//             }

//             XLSX.writeFile(wb, filePath);
//             // rejectFileUrl = '/api/download-reject';
//         }

//         return NextResponse.json({
//             message: 'Processing complete',
//             created: createdEquipment.length,
//             rejected: rejectedRows.length,
//             // rejectFileUrl
//         });

//     } catch (error) {
//         console.error(error);
//         return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//     }
// }

