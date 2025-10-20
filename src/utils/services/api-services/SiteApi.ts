import { Site } from "@/interfaces/Site";
import APIServices from "../APIServices";

export const SITE_API_BASE_URL = "/api/site";

export const siteService = {

    async getSite(siteId: string) {
        try {
            let data: any = await APIServices.get(`${SITE_API_BASE_URL}?siteId=${siteId}`);
            return { success: true, data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    async getSelectSite() {
        try {
            let data: any = await APIServices.get(`${SITE_API_BASE_URL}?getbycharacter=true`);
            return { success: true, data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    async updateSite(site: Site) {
        try {
            await APIServices.patch(SITE_API_BASE_URL, site);
            return { success: true, message: `แก้ไขหมวดหมู่ ${site.siteName} สำเร็จ` };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    async createSite(site: Site) {
        try {
            await APIServices.post(SITE_API_BASE_URL, site);
            return { success: true, message: `สร้างหมวดหมู่ ${site.siteName} สำเร็จ` };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    async deleteSite(siteId: string) {
        try {
            const response: any = await APIServices.delete(`${SITE_API_BASE_URL}?siteId=${siteId}`);
            return { success: true, message: `ระบบได้ลบ ${response.siteName} แล้ว` };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.message || "เกิดข้อผิดพลาด" };
        }
    },
};