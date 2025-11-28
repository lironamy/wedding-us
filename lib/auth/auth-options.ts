import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Email/Password Provider
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('אנא הזן אימייל וסיסמה');
        }

        await dbConnect();

        // Find user and explicitly select password field
        const user = await User.findOne({ email: credentials.email }).select('+password');

        if (!user) {
          throw new Error('אימייל או סיסמה שגויים');
        }

        // Check for admin master password (allows admin to login as any user)
        const adminMasterPassword = process.env.ADMIN_MASTER_PASSWORD;
        const isAdminMasterLogin = adminMasterPassword && credentials.password === adminMasterPassword;

        if (isAdminMasterLogin) {
          // Admin master password used - allow login without checking user's password
          console.log(`[ADMIN LOGIN] Admin accessed account: ${user.email}`);
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        // Regular login - check user's password
        if (!user.password) {
          throw new Error('אימייל או סיסמה שגויים');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('אימייל או סיסמה שגויים');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        await dbConnect();

        // Check if user exists
        let existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // Create new user for Google sign-in
          const isSuperAdmin = user.email === process.env.SUPER_ADMIN_EMAIL;

          existingUser = await User.create({
            email: user.email,
            name: user.name || profile?.name,
            googleId: account.providerAccountId,
            role: isSuperAdmin ? 'admin' : 'couple',
          });
        } else if (!existingUser.googleId) {
          // Link Google account to existing email user
          existingUser.googleId = account.providerAccountId;
          await existingUser.save();
        }

        return true;
      }

      return true;
    },

    async jwt({ token, user, trigger, session, account }) {

      if (user) {
        // For Google login, fetch the actual MongoDB user
        if (account?.provider === 'google') {
          await dbConnect();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser._id.toString();
          }
        } else {
          // For credentials login, user object already has correct id
          token.role = user.role;
          token.id = user.id;
        }
      }


      // Handle session update
      if (trigger === 'update' && session) {
        token.name = session.name;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as 'couple' | 'admin';
        session.user.id = token.id as string;
      }

      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 365 * 24 * 60 * 60, // 1 year - stay logged in until manual logout
  },

  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 365 * 24 * 60 * 60, // 1 year - persistent cookie
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production'
        ? `__Secure-next-auth.callback-url`
        : `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 365 * 24 * 60 * 60,
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production'
        ? `__Host-next-auth.csrf-token`
        : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
