import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import whatsappService from '@/lib/whatsapp/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const state = whatsappService.getState();

    return NextResponse.json(state);
  } catch (error: any) {
    console.error('Error getting WhatsApp status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get WhatsApp status' },
      { status: 500 }
    );
  }
}
