import { Equipment } from "@/interfaces/Equipment";
import APIServices from "../APIServices";

export const EQUIPMENT_API_BASE_URL = "/api/equipment";

export const equipmentService = {

    async getEquipment(equipmentId: string) {
        try {
            let data: any = await APIServices.get(`${EQUIPMENT_API_BASE_URL}?equipmentId=${equipmentId}`);
            return { success: true, data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    // async getSelectEquipment(equipmentId: string) {
    //     try {
    //         let data: any = await APIServices.get(`${EQUIPMENT_API_BASE_URL}?equipmentId=${equipmentId}`);
    //         return { success: true, data };
    //     } catch (error: any) {
    //         if (error.name === "AbortError") {
    //             console.log("Request cancelled");
    //         }
    //         return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
    //     }
    // },

    async getEquipmentReadyForFixList() {
        try {
            let data: any = await APIServices.get(`${EQUIPMENT_API_BASE_URL}?ready-for-fix-list=true`);
            return { success: true, data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    async updateEquipment(equipment: Equipment) {
        try {
            let data: any = await APIServices.patch(EQUIPMENT_API_BASE_URL, equipment);
            // return { success: true, message: `แก้ไขหมวดหมู่ ${equipment.equipmentName} สำเร็จ` };
            return { success: true, message: data.message };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    async createEquipment(equipment: Equipment) {
        try {
            let data: any = await APIServices.post(EQUIPMENT_API_BASE_URL, equipment);
            // return { success: true, message: `สร้างหมวดหมู่ ${equipment.equipmentName} สำเร็จ` };
            return { success: true, message: data.message };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    async deleteEquipment(equipmentId: string) {
        try {
            let data: any = await APIServices.delete(`${EQUIPMENT_API_BASE_URL}?equipmentId=${equipmentId}`);
            // return { success: true, message: `ระบบได้ลบ ${response.equipmentName} แล้ว` };
            return { success: true, message: data.message };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.message || "เกิดข้อผิดพลาด" };
        }
    },
};