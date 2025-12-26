// contexts/ServiceContext.tsx

"use client";

import {
  Service,
  initialService,
  // initialservice,
  ServiceList,
} from "@/interfaces/Store";
import { faker } from "@faker-js/faker";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  useEffect,
} from "react";

// กำหนดประเภทของ Context
interface ServiceContextProps {
  services: Service[];
  setServices: Dispatch<React.SetStateAction<Service[]>>;
  serviceForm: Service;
  setServiceForm: Dispatch<React.SetStateAction<Service>>;
  serviceEdit: boolean;
  setServiceEdit: Dispatch<React.SetStateAction<boolean>>;
  // setTypeForm: Dispatch<React.SetStateAction<ServiceList>>;
  setServiceList: Dispatch<React.SetStateAction<ServiceList[]>>;
  serviceList: ServiceList[];
}

// สร้าง Context
const ServiceContext = createContext<ServiceContextProps | undefined>(
  undefined
);

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceList, setServiceList] = useState<ServiceList[]>([]);
  const [serviceForm, setServiceForm] = useState<Service>(initialService);
  const [serviceEdit, setServiceEdit] = useState<boolean>(false);

  useEffect(() => {
    // setserviceForm({
    //   ...serviceForm,
    //   serviceId: "",
    //   serviceName: faker.company.name(),
    //   serviceDesc: faker.lorem.lines(),
    //   equipments: [],
    // });
    // setTypeForm({
    //   ...typeForm,
    //   ServiceId: "",
    //   ServiceName: faker.finance.currencyCode(),
    //   ServiceDesc: faker.lorem.lines(),
    //   equipments: [],
    // });
  }, []);

  return (
    <ServiceContext.Provider
      value={{
        services,
        setServices,
        serviceForm,
        setServiceForm,
        serviceEdit,
        setServiceEdit,
        serviceList,
        setServiceList,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

// Hook สำหรับใช้ Context
export const useServiceContext = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useServiceContext must be used within a ServiceProvider");
  }
  return context;
};
