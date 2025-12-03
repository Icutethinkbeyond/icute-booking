import { DefaultOperatingHour, Store } from "@/interfaces/Store";
import APIServices from "../APIServices";
import { initialChangePassword, ChangePassword } from "@/interfaces/User";

export const STORE_API_BASE_URL = "/api/store";

export const storeService = {

    async getStore() {
        try {
            let data: any = await APIServices.get1only(`${STORE_API_BASE_URL}`);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },

    async getTimeSetting() {
        try {
            let data: any = await APIServices.get1only(`${STORE_API_BASE_URL}/timesetting`);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },

    // async getSelectStore() {
    //     try {
    //         let data: any = await APIServices.get(`${STORE_API_BASE_URL}?selectStore=true`);
    //         return { success: true, message: data.message };
    //     } catch (error: any) {
    //         if (error.name === "AbortError") {
    //             console.log("Request cancelled");
    //         }
    //         return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
    //     }
    // },

    async updatePassword(password: ChangePassword) {
        try {
            let data: any = await APIServices.patch(`${STORE_API_BASE_URL}/change-password`, password);
            return { success: true, message: data.message };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },

    async updateStore(Store: Store) {
        try {
            let data: any = await APIServices.patch(STORE_API_BASE_URL, Store);
            return { success: true, message: data.message };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },

    async updateTimeSettingStore(operatingHour: DefaultOperatingHour) {
        try {
            let data: any = await APIServices.patch(`${STORE_API_BASE_URL}/timesetting`, operatingHour);
            return { success: true, message: data.message };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },

    async updateLineSettingStore(Store: Store) {
        try {
            let data: any = await APIServices.patch(`${STORE_API_BASE_URL}/line`, Store);
            return { success: true, message: data.message };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },

    async createStore(Store: Store) {
        try {
            let data: any = await APIServices.post(STORE_API_BASE_URL, Store);
            return { success: true, message: data.message };
        } catch (error: any) {
            console.log('error')
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },

    async deleteStore(storeId: string) {
        try {
            const response: any = await APIServices.delete(`${STORE_API_BASE_URL}?storeId=${storeId}`);
            return { success: true, message: `ระบบได้ลบ ${response.storeName} แล้ว` };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },
};