import { RoleName, UserStatus } from "@prisma/client";

// Interface สำหรับ User
export interface User {
  userId: string;
  email: string;
  password?: string;
  repassword?: string;
  name: string;
  department: string;
  position: string;
  image?: string;
  manDay?: number;
  phone?: string;
  role: Role;
  roleId: string;
  roleName?: string;
  userStatus: UserStatus;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface สำหรับ Role
export interface Role {
  roleId: string;
  name: RoleName;
  description?: string;
  userIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Login {
  email: string | null;
  password: string | null;
}

export interface EngineerSelect {
  name: string;
  userId: string;
  manHour?: number | null;
}


// ค่าเริ่มต้นสำหรับ Role
export const initialRole: Role = {
  roleId: "",
  name: RoleName.User,
  description: undefined,
  userIds: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const initialLogin: Login = {
  email: "",
  password: ""
};

// ค่าเริ่มต้นสำหรับ User
export const initialUser: User = {
  userId: "",
  email: "",
  password: "",
  repassword: "",
  name: "",
  department: "",
  position: "",
  image: "",
  phone: "",
  manDay: 0,
  role: initialRole,
  roleId: "",
  roleName: "",
  userStatus: UserStatus.Active,
  address: "",
  createdAt: new Date(),
  updatedAt: new Date(),
};
