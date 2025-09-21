import { Pool } from "pg";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import bcrypt from "bcrypt";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: pool,
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
    cookieAttributes: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
    },
  },
  plugins: [nextCookies()],
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
  },
  callbacks: {
    session: async ({ session, user }: any) => {
      console.log('🔧 SESSION CALLBACK CALLED for user:', user.id);
      // Fetch complete user data from database to get role and other custom fields
      try {
        const result = await pool.query(
          'SELECT role, aadhaar_number, name FROM "user" WHERE id = $1',
          [user.id]
        );

        const dbUser = result.rows[0];
        console.log('🔧 SESSION CALLBACK - DB User:', dbUser);

        if (dbUser) {
          // Include user role in the session
          session.user.role = dbUser.role || 'operator';
          // Add operator info to session
          session.user.operatorUid = dbUser.aadhaar_number;
          session.user.operatorName = dbUser.name;
          console.log('🔧 SESSION CALLBACK - Updated role:', session.user.role);
        } else {
          console.log('🔧 SESSION CALLBACK - No user found, using default role');
          session.user.role = 'operator'; // Default fallback
        }
      } catch (error) {
        console.error('🔧 SESSION CALLBACK - Error:', error);
        session.user.role = 'operator'; // Default fallback
      }

      return session;
    },
  },
});