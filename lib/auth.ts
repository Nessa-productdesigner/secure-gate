import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { loginSchema } from "./validations";
import { rateLimit } from "./rate-limit";
import { getClientIp } from "./request-ip";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/signup",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const ip = req?.headers ? getClientIp({ headers: req.headers }) : "unknown";
        const { success: withinLimit } = await rateLimit(`login:${ip}`);
        if (!withinLimit) return null;

        const user = await db.user.findUnique({
          where: { email },
          select: { id: true, email: true, password: true, emailVerified: true },
        });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        if (!user.emailVerified) return null;

        return {
          id: user.id,
          email: user.email,
          emailVerified: true,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.emailVerified = true;
      }

      if (trigger === "update" && token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { emailVerified: true },
        });
        token.emailVerified = !!dbUser?.emailVerified;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.emailVerified = token.emailVerified as boolean;
      }
      return session;
    },
  },
};
