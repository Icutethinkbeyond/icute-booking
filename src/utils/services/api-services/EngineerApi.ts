import { User } from "@/interfaces/User";
import APIServices from "../APIServices";

export const CATEGORY_API_BASE_URL = "/api/user/engineer";

export const engineerService = {

    async getEngineer(engineerId: string) {
        try {
            let data: any = await APIServices.get(`${CATEGORY_API_BASE_URL}?engineerId=${engineerId}`);
            return { success: true, data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    async getSelectEngineer() {
        try {
            let data: any = await APIServices.get(`${CATEGORY_API_BASE_URL}?getbycharacter=true`);
            return { success: true, data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    async updateEngineer(engineer: User) {
        try {
            await APIServices.patch(CATEGORY_API_BASE_URL, engineer);
            return { success: true, message: `แก้ไขหมวดหมู่ ${engineer.name} สำเร็จ` };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    async createEngineer(engineer: User) {
        try {
            await APIServices.post(CATEGORY_API_BASE_URL, engineer);
            return { success: true, message: `สร้างหมวดหมู่ ${engineer.name} สำเร็จ` };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    async deleteEngineer(engineerId: string) {
        try {
            const response: any = await APIServices.delete(`${CATEGORY_API_BASE_URL}?engineerId=${engineerId}`);
            return { success: true, message: `ระบบได้ลบ ${response.name} แล้ว` };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.message || "เกิดข้อผิดพลาด" };
        }
    },
};