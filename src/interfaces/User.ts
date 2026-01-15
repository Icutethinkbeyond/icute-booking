
import { Booking, RoleName, UserStatus } from '@prisma/client';
import { Store } from './Store';

export interface User {
  userId: string;
  email: string;
  password?: string;
  name: string;
  userStatus: UserStatus;

  roleId?: string;
  role?: Role;

  store?: Store;

  createdAt: string;
  updatedAt: string;
}

// Type สำหรับ Request Body
export interface ChangePassword {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    token: string;
}

export interface ResetPassword {
    newPassword?: string;
    confirmPassword?: string;
    token: string;
}

export interface Role {
  roleId: string;
  name: RoleName;
  description?: string;

  users?: User[];
  userIds: string[];

  createdAt: string;
  updatedAt: string;
}

export interface ResetPasswordToken {
  id: string;
  userId: string;
  user?: User;
  token: string;
  expiresAt: string; // ISO Date string
  used: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;

  // LINE Login Data
  lineUserId: string;
  displayName?: string;
  pictureUrl?: string;
  statusMessage?: string;
  isLineLinked: boolean;

  // Contact Data
  phone?: string;
  email?: string;

  booking?: Booking[];

  createdAt: string;
  updatedAt: string;
}


export interface Login {
  email: string | null;
  password: string | null;
}


// ค่าเริ่มต้นสำหรับ Role
// export const initialRole: Role = {
//   roleId: "",
//   name: RoleName.STOREADMIN,
//   description: undefined,
//   userIds: [],
//   createdAt: new Date(),
//   updatedAt: new Date(),
// };

export const initialLogin: Login = {
  email: "",
  password: ""
};

export const initialChangePassword: ChangePassword = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    token: ""
}

export const initialResetPassword: ResetPassword = {
    newPassword: "",
    confirmPassword: "",
    token: ""
}

export const initialResetPasswordToken: ResetPasswordToken = {
  id: '',
  userId: '',
  user: undefined,
  token: '',
  expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(), // ตัวอย่าง: กำหนดให้หมดอายุใน 1 ชั่วโมง
  used: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const initialRole: Role = {
  roleId: '',
  name: 'STAFF' as RoleName, // กำหนดชื่อ Role เริ่มต้น
  description: undefined,
  users: undefined,
  userIds: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// สมมติว่า UserStatus เป็น enum/type ที่คุณกำหนดไว้ เช่น "ACTIVE" | "INACTIVE" | "PENDING"
export const initialUser: User = {
  userId: '',
  email: '',
  password: undefined, // ไม่ต้องใส่ในค่า initial ถ้าเป็นการสร้าง/แก้ไขข้อมูลที่ไม่รวมถึงการเปลี่ยนรหัสผ่าน
  name: '',
  userStatus: 'ACTIVE' as UserStatus, // กำหนดสถานะเริ่มต้น
  roleId: undefined,
  role: undefined,
  store: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ค่าเริ่มต้นสำหรับ User
// export const initialUser: User = {
//   userId: "",
//   email: "",
//   password: "",
//   repassword: "",
//   name: "",
//   role: initialRole,
//   roleId: "",
//   store: 
//   userStatus: UserStatus.ACTIVE,


//   role       Role?      @relation(fields: [roleId], references: [roleId])
//   roleId     String?    @db.ObjectId

//   store       Store?   
// };
