import 'next-auth';

declare module 'next-auth' {
  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    token?: string;
    refreshToken?: string;
  }

  interface Session {
    user: User;
  }
} 