import APIServices from "../APIServices";

export const CATEGORY_API_BASE_URL = "/api/report";

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

    // async updateCategory(category: Category) {
    //     try {
    //         await APIServices.patch(CATEGORY_API_BASE_URL, category);
    //         return { success: true, message: `แก้ไขหมวดหมู่ ${category.categoryName} สำเร็จ` };
    //     } catch (error: any) {
    //         if (error.name === "AbortError") {
    //             console.log("Request cancelled");
    //         }
    //         return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
    //     }
    // },

    // async createCategory(category: Category) {
    //     try {
    //         await APIServices.post(CATEGORY_API_BASE_URL, category);
    //         return { success: true, message: `สร้างหมวดหมู่ ${category.categoryName} สำเร็จ` };
    //     } catch (error: any) {
    //         if (error.name === "AbortError") {
    //             console.log("Request cancelled");
    //         }
    //         return { success: false, message: error.response?.data || "เกิดข้อผิดพลาด" };
    //     }
    // },

    // async deleteCategory(categoryId: string) {
    //     try {
    //         const response: any = await APIServices.delete(`${CATEGORY_API_BASE_URL}?categoryId=${categoryId}`);
    //         return { success: true, message: `ระบบได้ลบ ${response.categoryName} แล้ว` };
    //     } catch (error: any) {
    //         if (error.name === "AbortError") {
    //             console.log("Request cancelled");
    //         }
    //         return { success: false, message: error.message || "เกิดข้อผิดพลาด" };
    //     }
    // },
};