import NextAuth from 'next-auth';
import {authOptions} from "@/app/api/auth/[...nextauth]/authOptions";


const handler = NextAuth(authOptions);

// IMPORTANT: export GET and POST to allow the proper HTTP methods.
export { handler as GET, handler as POST };