// contexts/NotifyContext.tsx

"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
} from "react";

export interface NotifyState {
  open: boolean
  message?: string | null
  color: 'error' | 'success' | 'info' | "warning"
  header? :string | null,

}

export const initialNotify: NotifyState = { 
  open: false,
  message: "",
  color: "success" ,
  header: ""
}

// กำหนดประเภทของ Context
interface NotifyContextProps {
  notify: NotifyState;
  setNotify: Dispatch<React.SetStateAction<NotifyState>>;
  openBackdrop: boolean;
  setOpenBackdrop: Dispatch<React.SetStateAction<boolean>>;
}

// สร้าง Context
const NotifyContext = createContext<NotifyContextProps | undefined>(
  undefined
);

export const NotifyProvider = ({ children }: { children: ReactNode }) => {
  const [notify, setNotify] = useState<NotifyState>(initialNotify);
  const [openBackdrop, setOpenBackdrop] = useState<boolean>(false);

  return (
    <NotifyContext.Provider
      value={{
        notify,
        setNotify,
        setOpenBackdrop,
        openBackdrop
      }}
    >
      {children}
    </NotifyContext.Provider>
  );
};

// Hook สำหรับใช้ Context
export const useNotifyContext = () => {
  const context = useContext(NotifyContext);
  if (!context) {
    throw new Error("useDbContext must be used within a DbProvider");
  }
  return context;
};
