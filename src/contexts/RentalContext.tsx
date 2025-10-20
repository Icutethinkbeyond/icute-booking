// contexts/RentalContext.tsx

"use client";

import { Rental, initialRental } from "@/interfaces/Rental";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  useEffect,
} from "react";
import { faker } from "@faker-js/faker";
import { RentalStatus } from "@prisma/client";
import { toNumber } from "lodash";
import { makeId } from "@/utils/utils";
import { useEquipmentContext } from "./EquipmentContext";
import { EquipmentSelect } from "@/interfaces/Equipment";

// กำหนดประเภทของ Context
interface RentalContextProps {
  rentalsState: Rental[];
  setRentalsState: Dispatch<React.SetStateAction<Rental[]>>;
  rentalForm: Rental;
  setRentalForm: Dispatch<React.SetStateAction<Rental>>;
  rentalEdit: boolean;
  setRentalEdit: Dispatch<React.SetStateAction<boolean>>;
  addRental: (rental: Rental) => void;
  removeRental: (equipmentId: string) => void;
  handleRemoveRental: (rentalId: string) => void;
}

// สร้าง Context
const RentalContext = createContext<RentalContextProps | undefined>(undefined);

export const RentalProvider = ({ children }: { children: ReactNode }) => {
  const { setEquipmentSelectState } =
    useEquipmentContext();

  const [rentalsState, setRentalsState] = useState<Rental[]>([]);
  const [rentalForm, setRentalForm] = useState<Rental>(initialRental);
  const [rentalEdit, setRentalEdit] = useState<boolean>(false);

  // ฟังก์ชันสำหรับเพิ่มสินค้า
  const addRental = (rental: Rental) => {
    setRentalsState((prevRentals) => [...prevRentals, rental]);

    // ลบออกจาก options
    setEquipmentSelectState((prev) =>
      prev.filter((item) => item.equipmentId !== rental.equipmentId)
    );
  };

  // ฟังก์ชันสำหรับลบสินค้า
  const removeRental = (equipmentId: string) => {
    setRentalsState((prevRentals) =>
      prevRentals.filter((rental) => rental.equipmentId !== equipmentId)
    );
  };

  const handleRemoveRental = (rentalId: string) => {
    const removedRental = rentalsState.find(
      (rental) => rental.rentalId === rentalId
    );

    if (removedRental) {
      // สร้าง EquipmentSelect object จากข้อมูลใน removedRental
      const equipmentToReturn: EquipmentSelect = {
        equipmentId: removedRental.equipment
          ? removedRental.equipment.equipmentId
          : "",
        equipmentName: removedRental.equipment
          ? removedRental.equipment.equipmentName
          : "",
        serialNo: removedRental.equipment
          ? removedRental.equipment?.serialNo
          : "",
      };

      // ลบออกจาก rentalsState
      setRentalsState((prev) =>
        prev.filter((rental) => rental.rentalId !== rentalId)
      );

      // เพิ่มกลับไปใน equipmentSelectState
      setEquipmentSelectState((prev) => [...prev, equipmentToReturn]);
    }
  };

  return (
    <RentalContext.Provider
      value={{
        rentalEdit,
        setRentalEdit,
        rentalsState,
        setRentalsState,
        rentalForm,
        setRentalForm,
        addRental,
        removeRental,
        handleRemoveRental,
      }}
    >
      {children}
    </RentalContext.Provider>
  );
};

// Hook สำหรับใช้ Context
export const useRentalContext = () => {
  const context = useContext(RentalContext);
  if (!context) {
    throw new Error("useDbContext must be used within a DbProvider");
  }
  return context;
};
