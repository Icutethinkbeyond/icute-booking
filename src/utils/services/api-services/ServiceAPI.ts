import { Service } from "@/interfaces/Store";
import APIServices from "../APIServices";

export const API_BASE_URL = "/api/services";

export const serviceService = {

    async getService(serviceId: string) {
        try {
            let data: any = await APIServices.get1only(`${API_BASE_URL}/detail?serviceId=${serviceId}`);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },

    // async getService(serviceId: string) {
    //     try {
    //         let data: any = await APIServices.get(`${API_BASE_URL}?serviceId=${serviceId}`);
    //         return { success: true, message: data.message, data: data.data };
    //     } catch (error: any) {
    //         if (error.name === "AbortError") {
    //             console.log("Request cancelled");
    //         }
    //         return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
    //     }
    // },

    async getSelectService() {
        try {
            let data: any = await APIServices.get(`${API_BASE_URL}?selectService=true`);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },

    async updateService(service: Service) {
        try {
            let data: any = await APIServices.patch(API_BASE_URL, service);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },

    async createService(service: Service) {
        try {
            let data: any = await APIServices.post(`${API_BASE_URL}`, service);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            console.log(error.response.data)
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response.data?.message || "เกิดข้อผิดพลาด" };
        }
    },

    async deleteService(serviceId: string) {
        try {
            const data: any = await APIServices.delete(`${API_BASE_URL}?serviceId=${serviceId}`);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },
};