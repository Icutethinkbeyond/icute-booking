
import fs from "fs";
import { Category, CategoryQuery } from "@/interfaces/Category_Type";
import ExcelJS from 'exceljs';
import * as path from "path";
import { calculateRentalDays, calculateRentalYears, formatDateMonthDay, formatUtcDate } from "../utils";
import dayjs from "dayjs";
import { SiteWithEquipments } from "./database-services/ReportDb";
import { EquipmentRow } from "@/interfaces/Equipment";

class EquipmentExcelService {

    private templatePath: string;

    constructor(templatePath: string) {
        this.templatePath = templatePath;
    }

    async copyFile(sourcePath: string, destinationPath: string) {
        try {
            // ✅ ตรวจสอบว่าไฟล์ต้นฉบับมีอยู่หรือไม่
            await fs.accessSync(sourcePath);

            // ✅ คัดลอกไฟล์
            await fs.copyFileSync(sourcePath, destinationPath);
            console.log(`✅ คัดลอกไฟล์สำเร็จ: ${path.basename(sourcePath)} -> ${destinationPath}`);
        } catch (error) {
            console.error(`❌ เกิดข้อผิดพลาดในการคัดลอกไฟล์:`, error);
        }
    }

    // async writeEquipmentDontImapoer(data: EquipmentRow[] | null | undefined) {

    //     if (!data) {
    //         throw new Error("No data provided");
    //     }

    //     if (!fs.existsSync(this.templatePath)) {
    //         throw new Error(`Template file not found at ${this.templatePath}`);
    //     }

    //     // ✅ โหลดไฟล์ Excel เทมเพลต
    //     const workbook = new ExcelJS.Workbook();
    //     await workbook.xlsx.readFile(this.templatePath); // เปิดไฟล์เทมเพลตโดยตรง

    //     // const worksheet = workbook.worksheets[0]; // ✅ ใช้ชีตแรก
    //     const worksheet = workbook.getWorksheet("Sheet1");
    //     let rowIndex = 7; // ✅ เริ่มเขียนจากแถวที่ 7

    //     if (!worksheet) {
    //         console.log('WorkSheet NotFound')
    //         throw new Error('WorkSheet NotFound')
    //     }

    //     worksheet.getCell(`H2`).value = formatUtcDate((new Date()).toDateString());
    //     worksheet.getCell(`H2`).font = { bold: true }; // ทำให้ชื่อ Category เป็นตัวหนา

    //     data.forEach((categoryData) => {

    //         // ✅ ใส่ชื่อ Category ในคอลัมน์ A
    //         worksheet.getCell(`B${rowIndex}`).value = categoryData.categoryName;
    //         worksheet.getCell(`B${rowIndex}`).font = { bold: true, size: 20 }; // ทำให้ชื่อ Category เป็นตัวหนา
    //         worksheet.getCell(`C${rowIndex}`).value = categoryData._count ? categoryData._count.equipments : "";
    //         worksheet.getCell(`C${rowIndex}`).font = { bold: true, size: 20 }; // ทำให้ชื่อ Category เป็นตัวหนา

    //         rowIndex = rowIndex + 2;

    //         categoryData.equipments.forEach((equipment, index) => {


    //             // ✅ เติมข้อมูลในแถว
    //             worksheet.getCell(`A${rowIndex}`).value = index + 1;
    //             worksheet.getCell(`B${rowIndex}`).value = equipment.equipmentName || "";
    //             worksheet.getCell(`C${rowIndex}`).value = 1;
    //             worksheet.getCell(`D${rowIndex}`).value = equipment.aboutEquipment?.unitName || "";
    //             worksheet.getCell(`E${rowIndex}`).value = equipment.serialNo || "";
    //             worksheet.getCell(`F${rowIndex}`).value = equipment.aboutEquipment?.rentalPriceCurrent || "";
    //             worksheet.getCell(`G${rowIndex}`).value = equipment.aboutEquipment?.equipmentPrice || "";
    //             // worksheet.getCell(`H${rowIndex}`).value = formatDateMonthDay(dayjs(equipment.aboutEquipment?.purchaseDate)) || "";
    //             worksheet.getCell(`I${rowIndex}`).value = calculateRentalYears(dayjs(equipment.aboutEquipment?.purchaseDate)) || "";
    //             worksheet.getCell(`J${rowIndex}`).value = equipment.description || "";

    //             rowIndex++; // ✅ ขยับไปแถวถัดไป
    //         });
    //         rowIndex++; // ✅ เว้น 1 แถวเมื่อขึ้น Category ใหม่
    //     });

    //     // ✅ บันทึกไฟล์ลงในไฟล์เดิม
    //     await workbook.xlsx.writeFile(this.templatePath);

    // }

