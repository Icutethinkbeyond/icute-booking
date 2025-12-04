import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import * as XLSX from 'xlsx';
import { DefaultOperatingHour, OperatingHourRequest } from "@/interfaces/Store"
// import { EquipmentRow } from '@/interfaces/Equipment';
// import { ReportType, SelectType } from "@/contexts/ReportContext";
// import { DocumentCategory, DocumentStep, MaintenanceType } from "@prisma/client";

// --------------------------------------------------------------------------
// Helper Functions & Types
// --------------------------------------------------------------------------

// Helper function to convert "HH:MM" string to a valid Date object for Prisma
// Note: เราใช้ 2000-01-01T...Z เพื่อให้เป็น Time Object ที่อ้างอิง UTC Date

export function getTimeAsDateTime(timeString: string | null | undefined | Dayjs): null | string {
  if (!timeString) return null;

  // แปลงเป็น ISO String format: YYYY-MM-DDTZ เพื่อให้ Prisma จัดการได้
  // const safeDate = new Date(`2000-01-01T${timeString}:00Z`);
  let safeDate = dayjs(timeString).format()

  // if (isNaN(safeDate.getTime())) return null;

  return safeDate;
}

export function checkBooleanValue(value: string | boolean): boolean {
  if (typeof value === "undefined") {
    return false;
  }

  value = value === 'true' || value === true ? true : false

  return value;
}

// ฟังก์ชันแปลง Request Body เป็นโครงสร้างที่ Flatten สำหรับ Prisma
// export function mapRequestToPrismaData(requestData: DefaultOperatingHour) {
//   // 1. กำหนดชื่อวันในสัปดาห์
//   const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

//   // 2. ใช้ reduce เพื่อสร้าง Object dataToUpdate
//   const dataToUpdate = days.reduce((acc, day) => {

//     // 🔍 ใช้ Bracket Notation ([]) เพื่อสร้างชื่อคุณสมบัติแบบ Dynamic

//     // คุณสมบัติ: [DAY]_isOpen (แปลงเป็น Boolean)
//     const isOpenKey = `${day}_isOpen`;
//     if (requestData[isOpenKey] !== undefined) {
//       acc[isOpenKey] = Boolean(requestData[isOpenKey]);
//     }

//     // คุณสมบัติ: [DAY]_openTime (แปลงเป็น DateTime)
//     const openTimeKey = `${day}_openTime`;
//     if (requestData[openTimeKey] !== undefined) {
//       acc[openTimeKey] = getTimeAsDateTime(requestData[openTimeKey]);
//     }

//     // คุณสมบัติ: [DAY]_closeTime (แปลงเป็น DateTime)
//     const closeTimeKey = `${day}_closeTime`;
//     if (requestData[closeTimeKey] !== undefined) {
//       acc[closeTimeKey] = getTimeAsDateTime(requestData[closeTimeKey]);
//     }

//     return acc;
//   }, {} as any); // ใช้ as any ชั่วคราวเพื่อให้ TypeScript ยอมรับ Dynamic Keys
// }


export function getBaseUrl(): string | null {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return null;
}

export function parseDateToMongo(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  // ตรวจสอบว่าเป็น ISO 8601 หรือไม่
  const isoDateRegex =
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(Z|[\+\-]\d{2}:\d{2})?)?$/;

  if (isoDateRegex.test(dateStr)) {
    const isoDate = new Date(dateStr);
    return isNaN(isoDate.getTime()) ? null : isoDate;
  }

  const formats = [
    /^\d{4}-\d{2}-\d{2}$/, // yyyy-mm-dd
    /^\d{2}\/\d{2}\/\d{4}$/, // dd/mm/yyyy
    /^\d{2}-\d{2}-\d{4}$/ // dd-mm-yyyy
  ];

  for (const format of formats) {
    if (format.test(dateStr)) {
      try {
        let [year, month, day] = [0, 0, 0];

        if (dateStr.includes('/')) {
          [day, month, year] = dateStr.split('/').map(Number);
        } else if (dateStr.includes('-')) {
          const parts = dateStr.split('-').map(Number);
          if (dateStr.indexOf('-') === 4) {
            // yyyy-mm-dd
            [year, month, day] = parts;
          } else {
            // dd-mm-yyyy
            [day, month, year] = parts;
          }
        }

        const date = new Date(Date.UTC(year, month - 1, day));
        return isNaN(date.getTime()) ? null : date;
      } catch {
        return null;
      }
    }
  }

  return null; // รูปแบบไม่ถูกต้อง
}
export function isEqualIgnoreCaseAndWhitespace(text1: string, text2: string): boolean {
  const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, '');
  return normalize(text1) === normalize(text2);
}

