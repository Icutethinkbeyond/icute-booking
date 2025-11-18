// contexts/ReportContext.tsx

"use client";

import { initialReport, ReportSetting } from "@/interfaces/Report";
import { faker } from "@faker-js/faker";
import { Dayjs } from "dayjs";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  useEffect,
} from "react";


export // กำหนดประเภทของ Context
interface ReportContextProps {
  reportForm: ReportSetting;
  setReportForm: Dispatch<React.SetStateAction<ReportSetting>>;
}

// สร้าง Context
const ReportContext = createContext<ReportContextProps | undefined>(undefined);

export const ReportProvider = ({ children }: { children: ReactNode }) => {
  const [reportForm, setReportForm] = useState<ReportSetting>(initialReport);

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
    throw new Error("useReportContext must be used within a ReportProvider");
  }
  return context;
};
