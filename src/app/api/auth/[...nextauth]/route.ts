import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          redirect_uri: `${process.env.NEXT_PUBLIC_API_URL}/signin-google`,
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Authorize called with credentials:", credentials);
        if (!credentials?.username) return null;

        try {
          // If the password is a token, it's an external login
          if (credentials.password?.includes('.')) {
            // For external login, we'll use the token directly without password verification
            return {
              id: 'external',
              name: credentials.username,
              email: credentials.username,
              token: credentials.password,
              refreshToken: '', // External login doesn't need refresh token
            };
          }

          // Regular login flow
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.username,
              password: credentials.password,
            }),
          });
          console.log("API response status:", response.status);
          const data = await response.json();
          console.log("API response data:", data);

          if (response.ok && data?.responseToken) {
            return {
              id: data.id,
              name: data.name,
              email: data.email,
              token: data.responseToken.token,
              refreshToken: data.responseToken.refreshToken,
            };
          }
          // Instead of returning null (which triggers default error handling),
          // throw a specific error object that we can handle 
          console.error('Auth failed:', data);
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          // Explicitly throw with a message we can handle
          throw new Error(error instanceof Error ? error.message : "Authentication error");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        token: token.accessToken as string | undefined,
        refreshToken: token.refreshToken as string | undefined,
      };
      return session;
    },
    // Add this to prevent default redirects on errors
    async redirect({ url, baseUrl }) {
      // Always return the original URL to prevent NextAuth's redirection logic
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },
  session: {
    strategy: 'jwt',
  },
  // Add custom pages to override default behaviors
  pages: {
    signIn: '/login',
    error: '/login', // Redirect back to login on error instead of home
  },
  // Add this to ensure errors don't cause redirects
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }