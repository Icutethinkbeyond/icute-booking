// contexts/MaintenanceContext.tsx

"use client";

import {
  Additional,
  BrokenItems,
  BrokenItemsSelect,
  Maintenance,
  Part,
  Repairman,
  initialBrokenItems,
  initialMaintenance,
  initialPart,
  initialRepairman,
} from "@/interfaces/Maintenance";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  useEffect,
} from "react";
import { faker } from "@faker-js/faker";
import { toNumber } from "lodash";
import { useEquipmentContext } from "./EquipmentContext";
import { EquipmentSelect } from "@/interfaces/Equipment";
import { EquipmentOwner, PartStatus } from "@prisma/client";
import { EngineerSelect } from "@/interfaces/User";
import { initialAdditional } from "../interfaces/Maintenance";

// กำหนดประเภทของ Context
interface MaintenanceContextProps {
  maintenancesState: Maintenance[];
  setMaintenancesState: Dispatch<React.SetStateAction<Maintenance[]>>;
  partsState: Part[];
  setPartsState: Dispatch<React.SetStateAction<Part[]>>;
  repairmanState: Repairman[];
  setRepairmanState: Dispatch<React.SetStateAction<Repairman[]>>;
  brokenItemsState: BrokenItems[];
  setBrokenItemsState: Dispatch<React.SetStateAction<BrokenItems[]>>;
  brokenItemForm: BrokenItems;
  setBrokenItemForm: Dispatch<React.SetStateAction<BrokenItems>>;
  repairmanForm: Repairman;
  setRepairmanForm: Dispatch<React.SetStateAction<Repairman>>;
  repairmanStateSelect: EngineerSelect[];
  setRepairmanStateSelect: Dispatch<React.SetStateAction<EngineerSelect[]>>;
  maintenanceForm: Maintenance;
  setMaintenanceForm: Dispatch<React.SetStateAction<Maintenance>>;
  partForm: Part;
  setPartForm: Dispatch<React.SetStateAction<Part>>;
  brokenItemsSelect: BrokenItemsSelect[];
  setBrokenItemsSelect: Dispatch<React.SetStateAction<BrokenItemsSelect[]>>;
  additionalState: Additional[];
  setAdditionalState: Dispatch<React.SetStateAction<Additional[]>>;
  additionalForm: Additional;
  setAdditionalForm: Dispatch<React.SetStateAction<Additional>>;
  maintenanceEdit: boolean;
  setMaintenanceEdit: Dispatch<React.SetStateAction<boolean>>;
  addRepairMan: (repairman: Repairman) => void;
  addBrokenItem: (broken: BrokenItems) => void;
  handleRemoveBrokenItem: (
    brokenItemId: string,
    equipmentOwn: EquipmentOwner,
    brokenItemsIdTemp?: string | null | undefined
  ) => void;
  removePartFromBrokenItem: (
    brokenItemsId: string,
    partId: string | null | undefined,
    partIdTemp: string | null | undefined
  ) => void;
  addPartToBrokenItem: (brokenItemsId: string, newPart: Part) => void;
  handleRemoveRepairMan: (repairmanId: string) => void;
  handleRemoveAdditional: (additionalId: string | null | undefined, additionalTempId: string | null | undefined) => void
  makePartFakeData: () => void;
}

// สร้าง Context
const MaintenanceContext = createContext<MaintenanceContextProps | undefined>(
  undefined
);

