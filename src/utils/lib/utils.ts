import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import * as XLSX from 'xlsx';
import { DefaultOperatingHour, OperatingHourRequest } from "@/interfaces/Store"
// import { EquipmentRow } from '@/interfaces/Equipment';
// import { ReportType, SelectType } from "@/contexts/ReportContext";
// import { DocumentCategory, DocumentStep, MaintenanceType } from "@prisma/client";

/**
 * ฟังก์ชันสำหรับแทนที่ตัวแปรในข้อความที่ดึงมาจาก DB
 */
export function formatTemplate(template: string, data: Record<string, string>) {
  let message = template;
  Object.keys(data).forEach((key) => {
    // แทนที่ {key} ด้วย data[key]
    message = message.replace(new RegExp(`{${key}}`, 'g'), data[key]);
  });
  return message;
}

// --------------------------------------------------------------------------
// Helper Functions & Types
// --------------------------------------------------------------------------

// Helper function to convert "HH:MM" string to a valid Date object for Prisma
// Note: เราใช้ 2000-01-01T...Z เพื่อให้เป็น Time Object ที่อ้างอิง UTC Date

export function parseShopFromCallbackUrl(encodedUrl: string): string | null {
  try {
    // decode URL ก่อน
    const decoded = decodeURIComponent(encodedUrl);

    // แยก path
    const parts = decoded.split("/").filter(Boolean);

    // โครงสร้างที่คาดไว้: /protected/shop/{shopId}/...
    const shopIndex = parts.indexOf("shop");

    if (shopIndex === -1 || !parts[shopIndex + 1]) {
      return null;
    }

    return parts[shopIndex + 1];
  } catch (error) {
    return null;
  }
}


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

export function checkShopLoginCallbackUrl(urlString: string | null): boolean {
  try {

    if(!urlString){
      return false
    }

    console.log(urlString)
    
    // 4. ✅ ตรวจสอบค่าพารามิเตอร์: 
    // เรากำลังตรวจสอบว่าค่าที่ถูกถอดรหัส (Decoded Value) มี '/th/protected/shop/' อยู่หรือไม่
    // (ค่าที่ถูกส่งมาใน URL คือ %2Fth%2Fprotected%2Fshop%2F)
    const targetPathPatternLocal = '/th/protected/shop/';
    const targetPathPattern = '/protected/shop/';

    // เนื่องจาก URL Object จะถอดรหัสค่าพารามิเตอร์ให้เราแล้ว (เช่น %2F เป็น /)
    // เราจึงสามารถตรวจสอบกับสตริงที่ไม่ได้เข้ารหัสได้
    return urlString.includes(targetPathPattern || targetPathPatternLocal);
    
  } catch (error) {
    // จัดการข้อผิดพลาดหากสตริงที่ส่งมาไม่ใช่ URL ที่ถูกต้อง
    console.error("Invalid URL:", urlString);
    return false;
  }
}

export function isShopLoginURL(pathname: string) {
  const locales = ["th", "en"];

  // ตัวอย่าง URL:
  // /th/auth/sign-in?callbackUrl=%2Fth%2Fprotected%2Fshop%2Ficute-salon-shop
  // เราต้อง decode callbackUrl ก่อน
  const url = decodeURIComponent(pathname);

  const regex = new RegExp(
    `^/(${locales.join("|")})/protected/shop/([^/]+)(/.*)?$`,
    "i"
  );

  return regex.test(url);
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

export function formatThaiDateTimeRange(
  startISO: string,
  endISO: string
): string {
  const optionsDate: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  };

  const optionsTime: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Bangkok",
  };

  const startDate = new Date(startISO);
  const endDate = new Date(endISO);

  const thaiDate = new Intl.DateTimeFormat("th-TH", optionsDate).format(
    startDate
  );

  const startTime = new Intl.DateTimeFormat("th-TH", optionsTime).format(
    startDate
  );

  const endTime = new Intl.DateTimeFormat("th-TH", optionsTime).format(endDate);

  return `${thaiDate} เวลา ${startTime} - ${endTime} น.`;
}

