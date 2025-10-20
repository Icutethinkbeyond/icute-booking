// contexts/BreadcrumbContext.tsx

"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
} from "react";

// กำหนดประเภทของ Context
interface BreadcrumbContextProps {
  breadcrumbs: Breadcrumbs[];
  setBreadcrumbs: Dispatch<React.SetStateAction<Breadcrumbs[]>>;
  icon: JSX.Element | null;
  setIcon: Dispatch<React.SetStateAction<JSX.Element | null>>;
}

interface Breadcrumbs {
  name: string;
  href?: string;
}

// สร้าง Context
const BreadcrumbContext = createContext<BreadcrumbContextProps | undefined>(
  undefined
);

export const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumbs[]>([]);
  const [icon, setIcon] = useState<JSX.Element | null>(null);

  return (
    <BreadcrumbContext.Provider
      value={{
        breadcrumbs,
        setBreadcrumbs,
        icon,
        setIcon,
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
};

// Hook สำหรับใช้ Context
export const useBreadcrumbContext = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useDbContext must be used within a DbProvider");
  }
  return context;
};
