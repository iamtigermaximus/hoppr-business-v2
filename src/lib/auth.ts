import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        // Only BAR_MANAGER and SUPER_ADMIN can access business app
        if (user.role !== "BAR_MANAGER" && user.role !== "SUPER_ADMIN") {
          throw new Error("No business access. Please use the Hoppr consumer app.");
        }
        return { id: user.id, email: user.email, name: user.username, image: user.avatarUrl };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = (token as any).role;
        session.user.image = (token as any).picture as string | null | undefined;
        session.user.name = (token as any).name as string | null | undefined;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        (token as any).picture = user.image;
        (token as any).name = user.name;
        const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
        (token as any).role = dbUser?.role || "CONSUMER";
      }
      if (trigger === "update" && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { username: true, avatarUrl: true, role: true },
        });
        if (dbUser) {
          (token as any).picture = dbUser.avatarUrl;
          (token as any).name = dbUser.username;
          (token as any).role = dbUser.role;
        }
      }
      return token;
    },
  },
  pages: { signIn: "/login" },
};
