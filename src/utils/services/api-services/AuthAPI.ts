import { StoreRegister } from "@/interfaces/Store";
import APIServices from "../APIServices";

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

}