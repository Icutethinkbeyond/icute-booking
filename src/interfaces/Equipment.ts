import { BrokenItems, EquipmentStatus, Rental } from "@prisma/client";
import { Category, EquipmentType, initialCategory } from "./Category_Type";
import dayjs, { Dayjs } from 'dayjs';

// Equipment
export interface Equipment {
  equipmentId: string;
  equipmentName: string;
  serialNo?: string;
  model?: string;
  brand?: string;
  description?: string
  equipmentOwn: boolean;
  aboutEquipment: AboutEquipment;
  categoryId?: string;
  category?: Category;
  equipmentTypeId?: string;
  equipmentType?: EquipmentType;
  brokenItems?: BrokenItems[];
  rental?: Rental[];
}

export interface EquipmentQuery {
  equipmentId: string;
  equipmentName: string;
  serialNo?: string | null | undefined;
  model?: string | null | undefined;
  brand?: string | null | undefined;
  description?: string | null | undefined;
  equipmentOwn: boolean;
  aboutEquipment?: AboutEquipment | null | undefined;
  categoryId?: string | null | undefined;
  category?: Category | null | undefined;
  equipmentTypeId?: string | null | undefined;
  equipmentType?: EquipmentType | null | undefined;
  brokenItems?: BrokenItems[];
  rental?: Rental[];
}

export interface EquipmentRow {
  equipmentname: string;
  model?: string;
  serialno: string;
  brand?: string;
  description?: string;
  qty?: string;
  mfd:string;
  btlumber?: string;
  purchasedprice?: string;
  purchasedate?: string;
  registerdate?: string;
  po?: string;
  fixassetsnumber?: string;
  rentalpricepre?: string;
  rentalrate: string;
  unitname?: string;
  stockstatus?: string;
  categoryname: string;
  [key: string]: any; // ✅ เพิ่ม index signature
}

// AboutEquipment
export interface AboutEquipment {
  aboutEquipmentId: string;
  equipmentId: string;
  equipmentPrice?: number | null | undefined;
  rentalPricePre?: number | null | undefined;
  rentalPriceCurrent: number;
  rentalUpdateAt: Date;
  purchaseDate?: Dayjs | null | Date;
  PO: string | null | undefined,
  fixAssetsNumber: string | null | undefined,
  QTY: number | null | undefined,
  BTLNumber: string | null | undefined,
  unitName: string;
  stockStatus: EquipmentStatus;
  registerDate?: Dayjs | null | Date;
}

export interface EquipmentSelect {
  equipmentId: string;
  equipmentName: string;
  serialNo?: string | null;
}

export const initialAboutEquipment: AboutEquipment = {
  aboutEquipmentId: '',
  equipmentId: '',
  equipmentPrice: 0,
  rentalPriceCurrent: 0,
  rentalPricePre: 0,
  rentalUpdateAt: new Date(),
  PO: "",
  fixAssetsNumber: "",
  QTY: 0,
  BTLNumber: "",
  unitName: 'Unit',
  stockStatus: EquipmentStatus.InStock,
  purchaseDate: null,
  registerDate: null
};


export const initialEquipment: Equipment = {
  equipmentId: '',
  equipmentName: '',
  aboutEquipment: initialAboutEquipment,
  categoryId: '',
  equipmentTypeId: '',
  equipmentOwn: true,
  // category: initialCategory,
  brokenItems: [],
  rental: [],
};

