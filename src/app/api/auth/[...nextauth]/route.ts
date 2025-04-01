import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not set');
}

if (!process.env.NEXTAUTH_URL) {
  throw new Error('NEXTAUTH_URL is not set');
}

const logWithContext = (message: string, data?: any) => {
  console.log(`[${new Date().toISOString()}] [NextAuth] ${message}`, data || '');
};

const isUsingProductionApi = process.env.NEXT_PUBLIC_API_URL?.includes('awsapprunner.com');

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        logWithContext("Authorize called with credentials:", {
          username: credentials?.username,
          password: credentials?.password ? '***' : undefined,
          environment: process.env.NODE_ENV,
          apiUrl: process.env.NEXT_PUBLIC_API_URL,
          isUsingProductionApi
        });

        if (!credentials?.username) {
          logWithContext("No username provided");
          return null;
        }

        try {
          if (credentials.password?.includes('.')) {
            logWithContext("Processing external token login");
            const user = {
              id: 'external',
              name: credentials.username,
              email: credentials.username,
              token: credentials.password,
              refreshToken: '',
            };
            logWithContext("External token user object:", { ...user, token: '***' });
            return user;
          }

          logWithContext("Processing regular email/password login");
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user/login`;
          logWithContext("Making request to:", apiUrl);

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.username,
              password: credentials.password,
            }),
          });

          logWithContext("API response status:", response.status);

          if (!response.ok) {
            logWithContext("Login failed", response.status);
            return null;
          }

          const data = await response.json();
          logWithContext("Login successful, returning user data");
          return {
            id: data.id,
            name: data.name,
            email: data.email,
            token: data.responseToken.token,
            refreshToken: data.responseToken.refreshToken,
          };
        } catch (error) {
          logWithContext("Login error:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, account }) {
      logWithContext("JWT callback", {
        hasUser: !!user,
        hasAccount: !!account,
        tokenKeys: Object.keys(token)
      });
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.token = user.token;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      logWithContext("Session callback", {
        session,
        tokenKeys: Object.keys(token),
      });
      if (token) {
        session.user = {
          id: (token as any).id,
          name: (token as any).name,
          email: (token as any).email,
          token: (token as any).token,
          refreshToken: (token as any).refreshToken,
        };
      }
      return session;
    },
  },
  // Explicit cookie configuration if needed
  cookies: {
    sessionToken: {
      name: process.env.NEXTAUTH_URL.startsWith('https')
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        secure: process.env.NEXTAUTH_URL.startsWith('https'),
        sameSite: 'lax',
        path: '/',
      },
    },
  },
  debug: false,
};

const handler = NextAuth(authOptions);

// IMPORTANT: export GET and POST to allow the proper HTTP methods.
export { handler as GET, handler as POST };