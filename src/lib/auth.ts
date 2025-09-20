import { Pool } from "pg";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import bcrypt from "bcrypt";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: pool,
  advanced: {
    database: {
      generateId: false,
    },
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 12);
      },
      verify: async (data) => {
        return await bcrypt.compare(data.password, data.hash);
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache for performance
    },
  },
  plugins: [nextCookies()],
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  callbacks: {
    session: async ({ session, user }: any) => {
      // Include user role in the session
      if (user) {
        session.user.role = user.role || 'operator';
        // Add operator info to session
        session.user.operatorUid = user.aadhaar_number;
        session.user.operatorName = user.name;
      }
      return session;
    },
  },
});
