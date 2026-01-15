import { StoreRegister } from "@/interfaces/Store";
import APIServices from "../APIServices";
import { ResetPassword } from "@/interfaces/User";

export const AUTH_API_BASE_URL = "/api/register";

export const authService = {

    async registerStore(store: StoreRegister) {
        try {
            let data: any = await APIServices.post(`${AUTH_API_BASE_URL}/shop`, store);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            console.log(error.response.data)
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response.data?.message || "เกิดข้อผิดพลาด" };
        }
    },

    async resendVerifyEmail() {
        try {
            let data: any = await APIServices.get(`/api/resend-verify`);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            console.log(error.response.data)
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response.data?.message || "เกิดข้อผิดพลาด" };
        }
    },

    async sendForgotPassword(email: string) {
        try {
            let data: any = await APIServices.post(`/api/forgot-password`, email);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            console.log(error.response.data)
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response.data?.message || "เกิดข้อผิดพลาด" };
        }
    },

    async resetPassword(value: ResetPassword) {
        try {
            let data: any = await APIServices.post(`/api/reset-password`, value);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            console.log(error.response.data)
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response.data?.message || "เกิดข้อผิดพลาด" };
        }
    },

}