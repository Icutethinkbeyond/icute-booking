import { Employee } from "@/interfaces/Store";
import APIServices from "../APIServices";

export const EMPLOYEE_API_BASE_URL = "/api/employees";

export const employeeService = {

    // async getEmployees() {
    //     try {
    //         let data: any = await APIServices.get(`${EMPLOYEE_API_BASE_URL}`);
    //         return { success: true, message: data.message, data: data.data };
    //     } catch (error: any) {
    //         if (error.name === "AbortError") {
    //             console.log("Request cancelled");
    //         }
    //         return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
    //     }
    // },


    async getEmployee(employeeId: string) {
        try {
            let data: any = await APIServices.get1only(`${EMPLOYEE_API_BASE_URL}/detail?employeeId=${employeeId}`);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },

    async getEmployeeList() {
        try {
            let data: any = await APIServices.get1only(`${EMPLOYEE_API_BASE_URL}/simple`);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },

    async updateEmployee(employee: Employee) {
        try {
            let data: any = await APIServices.patch(EMPLOYEE_API_BASE_URL, employee);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            // console.log(error.response?.data)
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },

    async createEmployee(employee: Employee) {
        try {
            let data: any = await APIServices.post(EMPLOYEE_API_BASE_URL, employee);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            console.log('error')
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },

    async deleteEmployee(employeeId: string) {
        try {
            const data: any = await APIServices.delete(`${EMPLOYEE_API_BASE_URL}?employeeId=${employeeId}`);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data.message || "เกิดข้อผิดพลาด" };
        }
    },
};