export const MaintenanceProvider = ({ children }: { children: ReactNode }) => {
  const { setEquipmentSelectState } = useEquipmentContext();

  // Maintenance State Handle
  const [maintenancesState, setMaintenancesState] = useState<Maintenance[]>([]);
  const [maintenanceEdit, setMaintenanceEdit] = useState<boolean>(false);
  const [maintenanceForm, setMaintenanceForm] =
    useState<Maintenance>(initialMaintenance);

  // Part State Handle
  const [partsState, setPartsState] = useState<Part[]>([]);
  const [partForm, setPartForm] = useState<Part>(initialPart);

  // Additional State Handle
  const [additionalState, setAdditionalState] = useState<Additional[]>([]);
  const [additionalForm, setAdditionalForm] =
    useState<Additional>(initialAdditional);

  // RepairMan State Handle
  const [repairmanState, setRepairmanState] = useState<Repairman[]>([]);
  const [repairmanForm, setRepairmanForm] =
    useState<Repairman>(initialRepairman);
  const [repairmanStateSelect, setRepairmanStateSelect] = useState<
    EngineerSelect[]
  >([]);

  // BrokenItem State Handle
  const [brokenItemsState, setBrokenItemsState] = useState<BrokenItems[]>([]);
  const [brokenItemsSelect, setBrokenItemsSelect] = useState<
    BrokenItemsSelect[]
  >([]);
  const [brokenItemForm, setBrokenItemForm] =
    useState<BrokenItems>(initialBrokenItems);

  const makePartFakeData = () => {
    setPartForm({
      ...partForm,
      partName: faker.vehicle.vehicle(),
      partStatus: PartStatus.Stock,
      quantity: toNumber(faker.finance.amount({ min: 1, max: 10, dec: 0 })),
      partPrice: toNumber(faker.finance.amount({ min: 1, max: 9999, dec: 0 })),
      partDesc: faker.lorem.paragraph(),
      partSerialNo: "",
      brand: faker.commerce.product(),
      unitName: "Unit",
    });
  };

  const addRepairMan = (repairman: Repairman) => {
    setRepairmanState((prevRepairman) => [...prevRepairman, repairman]);

    // ลบออกจาก options
    setRepairmanStateSelect((prev) =>
      prev.filter((item) => item.userId !== repairman.userId)
    );
  };

  const addBrokenItem = (broken: BrokenItems) => {
    setBrokenItemsState((prevMaintenances) => [...prevMaintenances, broken]);

    if (broken.equipmentOwner === EquipmentOwner.Plant) {
      // ลบออกจาก options
      setEquipmentSelectState((prev) =>
        prev.filter((item) => item.equipmentId !== broken.equipmentId)
      );
    }
  };

  const handleRemoveBrokenItem = (
    brokenItemId: string,
    equipmentOwn: EquipmentOwner,
    brokenItemsIdTemp?: string | null | undefined
  ) => {
    let removedBrokenState;

    if (brokenItemId) {
      removedBrokenState = brokenItemsState.find(
        (item) => item.brokenItemsId === brokenItemId
      );
    } else {
      removedBrokenState = brokenItemsState.find(
        (item) => item.brokenItemsIdTemp === brokenItemsIdTemp
      );
    }

    if (removedBrokenState) {
      if (brokenItemId) {
        setBrokenItemsState((prev) =>
          prev.filter((item) => item.brokenItemsId !== brokenItemId)
        );
      } else {
        setBrokenItemsState((prev) =>
          prev.filter((item) => item.brokenItemsIdTemp !== brokenItemsIdTemp)
        );
      }

      if (equipmentOwn === EquipmentOwner.Plant) {
        // สร้าง EquipmentSelect object จากข้อมูลใน removedBrokenState
        const equipmentToReturn: EquipmentSelect = {
          equipmentId: removedBrokenState.equipment
            ? removedBrokenState.equipment.equipmentId
            : "",
          equipmentName: removedBrokenState.equipment
            ? removedBrokenState.equipment.equipmentName
            : "",
          serialNo: removedBrokenState.equipment
            ? removedBrokenState.equipment?.serialNo
            : "",
        };

        // เพิ่มกลับไป
        setEquipmentSelectState((prev) => [...prev, equipmentToReturn]);
      }
    }
  };

  const handleRemoveRepairMan = (userId: string) => {
    let removedRepairmanState;

    if (userId) {
      removedRepairmanState = repairmanState.find(
        (item) => item.userId === userId
      );
    }

    if (removedRepairmanState) {
      setRepairmanState((prev) =>
        prev.filter((item) => item.userId !== userId)
      );

      // สร้าง EquipmentSelect object จากข้อมูลใน removedBrokenState
      const engineerToReturn: EngineerSelect = {
        userId: removedRepairmanState.userId
          ? removedRepairmanState.userId
          : "",
        name: removedRepairmanState.user?.name
          ? removedRepairmanState.user?.name
          : "",
      };

      // เพิ่มกลับไป
      setRepairmanStateSelect((prev) => [...prev, engineerToReturn]);
    }
  };

  // 🟢 ฟังก์ชันเพิ่ม Part เข้าไปใน brokenItem
  const addPartToBrokenItem = (brokenItemsId: string, newPart: Part) => {
    setBrokenItemsState((prevItems) =>
      prevItems.map((item) =>
        item.brokenItemsId === brokenItemsId
          ? { ...item, parts: [...(item.parts || []), newPart] }
          : item
      )
    );
  };

  // 🔴 ฟังก์ชันลบ Part ออกจาก brokenItem
  const removePartFromBrokenItem = (
    brokenItemsId: string,
    partIdTemp: string | null | undefined,
    partId: string | null | undefined
  ) => {
    console.log("🔍 Removing part from brokenItem:");
    console.log("  - brokenItemsId:", brokenItemsId);
    console.log("  - partId:", partId);
    console.log("  - partIdTemp:", partIdTemp);

    setBrokenItemsState((prevItems) =>
      prevItems.map((item) =>
        item.brokenItemsId === brokenItemsId
          ? {
              ...item,
              parts:
                item.parts?.filter((part: Part) => {
                  console.log("🛠 Checking part:", part);

                  if (partId && part.partId) {
                    console.log(
                      `  - Comparing partId: ${part.partId} !== ${partId}`
                    );
                    return part.partId !== partId;
                  }
                  if (partIdTemp && part.partIdTemp) {
                    console.log(
                      `  - Comparing partIdTemp: ${part.partIdTemp} !== ${partIdTemp}`
                    );
                    return part.partIdTemp !== partIdTemp;
                  }
                  return true; // ถ้าไม่มีค่า partId หรือ partIdTemp, ให้คง part นี้ไว้
                }) || [],
            }
          : item
      )
    );
  };

  const handleRemoveAdditional = (additionalId: string | null | undefined, additionalTempId: string | null | undefined) => {
    // setAdditionalState()
    const updatedList = additionalState.filter((item: Additional) => {
      if (additionalId) {
        return item.additionalId !== additionalId;
      } else if (additionalTempId) {
        return item.additionalTempId !== additionalTempId;
      }
      return true;
    });
  
    // อัปเดต state
    setAdditionalState(updatedList);
  };

  return (
    <MaintenanceContext.Provider
      value={{
        maintenanceEdit,
        setMaintenanceEdit,
        maintenancesState,
        setMaintenancesState,
        maintenanceForm,
        setMaintenanceForm,
        setPartsState,
        partsState,
        setPartForm,
        partForm,
        makePartFakeData,
        setRepairmanState,
        repairmanState,
        setRepairmanStateSelect,
        repairmanStateSelect,
        setRepairmanForm,
        repairmanForm,
        addBrokenItem,
        handleRemoveBrokenItem,
        setBrokenItemsState,
        brokenItemsState,
        setBrokenItemForm,
        brokenItemForm,
        setBrokenItemsSelect,
        brokenItemsSelect,
        removePartFromBrokenItem,
        addPartToBrokenItem,
        addRepairMan,
        setAdditionalForm,
        additionalForm,
        setAdditionalState,
        additionalState,
        handleRemoveRepairMan,
        handleRemoveAdditional
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
};

// Hook สำหรับใช้ Context
export const useMaintenanceContext = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error("useDbContext must be used within a DbProvider");
  }
  return context;
};
