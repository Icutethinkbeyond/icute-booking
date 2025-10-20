// contexts/DocumentContext.tsx

"use client";

import {
  Document,
  DocumentIdSelect,
  initialDocument,
} from "@/interfaces/Document";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  useEffect,
} from "react";

// กำหนดประเภทของ Context
interface DocumentContextProps {
  documentState: Document[];
  setDocumentState: Dispatch<React.SetStateAction<Document[]>>;
  documentForm: Document;
  setDocumentForm: Dispatch<React.SetStateAction<Document>>;
  documentEdit: boolean;
  setDocumentEdit: Dispatch<React.SetStateAction<boolean>>;
  setDocumentSelectState: Dispatch<React.SetStateAction<DocumentIdSelect[]>>;
  documentSelectState: DocumentIdSelect[];
  handleBack: boolean;
  setHandleBack: Dispatch<React.SetStateAction<boolean>>;
  documentId: string;
  setDocumentId: Dispatch<React.SetStateAction<string>>;
}

// สร้าง Context
const DocumentContext = createContext<DocumentContextProps | undefined>(
  undefined
);

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [documentState, setDocumentState] = useState<Document[]>([]);
  const [documentForm, setDocumentForm] = useState<Document>(initialDocument);
  const [documentEdit, setDocumentEdit] = useState<boolean>(false);
  const [documentSelectState, setDocumentSelectState] = useState<DocumentIdSelect[]>([]);
  const [handleBack, setHandleBack] = useState<boolean>(false);
  const [documentId, setDocumentId] = useState<string>('');

  return (
    <DocumentContext.Provider
      value={{
        handleBack,
        setHandleBack,
        documentState,
        setDocumentState,
        documentForm,
        setDocumentForm,
        documentEdit,
        setDocumentEdit,
        documentSelectState,
        setDocumentSelectState,
        documentId,
        setDocumentId
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

// Hook สำหรับใช้ Context
export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDbContext must be used within a DbProvider");
  }
  return context;
};
