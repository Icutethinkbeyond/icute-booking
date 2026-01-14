import { Session } from 'next-auth';

interface User {
  id: string;
  email: string;
  role: string;
  roleId: string;
  storeName: string
  storeId: string
  emailVerified: boolean | string
}

declare module 'next-auth' {

  interface User {
    roleId?: string;
    roleName?: string;
    storeName?: string;
    storeId?: string;
    emailVerified: boolean | string
  }

  interface Session {
    user: User;
  }
}
