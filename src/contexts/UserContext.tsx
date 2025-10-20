// contexts/UserContext.tsx

"use client";

import {
  User,
  initialUser,
  // UserSelect,
  // TypeSelect,
} from "@/interfaces/User";
import { faker } from "@faker-js/faker";
import { RoleName, UserStatus } from "@prisma/client";
import { toNumber } from "lodash";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
} from "react";

// กำหนดประเภทของ Context
interface UserContextProps {
  userState: User[];
  setUserState: Dispatch<React.SetStateAction<User[]>>;
  userForm: User;
  setUserForm: Dispatch<React.SetStateAction<User>>;
  userEdit: boolean;
  setUserEdit: Dispatch<React.SetStateAction<boolean>>;
  setTypeEdit: Dispatch<React.SetStateAction<boolean>>;
  typeEdit: boolean;
  makeFakeData: () => void;
}

// สร้าง Context
const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userState, setUserState] = useState<User[]>([]);
  const [userForm, setUserForm] = useState<User>(initialUser);
  const [userEdit, setUserEdit] = useState<boolean>(false);
  const [typeEdit, setTypeEdit] = useState<boolean>(false);

  const makeFakeData = () => {
    let _name = faker.person.firstName();
    setUserForm({
      ...userForm,
      email: `${_name}@mail.com`,
      password: "",
      name: `${_name} ${faker.person.lastName()}`,
      department: faker.person.jobTitle(),
      position: faker.person.jobType(),
      image: "",
      roleName: RoleName.Employee,
      userStatus: UserStatus.Active,
      phone: faker.phone.number({ style: 'human' }),
      manDay: toNumber(faker.finance.amount({ min: 1, max: 10000, dec: 0 })),
      address: `${faker.location.buildingNumber()} ${faker.location.street()} ${faker.location.city()} ${faker.location.country()} ${faker.location.zipCode()}`,
    });
  };

  return (
    <UserContext.Provider
      value={{
        userState,
        setUserState,
        userForm,
        setUserForm,
        userEdit,
        setUserEdit,
        typeEdit,
        setTypeEdit,
        makeFakeData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Hook สำหรับใช้ Context
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useDbContext must be used within a DbProvider");
  }
  return context;
};
