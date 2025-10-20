import { Session } from 'next-auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  // accessToken: string;
}

declare module 'next-auth' {
  interface Session {
    user: User;
  }
}
