import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not set');
}

if (!process.env.NEXTAUTH_URL) {
  throw new Error('NEXTAUTH_URL is not set');
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        try {
          // First try regular login
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.username,
              password: credentials.password,
            }),
          });

          if (response.ok) {
            const user = await response.json();
            return user;
          }

          // If regular login fails, try external login
          const externalResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/login/external`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.username,
              password: credentials.password,
            }),
          });

          if (externalResponse.ok) {
            const user = await externalResponse.json();
            return user;
          }

          throw new Error('Invalid email or password');
        } catch (error) {
          console.error('Login error:', error);
          throw new Error('An error occurred during login');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
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
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.token = token.token as string;
        session.user.refreshToken = token.refreshToken as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('Sign in:', { user, account, profile, isNewUser });
    },
    async signOut({ session, token }) {
      console.log('Sign out:', { session, token });
    },
    async createUser({ user }) {
      console.log('Create user:', user);
    },
    async linkAccount({ user, account, profile }) {
      console.log('Link account:', { user, account, profile });
    },
    async session({ session, token }) {
      console.log('Session:', { session, token });
    },
    async updateUser({ user }) {
      console.log('Update user:', user);
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }