import { DocumentCategory, DocumentStatus, DocumentStep, EquipmentOwner, LocationType, MaintenanceType } from "@prisma/client";
import { initialRental, Rental } from "./Rental"
import { initialSite, Site } from "./Site";
import { initialMaintenance, Maintenance } from "./Maintenance";
import dayjs, { Dayjs } from "dayjs";
import { _Mouth } from "./ShredType";

// Document
export interface Document {

    documentId: string;

    documentIdNo: string;

    docType: string;
    docMonth: _Mouth
    docYear: string;

    documentDetials?: string;
    documentType: DocumentCategory;
    siteId: string;
    documentStatus: DocumentStatus;
    documentStep: DocumentStep;
    rental: Rental[];
    rantalId?: string;
    maintenance: Maintenance;
    maintenanceId?: string
    site?: Site

}

export interface DocumentIdSelect {
    documentId: string;
    documentIdNo: string;
}

export const initialDocument: Document = {
    documentId: '',
    documentIdNo: '',
    docType: '',
    docMonth: _Mouth.JAN,
    docYear: '',
    documentDetials: '',
    documentType: DocumentCategory.Rental,
    siteId: '',
    documentStatus: DocumentStatus.Draft,
    documentStep: DocumentStep.Location,
    rental: [],
    maintenance: initialMaintenance,


    // For MA Type
    // repairLocation: LocationType.OnPlant,
    // equipmentOwner: EquipmentOwner.Plant,
    // natureOfBreakdown: '',
    // causes: '',
    // TOFstart: dayjs(new Date()),
    // repairingStart: dayjs(new Date()),
    // maintenanceType: MaintenanceType.BCS,
    // technicianName: '',
    // plantEngineer: '',
    // plantApproval: '',
};
