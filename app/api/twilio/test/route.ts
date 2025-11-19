import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { getTwilioService } from '@/lib/services/twilio-whatsapp';

/**
 * POST /api/twilio/test
 * Send a test WhatsApp message to verify Twilio setup
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { phoneNumber, message } = body;

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Get Twilio service
    let twilioService;
    try {
      twilioService = getTwilioService();
    } catch (error: any) {
      return NextResponse.json(
        {
          error: 'Twilio not configured',
          message: 'Please configure Twilio credentials in environment variables',
          details: error.message
        },
        { status: 500 }
      );
    }

    console.log('📱 [API] Sending test message to:', phoneNumber);

    const result = await twilioService.sendMessage(phoneNumber, message);

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        status: result.status,
        message: 'Test message sent successfully!',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('❌ [API] Test message error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send test message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