export const getMonthAbbreviation = (month: number): string => {
  const monthAbbrs = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];
  return monthAbbrs[month];
};

export function validateExcelColumns(fileBuffer: ArrayBuffer): { valid: boolean; missingColumns?: string[] } {
  // อ่านไฟล์ Excel
  const workbook = XLSX.read(fileBuffer, { type: "array" });

  // เลือก Sheet แรก
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // อ่านข้อมูลแถวแรก (Header)
  const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] as string[];

  // ตรวจสอบว่าคอลัมน์ที่ต้องมีทั้งหมดอยู่ในไฟล์ไหม
  const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));

  if (missingColumns.length > 0) {
    return { valid: false, missingColumns };
  }

  return { valid: true };
}

// export const REQUIRED_COLUMN: (keyof EquipmentRow)[] = [
//   'equipmentName',
//   'serialNo',
//   'brand',
//   'description',
//   'equipmentPrice',
//   'categoryName',
//   'rentalPriceCurrent',
//   'purchaseDate',
//   'unitName'
// ];

export const REQUIRED_COLUMNS: string[] = [
  "equipmentName",
  "serialNo",
  "brand",
  "description",
  "equipmentPrice",
  "categoryName",
  "rentalPriceCurrent",
  "purchaseDate",
  "unitName",
];

export function formatDateForFilename(date: Date = new Date()): string {
  return date
    .toISOString()
    .replace(/[-:T]/g, "")
    .split(".")[0]; // เอาเฉพาะ YYYYMMDDHHmmss
}

export const calculateRentalDays = (startDate: string | Dayjs): number => {
  const start = new Date(startDate.toString()); // แปลงวันที่เริ่มเช่าเป็น Date object
  const today = new Date(); // วันที่ปัจจุบัน

  // คำนวณความต่างของเวลาในหน่วยมิลลิวินาที
  const diffInTime = today.getTime() - start.getTime();

  // แปลงจากมิลลิวินาทีเป็นวัน
  const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));

  return diffInDays; // จำนวนวันที่เช่ามา
}

export const calculateRentalYears = (startDate: string | Dayjs): number => {
  const start = new Date(startDate.toString()); // แปลงวันที่เริ่มเช่าเป็น Date object
  const today = new Date(); // วันที่ปัจจุบัน

  // คำนวณความต่างของปี
  let diffInYears = today.getFullYear() - start.getFullYear();

  // ตรวจสอบว่าเดือนและวันของปีปัจจุบันน้อยกว่าปีเริ่มหรือไม่
  if (
    today.getMonth() < start.getMonth() ||
    (today.getMonth() === start.getMonth() && today.getDate() < start.getDate())
  ) {
    diffInYears--; // ถ้ายังไม่ถึงวันครบรอบให้ลบออก 1 ปี
  }

  return diffInYears; // จำนวนปีที่เช่ามา
}


export function formatDateMonthDay(inputDate: string | Date | null | Dayjs): string {

  if (!inputDate || inputDate == undefined) {
    return ""
  }

  console.log(inputDate)

  const date = new Date(inputDate.toString());

  console.log(date)
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }

  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(date).replace(" ", "/");
}

export const calculateRentalCost = (startDate: string, monthlyPrice: number): number => {
  const rentalDays = calculateRentalDays(startDate); // จำนวนวันที่เช่า
  const dailyPrice = monthlyPrice / 30; // คำนวณราคาเช่าต่อวัน (หาร 30 วัน)
  const totalCost = rentalDays * dailyPrice; // ค่าเช่าทั้งหมดจนถึงปัจจุบัน

  return parseFloat(totalCost.toFixed(2)); // คืนค่าโดยจำกัดทศนิยม 2 ตำแหน่ง
};

export function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export const fetchData = async <T>(
  endpoint: string,
  setData: React.Dispatch<React.SetStateAction<T>>,
  setRowCount?: React.Dispatch<React.SetStateAction<number>>,
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>,
  signal?: AbortSignal // เพิ่ม signal เพื่อให้สามารถยกเลิกคำขอได้
) => {
  try {
    if (setLoading) setLoading(true);

    const { data } = await axios.get(endpoint, { signal });

    console.log(data)

    setData(data.data);
    if (setRowCount && data.pagination) {
      setRowCount(data.pagination.totalItems);
    }
  } catch (error: any) {
    console.error("Fetch error:", error.message);
    throw error; // คุณสามารถส่ง error นี้ไปจัดการในหน้าที่เรียก
  } finally {
    if (setLoading) setLoading(false);
  }
};

