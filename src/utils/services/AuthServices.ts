// import axios, { AxiosResponse } from 'axios';
// import { CommonLoginType, LoginResponse } from "../interface/Auth.interface"
// import { ErrorType } from '../interface/Log.Interface';
// import md5 from "md5"
// import api from '../config/axiosConfig';
// import { FileService } from './FileService';
// import { DateTimeService } from './TimeServices';

// export class AuthService {

//     private alias = "API_Huawei";
//     private password = "123456";
//     private comid: number = 2
//     private compvtkey: string = "589625dce895454dbff9782c299db156"
//     private screctkey: string = "f1cd9351930d4e589922edbcf3b09a7c"

//     private makeSignLogin(password: string, ts: string): string {
//         return md5(`alias=${this.alias}&comid=${this.comid}&compvtkey=${this.compvtkey}&password=${password}&ts=${ts}&key=${this.screctkey}`)
//     }

//     private makeCommonLogin(sign: string, ts: string): CommonLoginType {
//         return {
//             compvtkey: this.compvtkey,
//             comid: this.comid.toString(),
//             sign: sign,
//             ts: ts.toString(),
//         }
//     }

//     private async sendLogin(password: string, _common: CommonLoginType): Promise<string> {
//         try {

//             const fileService = new FileService('../../../processLog.txt')

//             const interceptor = api.interceptors.request.use((config) => {
//                 config.headers['common'] = JSON.stringify(_common); // กำหนดค่า common
//                 return config;
//             });

//             const alias = this.alias;

//             const payload: any = {};
//             const response: AxiosResponse<LoginResponse> = await api.post(`/login`, payload, {
//                 params: {
//                     alias,
//                     password
//                 }
//             });

//             // ลบ interceptor หลังคำขอเสร็จสิ้น
//             api.interceptors.request.eject(interceptor);

//             if (response.data.msg === "ok") {
//                 console.log("Login Successfully")
//                 await fileService.appendToFile(ErrorType.LOGINSUCCESS, response.data.msg);
//                 const sid = response.data.result.sid
//                 if (sid) {
//                     return sid;
//                 } else {
//                     console.log(response.data)
//                     throw new Error(`sid is null`);
//                 }
//             } else {
//                 await fileService.appendToFile(ErrorType.LOGINERROR, response.data.msg);
//                 throw new Error(`Login failed:`);
//             }
//         } catch (error) {
//             console.error('Error during login:', error);
//             throw new Error('Unable to login. Please check your credentials and try again.');
//         }
//     }

//     async getSID(): Promise<string> {

//         const timeService = new DateTimeService();
//         const ts: string = (timeService.convertToTimestamps()).toString();

//         const hash: string = md5(this.password);
//         const sign: string = this.makeSignLogin(hash, ts);
//         const common: CommonLoginType = this.makeCommonLogin(sign, ts)
//         console.log("LoginCommon: ",common)
//         const sid: string = await this.sendLogin(hash, common);

//         console.log("sid: ", sid)

//         return sid;
//     }


// }
