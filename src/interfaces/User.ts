
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