export function makeId(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export const randomProperty = function (obj: any) {
  var keys = Object.keys(obj);
  return obj[keys[keys.length * Math.random() << 0]];
};



export function formatUtcDate(utcDateString?: string | null): string | null | undefined {

  if (!utcDateString) {
    return;
  }

  const utcDate = new Date(utcDateString);
  const formattedDate = utcDate.toLocaleDateString('th-TH',
    { day: '2-digit', month: 'long', year: 'numeric' });

  return formattedDate;
}

export function makeDateMonth(utcDateString?: string): string {

  if (!utcDateString) {
    return 'ไม่พบข้อมูล';
  }

  const utcDate = new Date(utcDateString);
  const month = String(utcDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so we add 1
  const year = String(utcDate.getFullYear()).slice(-2); // Get last two digits of the year

  return `${month}-${year}`;
}

export function formatNumber(number: number | null | undefined, needDecimal: boolean | null = true): string | null | undefined {
  if (number !== null && number !== undefined) {

    let fixedNumber: string | number;

    if (needDecimal) {
      fixedNumber = Number.isInteger(number) ? number.toFixed(2) : number.toString();
      return parseFloat(fixedNumber).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      return number.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
  }

  return null;
}

export const compareDates = (date1: Date | string, date2: Date | string): number => {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();

  if (d1 > d2) return 1;  // date1 มากกว่า date2
  if (d1 < d2) return -1; // date1 น้อยกว่า date2
  return 0;               // date1 เท่ากับ date2
};

// export function checkDocumentType(type: MaintenanceType) {
//   switch (type) {
//     case MaintenanceType.IRP:
//       return "Included In RentalPrice";
//     case MaintenanceType.MQ:
//       return "Make Quotation";
//     case MaintenanceType.BCS:
//       return "Back Charge To Site";
//     default:
//       return "";
//   }
// }

// export const checkStep = (value: DocumentStep, setActiveStep: (number: number) => void, documentCategory: DocumentCategory) => {
//   switch (value) {
//     case DocumentStep.Equipment:
//       setActiveStep && setActiveStep(2);
//       // code block
//       break;
//     case DocumentStep.Location:
//       setActiveStep && setActiveStep(1);
//       // code block
//       break;
//     case DocumentStep.Part:
//       setActiveStep && setActiveStep(3);
//       // code block
//       break;
//     case DocumentStep.Repairman:
//       setActiveStep && setActiveStep(4);
//       // code block
//       break;
//     case DocumentStep.AdditionalFee:
//       setActiveStep && setActiveStep(5);
//       // code block
//       break;
//     case DocumentStep.WaitingApprove:
//       if (documentCategory === DocumentCategory.Rental) {
//         setActiveStep && setActiveStep(3);
//       } else {
//         setActiveStep && setActiveStep(6);
//       }
//       // code block
//       break;
//     default:
//       setActiveStep && setActiveStep(0);
//     // code block
//   }
// };

// export const showNameSelctReportSetting = (name: string) => {
//   switch (name) {
//     case SelectType.Category.toString():
//       return "รายงานตามหมวดหมู่";
//     case SelectType.EquipmentName.toString():
//       return "รายงานตามชื่ออุปกรณ์";
//     case SelectType.Location.toString():
//       return "รายงานตามสถานที่";
//     case ReportType.EquipmentPlan.toString():
//       return "รายงานสถานะและแผนใช้งานเครื่องจักร";
//     case ReportType.EquipmentPrice.toString():
//       return "รายงานสรุปมูลค่าเครื่องจักร";
//     case ReportType.InventoryStatus.toString():
//       return "รายงานสถานะเครื่องจักร";
//     case ReportType.MaintenanceCost.toString():
//       return "รายงานสรุปค่าซ่อมรายเดือน";
//     case ReportType.MaintenanceLog.toString():
//       return "รายงานสถานะซ่อมเครื่องจักร";
//     case ReportType.MaintenanceStatus.toString():
//       return "สถานที่";
//     case ReportType.RentalPrice.toString():
//       return "รายงานสรุปค่าเช่ารวม";
//     case ReportType.Tracker.toString():
//       return "รายงานสรุปค่าเช่าประจำเดือน";
//     case ReportType.WorkLoad.toString():
//       return "รายงานภาระงานผู้ซ่อม";
//     default:
//       name;
//       break;
//   }
// };
