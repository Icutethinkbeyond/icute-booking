import { MaintenanceType, PartStatus, LocationType, EquipmentOwner, RepairStatus, EquipmentStatus } from "@prisma/client";
import dayjs, { Dayjs } from "dayjs";
import { initialUser, User } from "./User";
import { Equipment } from "./Equipment";
import { Document } from "./Document";

// Maintenance
export interface Maintenance {
  maintenanceId: string;
  natureOfBreakdown?: string;
  causes?: string;
  repairingStart?: Dayjs | null;
  repairingEnd?: Dayjs | null;
  TOFstart?: Dayjs | null;
  TOFend?: Dayjs | null;
  repairman: Repairman;
  // TORstart?: Dayjs | null;
  // TORend?: Dayjs | null;
  brokenItems: BrokenItems;
  quantity: number;
  parts?: Part;
  maintenanceType: MaintenanceType;
  repairLocation: LocationType;
  // equipmentOwner: EquipmentOwner;
  maintenanceRamark?: string;
  technicianName?: string;
  plantEngineer?: string;
  plantApproval?: string;
  documentId: string;
  document?: Document
  additional?: Additional;


  documentDetials?: string
}

// Repairman
export interface Repairman {
  repairmanIdTemp?: string | null;
  repairmanId: string;
  userId: string
  user?: User,
  activities?: string | null;
  manHours?: number | null;
  cost?: number;
  repairmanRemark?: string | null;
  maintenance?: Maintenance | null;
  maintenanceId?: string | null;
}

// BrokenItems
export interface BrokenItems {
  brokenItemsIdTemp?: string | null,
  brokenItemsId: string;
  // equipmentOwn: boolean;
  equipmentId?: string;
  equipment?: Equipment | null;
  maintenanceId?: string;
  maintenance?: Maintenance
  quantity: number;
  parts?: Part[] | null;
  equipmentOwner: EquipmentOwner;
  repairStatus: RepairStatus;
  oldstockStatus: EquipmentStatus | null

  equipmentName?: string;
}

export interface Part {
  partIdTemp?: string | null;
  partId: string;
  partName: string;
  partDesc?: string;
  partSerialNo?: string;
  brand?: string;
  partStatus: PartStatus;
  quantity: number;
  unitName?: string;
  partPrice?: number;
  brokenItems?: BrokenItems,
  brokenItemsId: string,
}

export interface Additional {

  additionalTempId?: string | null
  additionalId: string

  additionalName: string//Action
  additionalDesc?: string
  additionalPrice?: number

  maintenance?: Maintenance
  maintenanceId?: string

}

export type BrokenItemsSelect = {
  brokenItemId: string; 
  brokenItemName: string;
};

export const initialBrokenItems: BrokenItems = {
  brokenItemsIdTemp: '',
  brokenItemsId: '',
  // equipmentOwn: true,
  equipmentId: '',
  maintenanceId: '',
  quantity: 0,
  equipmentOwner: EquipmentOwner.Plant,
  repairStatus: RepairStatus.Waiting,
  oldstockStatus: null,
  equipmentName: ''
};

// Part

export const initialPart: Part = {
  partIdTemp: '',
  partId: '',
  partName: '',
  partStatus: PartStatus.Stock,
  quantity: 1,
  partPrice: 0,
  partDesc: '',
  partSerialNo: '',
  brand: '',
  unitName: '',
  brokenItemsId: '',
  
};

export const initialRepairman: Repairman = {
  repairmanIdTemp: '',
  repairmanId: '',
  userId: '',
  activities: null,
  manHours: 0,
  cost: 0,
  repairmanRemark: null,
  maintenanceId: null,
  user: initialUser,
  // maintenance: initialMaintenance;
};

export const initialAdditional: Additional = {
  additionalId: '',

  additionalName: '',
  additionalDesc: '',
  additionalPrice: 0,

  // maintenance: initialMaintenance,
  maintenanceId: '',
};

export const initialMaintenance: Maintenance = {
  maintenanceId: '',
  natureOfBreakdown: '',
  causes: '',
  repairingStart: null,
  repairingEnd: null,
  TOFstart: null,
  TOFend: null,
  repairman: initialRepairman,
  brokenItems: initialBrokenItems,
  quantity: 0,
  parts: initialPart,
  maintenanceRamark: '',
  technicianName: '',
  plantEngineer: '',
  plantApproval: '',
  repairLocation: LocationType.OnPlant,
  // equipmentOwner: EquipmentOwner.Plant,
  maintenanceType: MaintenanceType.IRP,
  documentId: '',
  additional: initialAdditional,

  documentDetials: ''
};

