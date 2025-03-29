import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from 'next-auth/providers/credentials';

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Authorize called with credentials:", credentials);
        if (!credentials?.username) {
          console.log("No username provided");
          return null;
        }

        try {
          // If the password is a token, it's an external login
          if (credentials.password?.includes('.')) {
            console.log("Processing external login with token");
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
          console.log("Processing regular login flow");
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
            console.log("Login successful, returning user data");
            return {
              id: data.id,
              name: data.name,
              email: data.email,
              token: data.responseToken.token,
              refreshToken: data.responseToken.refreshToken,
            };
          }
          console.error('Auth failed:', data);
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error(error instanceof Error ? error.message : "Authentication error");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback - token:", token);
      console.log("JWT callback - user:", user);
      if (user) {
        token.accessToken = user.token;
        token.refreshToken = user.refreshToken;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - session:", session);
      console.log("Session callback - token:", token);
      try {
        session.user = {
          ...session.user,
          token: token.accessToken as string | undefined,
          refreshToken: token.refreshToken as string | undefined,
          name: token.name as string | undefined,
          email: token.email as string | undefined,
        };
        console.log("Session callback - final session:", session);
        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        throw error;
      }
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback - url:", url);
      console.log("Redirect callback - baseUrl:", baseUrl);
      // If the url is relative, prefix it with the base URL
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // If the url is from our domain, allow it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Default to the base URL
      return baseUrl;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  debug: true, // Enable debug mode to see more detailed logs
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }