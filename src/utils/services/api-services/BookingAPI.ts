import { Booking } from "@/interfaces/Booking";
import APIServices from "../APIServices";

export const EMPLOYEE_API_BASE_URL = "/api/booking";

export const bookingService = {

    async getBooking(bookingId: string) {
        try {
            let data: any = await APIServices.get(`${EMPLOYEE_API_BASE_URL}?bookingId=${bookingId}`);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },

    async getSelectBooking() {
        try {
            let data: any = await APIServices.get(`${EMPLOYEE_API_BASE_URL}?selectBooking=true`);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },

    async updateBooking(Booking: Booking) {
        try {
            let data: any = await APIServices.patch(EMPLOYEE_API_BASE_URL, Booking);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },

    async createBooking(Booking: Booking) {
        try {
            let data: any = await APIServices.post(EMPLOYEE_API_BASE_URL, Booking);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            console.log('error')
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },

    async deleteBooking(bookingId: string) {
        try {
            const response: any = await APIServices.delete(`${EMPLOYEE_API_BASE_URL}?bookingId=${bookingId}`);
            return { success: true, message: `ระบบได้ลบ ${response.bookingName} แล้ว` };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },
};