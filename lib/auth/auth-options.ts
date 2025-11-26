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

        if (!user || !user.password) {
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
      console.log('=== JWT Callback ===');
      console.log('user:', user ? { id: user.id, email: user.email, role: user.role } : 'undefined');
      console.log('account provider:', account?.provider);
      console.log('token before:', { id: token.id, email: token.email, role: token.role });

      if (user) {
        // For Google login, fetch the actual MongoDB user
        if (account?.provider === 'google') {
          await dbConnect();
          const dbUser = await User.findOne({ email: user.email });
          console.log('Google login - dbUser found:', dbUser ? { _id: dbUser._id.toString(), email: dbUser.email, role: dbUser.role } : 'not found');
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

      console.log('token after:', { id: token.id, email: token.email, role: token.role });

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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};
