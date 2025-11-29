import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';

export async function getSession() {
  const session = await getServerSession(authOptions);

  // Debug logging for session issues
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_AUTH === 'true') {
    console.log('[getSession] Session result:', session ? `User: ${session.user?.email}` : 'null');
  }

  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return session.user;
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== 'admin') {
    throw new Error('Forbidden - Admin access required');
  }

  return user;
}
