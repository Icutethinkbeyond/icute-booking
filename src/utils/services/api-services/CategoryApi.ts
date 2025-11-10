import { Category } from "@/interfaces/Category";
import APIServices from "../APIServices";

export const CATEGORY_API_BASE_URL = "/api/equipment/category";

export const categoryService = {

    async getCategory(categoryId: string) {
        try {
            let data: any = await APIServices.get(`${CATEGORY_API_BASE_URL}?categoryId=${categoryId}`);
            return { success: true, data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    async getSelectCategory() {
        try {
            let data: any = await APIServices.get(`${CATEGORY_API_BASE_URL}?selectCategory=true`);
            return { success: true, data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    async updateCategory(category: Category) {
        try {
            let data: any = await APIServices.patch(CATEGORY_API_BASE_URL, category);
            return { success: true, message: data.message };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    async createCategory(category: Category) {
        try {
            let data: any = await APIServices.post(CATEGORY_API_BASE_URL, category);
            return { success: true, message: data.message };
        } catch (error: any) {
            console.log('error')
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
        }
    },

    async deleteCategory(categoryId: string) {
        try {
            const response: any = await APIServices.delete(`${CATEGORY_API_BASE_URL}?categoryId=${categoryId}`);
            return { success: true, message: `ระบบได้ลบ ${response.categoryName} แล้ว` };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.message || "เกิดข้อผิดพลาด" };
        }
    },
};