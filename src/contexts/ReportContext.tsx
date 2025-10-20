// contexts/ReportContext.tsx

"use client";

import { faker } from "@faker-js/faker";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  useEffect,
} from "react";

export enum SelectType {
  Category = "Category",
  Location = "Location",
  EquipmentName = "EquipmentName",
}

export enum ReportType {
  InventoryStatus = "InventoryStatus",
  EquipmentPlan = "EquipmentPlan",
  MaintenanceStatus = "MaintenanceStatus",
  RentalPrice = "RentalPrice",
  EquipmentPrice = "EquipmentPrice",
  Tracker = "Tracker",
  MaintenanceLog = "MaintenanceLog",
  MaintenanceCost = "MaintenanceCost",
  WorkLoad = "WorkLoad",
}

export type ReportExport = {
  reportType: ReportType;
  filename: string
  reportSettings: ReportSettings;
};

type ReportSettings = {
  selectType: SelectType;
  equipmentNameAll: boolean;
  equipmentId: string | null;
  categoryAll: boolean;
  categoryId: string | null;
  locationAll: boolean;
  locationId: string | null;
  engineerAll: boolean;
  engineerId: string | null;
};

const initialReportSettings: ReportSettings = {
  selectType: SelectType.Category,
  equipmentNameAll: false,
  equipmentId: "",
  categoryAll: true,
  categoryId: "",
  locationAll: true,
  locationId: "",
  engineerAll: true,
  engineerId: "",
};

export const initialReport: ReportExport = {
  reportType: ReportType.InventoryStatus,
  filename: '',
  reportSettings: initialReportSettings,
};

export // กำหนดประเภทของ Context
interface ReportContextProps {
  reportForm: ReportExport;
  setReportForm: Dispatch<React.SetStateAction<ReportExport>>;
}

// สร้าง Context
const ReportContext = createContext<ReportContextProps | undefined>(undefined);

export const ReportProvider = ({ children }: { children: ReactNode }) => {
  const [reportForm, setReportForm] = useState<ReportExport>(initialReport);

  return (
    <ReportContext.Provider
      value={{
        reportForm,
        setReportForm,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

// Hook สำหรับใช้ Context
export const useReportContext = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error("useDbContext must be used within a DbProvider");
  }
  return context;
};