    // async function writeCategoryToExcel(outputPath: string, data: CategoryQuery[] | null | undefined) {
    async writeCategoryToExcel(data: CategoryQuery[] | null | undefined) {
        if (!data) {
            throw new Error("No data provided");
        }

        if (!fs.existsSync(this.templatePath)) {
            throw new Error(`Template file not found at ${this.templatePath}`);
        }

        // ✅ โหลดไฟล์ Excel เทมเพลต
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(this.templatePath); // เปิดไฟล์เทมเพลตโดยตรง

        // const worksheet = workbook.worksheets[0]; // ✅ ใช้ชีตแรก
        const worksheet = workbook.getWorksheet("Sheet1");
        let rowIndex = 7; // ✅ เริ่มเขียนจากแถวที่ 7

        if (!worksheet) {
            console.log('WorkSheet NotFound')
            throw new Error('WorkSheet NotFound')
        }

        worksheet.getCell(`H2`).value = formatUtcDate((new Date()).toDateString());
        worksheet.getCell(`H2`).font = { bold: true }; // ทำให้ชื่อ Category เป็นตัวหนา

        data.forEach((categoryData) => {

            // ✅ ใส่ชื่อ Category ในคอลัมน์ A
            worksheet.getCell(`B${rowIndex}`).value = categoryData.categoryName;
            worksheet.getCell(`B${rowIndex}`).font = { bold: true, size: 20 }; // ทำให้ชื่อ Category เป็นตัวหนา
            worksheet.getCell(`C${rowIndex}`).value = categoryData._count ? categoryData._count.equipments : "";
            worksheet.getCell(`C${rowIndex}`).font = { bold: true, size: 20 }; // ทำให้ชื่อ Category เป็นตัวหนา

            rowIndex = rowIndex + 2;

            categoryData.equipments.forEach((equipment, index) => {


                // ✅ เติมข้อมูลในแถว
                worksheet.getCell(`A${rowIndex}`).value = index + 1;
                worksheet.getCell(`B${rowIndex}`).value = equipment.equipmentName || "";
                worksheet.getCell(`C${rowIndex}`).value = 1;
                worksheet.getCell(`D${rowIndex}`).value = equipment.aboutEquipment?.unitName || "";
                worksheet.getCell(`E${rowIndex}`).value = equipment.serialNo || "";
                worksheet.getCell(`F${rowIndex}`).value = equipment.aboutEquipment?.rentalPriceCurrent || "";
                worksheet.getCell(`G${rowIndex}`).value = equipment.aboutEquipment?.equipmentPrice || "";
                // worksheet.getCell(`H${rowIndex}`).value = formatDateMonthDay(dayjs(equipment.aboutEquipment?.purchaseDate)) || "";
                worksheet.getCell(`I${rowIndex}`).value = calculateRentalYears(dayjs(equipment.aboutEquipment?.purchaseDate)) || "";
                worksheet.getCell(`J${rowIndex}`).value = equipment.description || "";

                rowIndex++; // ✅ ขยับไปแถวถัดไป
            });
            rowIndex++; // ✅ เว้น 1 แถวเมื่อขึ้น Category ใหม่
        });

        // ✅ บันทึกไฟล์ลงในไฟล์เดิม
        await workbook.xlsx.writeFile(this.templatePath);

    }

    async writeLocationToExcel(data: SiteWithEquipments[] | null | undefined) {
        if (!data) {
            throw new Error("No data provided");
        }

        if (!fs.existsSync(this.templatePath)) {
            throw new Error(`Template file not found at ${this.templatePath}`);
        }

        // ✅ โหลดไฟล์ Excel เทมเพลต
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(this.templatePath); // เปิดไฟล์เทมเพลตโดยตรง

        // const worksheet = workbook.worksheets[0]; // ✅ ใช้ชีตแรก
        const worksheet = workbook.getWorksheet("Sheet1");
        let rowIndex = 7; // ✅ เริ่มเขียนจากแถวที่ 7

        if (!worksheet) {
            console.log('WorkSheet NotFound')
            throw new Error('WorkSheet NotFound')
        }

        worksheet.getCell(`H2`).value = formatUtcDate((new Date()).toDateString());
        worksheet.getCell(`H2`).font = { bold: true }; // ทำให้ชื่อ Category เป็นตัวหนา


        data.forEach((siteData) => {

            // if (siteData.equipments.length === 0) {
            //     return
            // }

            // ✅ ใส่ชื่อ Category ในคอลัมน์ A
            worksheet.getCell(`B${rowIndex}`).value = siteData.siteName;
            worksheet.getCell(`B${rowIndex}`).font = { bold: true, size: 20 }; // ทำให้ชื่อ Category เป็นตัวหนา
            // worksheet.getCell(`C${rowIndex}`).value = categoryData._count ? categoryData._count.equipments : "";
            // worksheet.getCell(`C${rowIndex}`).font = { bold: true, size: 20  }; // ทำให้ชื่อ Category เป็นตัวหนา

            rowIndex = rowIndex + 2;

            siteData.equipments.forEach((equipment, index) => {
                // ✅ เติมข้อมูลในแถว
                worksheet.getCell(`A${rowIndex}`).value = index + 1;
                worksheet.getCell(`B${rowIndex}`).value = equipment.equipmentName || "";
                worksheet.getCell(`C${rowIndex}`).value = 1;
                worksheet.getCell(`D${rowIndex}`).value = equipment.aboutEquipment?.unitName || "";
                worksheet.getCell(`E${rowIndex}`).value = equipment.serialNo || "";
                worksheet.getCell(`F${rowIndex}`).value = equipment.aboutEquipment?.rentalPriceCurrent || "";
                worksheet.getCell(`G${rowIndex}`).value = equipment.aboutEquipment?.equipmentPrice || "";
                // worksheet.getCell(`H${rowIndex}`).value = formatDateMonthDay(dayjs(equipment.aboutEquipment?.purchaseDate)) || "";
                // worksheet.getCell(`I${rowIndex}`).value = calculateRentalYears(dayjs(equipment.aboutEquipment?.purchaseDate)) || "";
                worksheet.getCell(`J${rowIndex}`).value = equipment.description || "";

                rowIndex++; // ✅ ขยับไปแถวถัดไป
            });

            rowIndex++; // ✅ เว้น 1 แถวเมื่อขึ้น Category ใหม่
        });

        // ✅ บันทึกไฟล์ลงในไฟล์เดิม
        await workbook.xlsx.writeFile(this.templatePath);

    }
}

export default EquipmentExcelService;
