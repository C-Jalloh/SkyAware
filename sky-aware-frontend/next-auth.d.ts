import type { User } from './types/user';
import type { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string; // add id
    } & DefaultSession['user'];
    accessToken: string;
  }

  interface User extends DefaultUser {
    id: string;
    accessToken: string;
    email: string;
    name: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    accessToken: string;
    email: string;
    name: string;
    user: User;
  }
}
