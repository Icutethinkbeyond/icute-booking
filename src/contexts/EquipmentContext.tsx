// contexts/EquipmentContext.tsx

"use client";

import {
  AboutEquipment,
  Equipment,
  EquipmentSelect,
  initialAboutEquipment,
  initialEquipment,
} from "@/interfaces/Equipment";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  useEffect,
} from "react";
import { faker } from "@faker-js/faker";
import { EquipmentStatus } from "@prisma/client";
import { toNumber } from "lodash";
import { makeId, randomDate } from "@/utils/utils";
import dayjs from "dayjs";

// กำหนดประเภทของ Context
interface EquipmentContextProps {
  equipments: Equipment[];
  setEquipments: Dispatch<React.SetStateAction<Equipment[]>>;
  aboutEquipment: AboutEquipment;
  setAboutEquipment: Dispatch<React.SetStateAction<AboutEquipment>>;
  equipment: Equipment;
  setEquipment: Dispatch<React.SetStateAction<Equipment>>;
  equipmentEdit: boolean;
  setEquipmentEdit: Dispatch<React.SetStateAction<boolean>>;
  setEquipmentSelectState: Dispatch<React.SetStateAction<EquipmentSelect[]>>;
  equipmentSelectState: EquipmentSelect[];
  makeFakeData: () => void;
}

// สร้าง Context
const EquipmentContext = createContext<EquipmentContextProps | undefined>(
  undefined
);

export const EquipmentProvider = ({ children }: { children: ReactNode }) => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [aboutEquipment, setAboutEquipment] = useState<AboutEquipment>(
    initialAboutEquipment
  );
  const [equipment, setEquipment] = useState<Equipment>(initialEquipment);
  const [equipmentEdit, setEquipmentEdit] = useState<boolean>(false);
  const [equipmentSelectState, setEquipmentSelectState] = useState<
    EquipmentSelect[]
  >([]);

  const makeFakeData = () => {
    // setEquipment({
    //   ...equipment,
    //   equipmentId: "",
    //   brand: faker.commerce.product(),
    //   equipmentName: faker.vehicle.vehicle(),
    //   serialNo: makeId(3) + "-" + makeId(5),
    //   description: faker.lorem.paragraph(),
    //   aboutEquipment: {
    //     aboutEquipmentId: "",
    //     equipmentId: "",
    //     rentalPriceCurrent: toNumber(
    //       faker.finance.amount({ min: 1, max: 99999, dec: 0 })
    //     ),
    //     equipmentPrice: toNumber(
    //       faker.finance.amount({ min: 1, max: 99999, dec: 0 })
    //     ),
    //     rentalPricePre: 0,
    //     rentalUpdateAt: new Date(),
    //     unitName: "Unit",
    //     stockStatus: EquipmentStatus.InStock,
    //     purchaseDate: dayjs(randomDate(new Date(2012, 0, 1), new Date())),
    //   },
    //   categoryId: "",
    //   equipmentTypeId: "",
    //   equipmentOwn: true,
    //   brokenItems: [],
    //   rental: [],
    // });
  };

  // useEffect(() => {
  //   makeFakeData();
  // }, []);

  return (
    <EquipmentContext.Provider
      value={{
        equipments,
        setEquipments,
        equipment,
        setEquipment,
        equipmentEdit,
        setEquipmentEdit,
        aboutEquipment,
        setAboutEquipment,
        equipmentSelectState,
        setEquipmentSelectState,
        makeFakeData,
      }}
    >
      {children}
    </EquipmentContext.Provider>
  );
};

// Hook สำหรับใช้ Context
export const useEquipmentContext = () => {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error("useDbContext must be used within a DbProvider");
  }
  return context;
};
