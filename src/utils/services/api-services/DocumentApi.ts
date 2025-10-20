import { Document } from "@/interfaces/Document";
import APIServices from "../APIServices";

export const DOCUMENT_API_BASE_URL = "/api/document";

export const documentService = {
    async getDocument(documentId: string) {
        try {
            let data: any = await APIServices.get(`${DOCUMENT_API_BASE_URL}?documentId=${documentId}`);
            console.log(data)
            return { success: true, data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    async getSelectDocument() {
        try {
            let data: any = await APIServices.get(`${DOCUMENT_API_BASE_URL}?getbycharacter=true`);
            return { success: true, data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    async createDocument(document: Document) {
        try {
            const response = await APIServices.post(DOCUMENT_API_BASE_URL, document);
            return { success: true, message: `สร้างเอกสาร ${document.documentIdNo} สำเร็จ`, data: response };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    async updateDocument(document: Document) {
        try {
            const response = await APIServices.patch(DOCUMENT_API_BASE_URL, document);
            return { success: true, message: `แก้ไขเอกสาร ${document.documentIdNo} สำเร็จ`, data: response };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    async deleteDocument(documentId: string) {
        try {
            const response: any = await APIServices.delete(`${DOCUMENT_API_BASE_URL}?documentId=${documentId}`);
            return { success: true, message: `ระบบได้ลบ ${response.documentIdNo} แล้ว` };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.message || "เกิดข้อผิดพลาด" };
        }
    },
};
