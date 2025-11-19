import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

const WHATSAPP_SERVER_URL = process.env.WHATSAPP_SERVER_URL || 'http://localhost:3001';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(`${WHATSAPP_SERVER_URL}/disconnect`, {
      method: 'POST',
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error disconnecting WhatsApp:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect WhatsApp' },
      { status: 500 }
    );
  }
}
