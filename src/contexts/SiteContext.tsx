// contexts/SiteContext.tsx

"use client";

import { Site, SiteSelect, initialSite } from "@/interfaces/Site";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  useEffect,
} from "react";
import { faker } from "@faker-js/faker";
import { DocumentCategory, LocationType } from "@prisma/client";

// กำหนดประเภทของ Context
interface SiteContextProps {
  siteState: Site[];
  setSiteState: Dispatch<React.SetStateAction<Site[]>>;
  siteForm: Site;
  setSiteForm: Dispatch<React.SetStateAction<Site>>;
  siteEdit: boolean;
  setSiteEdit: Dispatch<React.SetStateAction<boolean>>;
  setSiteSelectState: Dispatch<React.SetStateAction<SiteSelect[]>>;
  siteSelectState: SiteSelect[];
  makeSiteFakeData: () => void
}

// สร้าง Context
const SiteContext = createContext<SiteContextProps | undefined>(undefined);

export const SiteProvider = ({ children }: { children: ReactNode }) => {
  const [siteState, setSiteState] = useState<Site[]>([]);
  const [siteForm, setSiteForm] = useState<Site>(initialSite);
  const [siteEdit, setSiteEdit] = useState<boolean>(false);
  const [siteSelectState, setSiteSelectState] = useState<SiteSelect[]>([]);

  const makeSiteFakeData = () => {
    setSiteForm({
      ...siteForm,
      siteName: `LOCATION-${faker.location.buildingNumber()}`,
      siteDesc: faker.lorem.paragraph(),
      contactorName: faker.person.fullName(),
      contactorEmail: faker.internet.email(),
      contactorTel: faker.phone.number(),
      repairLocation: LocationType.OnSite
    });
  };

  return (
    <SiteContext.Provider
      value={{
        siteState,
        setSiteState,
        siteForm,
        setSiteForm,
        siteEdit,
        setSiteEdit,
        siteSelectState,
        setSiteSelectState,
        makeSiteFakeData
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

// Hook สำหรับใช้ Context
export const useSiteContext = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useDbContext must be used within a DbProvider");
  }
  return context;
};
