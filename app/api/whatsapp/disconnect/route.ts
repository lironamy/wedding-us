import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import whatsappService from '@/lib/whatsapp/client';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await whatsappService.disconnect();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error disconnecting WhatsApp:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect WhatsApp' },
      { status: 500 }
    );
  }
}
