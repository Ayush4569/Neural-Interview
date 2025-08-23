import NextAuth, { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma" 


export const authOptions:NextAuthOptions = {
  adapter:PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session:{
    strategy: "jwt",
    maxAge: 24 * 60 * 60,         
    updateAge: 12 * 60 * 60, 
  },
  callbacks:{
    jwt:async({token,user,account,profile})=>{
      if (user) {
        token.id = user.id       
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages:{
    signIn:"/login",
    error:"/error"
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST };
